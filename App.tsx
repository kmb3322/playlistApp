// Music List에 노래를 추가할 버튼을 추가한 코드

import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image, TouchableOpacity, Linking, TextInput, Alert, Button, Modal, Animated, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper'; // 추가
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getYouTubeThumbnail, getYouTubeUrl } from './utils/youtubeUtils';
import { db } from './firebaseConfig'; // Firestore 초기화 파일
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// 스크린 import
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';

// Home 화면 컴포넌트
function HomeScreenComponent() {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchText, setSearchText] = React.useState('');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [newSongTitle, setNewSongTitle] = React.useState('');
  const [newSongArtist, setNewSongArtist] = React.useState('');
  const [newSongId, setNewSongId] = React.useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = React.useState(null);
  // 여러 스와이프 진행 상태 관리
  const [swipeProgress, setSwipeProgress] = React.useState([]);
  const swipeableRefs = React.useRef([]); // 각 Swipeable을 저장할 ref 배열

  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const allSongs: Song[] = [];

        for (const categoryDoc of categoriesSnapshot.docs) {
          const songsCollection = collection(db, 'categories', categoryDoc.id, 'songs');
          const songsSnapshot = await getDocs(query(songsCollection, orderBy('count', 'desc')));

          songsSnapshot.forEach(songDoc => {
            const data = songDoc.data();
            if (data.youtubeId) {
              allSongs.push({
                id: songDoc.id,
                title: data.title,
                artist: data.artist,
                youtubeId: data.youtubeId,
                count: data.count || 0,
                isYES: data.isYES || false,
              });
            } else {
              console.warn(`Song with ID ${songDoc.id} is missing youtubeId.`);
            }
          });
        }

        console.log('Fetched Songs:', allSongs); // 디버깅 로그 추가

        if (allSongs.length === 0) {
          console.warn('No songs fetched from Firestore.');
        }

        setSongs(allSongs);
        setLoading(false);
        const sortedSongs = [...allSongs].sort((a, b) => a.youtubeId - b.youtubeId);
        setSongs(sortedSongs);
        setSwipeProgress(sortedSongs.map(() => new Animated.Value(0)));
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('노래를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (songs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>노래가 없습니다.</Text>
      </View>
    );
  }

  // 검색어에 맞게 필터링된 음악 데이터
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchText.toLowerCase())
  );

  // 음악 목록 셔플 함수
  const shuffleSongs = () => {
    swipeableRefs.current.forEach((swipeable) => {
      if(swipeable != null)
        swipeable.close(); // open 상태인 스와이프를 닫음
    });
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    setSongs(shuffledSongs);
    setSwipeProgress(songs.map(() => new Animated.Value(0)));
  };

  // 유튜브 링크 열기
  const handleMusicClick = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  // 노래 삭제 처리
  const handleDeleteSong = () => {
    // 삭제된 항목의 swipeProgress를 초기화
    setSwipeProgress((prevProgress) => {
      const updatedProgress = [...prevProgress];
      updatedProgress.splice(selectedSongIndex, 1); // 삭제된 항목의 progress 초기화
      return updatedProgress;
    });

    setSongs((prevSongs) => {
      const updatedSongs = [...prevSongs];
      updatedSongs.splice(selectedSongIndex, 1);
      return updatedSongs;
    });
    setIsDeleteModalVisible(false);
  };

  // 노래 추가 처리
  const handleAddSong = () => {
    if (newSongTitle.trim() && newSongArtist.trim() && newSongId.trim()) {
      if (songs.some((song) => song.youtubeId === newSongId)) {
        Alert.alert('Invalid Input', 'This song already exists in the playlist');
        return;
      }
      const newSong = {
        title: newSongTitle,
        artist: newSongArtist,
        id: songs.length + 1,
        youtubeId: newSongId
      };
      setSongs((prevSongs) => [...prevSongs, newSong]);
      setSwipeProgress((prevSwipeProgress) => [...prevSwipeProgress, new Animated.Value(0)]);
      setNewSongTitle('');
      setNewSongArtist('');
      setNewSongId('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Invalid Input', 'Please provide both title and artist.');
    }
  };

  const handleCancelDelete = () => {
      setIsDeleteModalVisible(false);
      setSelectedSongIndex(null);
    };

  //cancel버튼 처리
  const handleCancel = () => {
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongId('');
    setIsModalVisible(false);
  };

  // 스와이프 삭제 기능
  const renderRightActions = (index) => {
    return (
      <Animated.View style={[styles.deleteButton, { opacity: swipeProgress[index] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setSelectedSongIndex(index);
            setIsDeleteModalVisible(true);
          }}
        >
          <Icon name="trash" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSwipeProgress = (index, progress) => {
    Animated.timing(swipeProgress[index], {
      toValue: progress, // 스와이프 진행 비율에 맞게 애니메이션 적용
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 및 버튼 */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>내 주변의</Text>

        {/* 음악 추가 버튼 */}
        <TouchableOpacity
         style={styles.addButton}
         onPress={() => setIsModalVisible(true)}
         >
          <Icon name="add" size={20} color="#000" />
          </TouchableOpacity>
         </View>

         <View style={styles.headerContainer2}>

        <Text style={styles.title2}>{'\n'}플레이리스트</Text>
        {/* 셔플 버튼 */}
        <TouchableOpacity
          style={styles.shuffleButton}
          onPress={shuffleSongs}
        >
          <Icon name="shuffle" size={20} color="#000" />
        </TouchableOpacity>
         </View>




      {/* 검색 입력란 */}
      <TextInput
        style={styles.searchInput}
        placeholder="검색할 음악"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />

      {/* 음악 리스트 출력 */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.youtubeId}
        renderItem={({ item, index }) => (
          <Swipeable
            ref={(ref) => (swipeableRefs.current[index] = ref)} // ref를 배열에 저장
            renderRightActions={() => renderRightActions(index)}
            onSwipeableWillOpen={() => handleSwipeProgress(index, 1)} // 스와이프 시작 시 애니메이션 시작
            onSwipeableWillClose={() => handleSwipeProgress(index, 0)} // 스와이프 종료 시 애니메이션 종료
          >
            <TouchableOpacity onPress={() => handleMusicClick(getYouTubeUrl(item.youtubeId))}>
              <View style={styles.item}>
                <View style={styles.albumCover}>
                  <Image
                    source={{ uri: getYouTubeThumbnail(item.youtubeId) }}
                    style={styles.thumbnail}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.musicTitle}>{item.title}</Text>
                  <Text style={styles.musicArtist}>{item.artist}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
      />

      {/* 노래 추가 모달 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>음악 추가하기</Text>
            <TextInput
              style={styles.input}
              placeholder="음악 제목"
              value={newSongTitle}
              onChangeText={setNewSongTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="아티스트"
              value={newSongArtist}
              onChangeText={setNewSongArtist}
            />
            <TextInput
              style={styles.input}
              placeholder="Youtube id"
              value={newSongId}
              onChangeText={setNewSongId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddSong}>
                <Text style={styles.saveButtonText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 삭제 확인 모달 */}
        <Modal
          visible={isDeleteModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Are you sure you want to delete this song?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDelete}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleDeleteSong}>
                  <Text style={styles.saveButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </View>
  );
}

// Bottom Tabs 생성
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider> {/* 추가 */}
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false, // 헤더 제거
              tabBarShowLabel: false, // 라벨 숨기기

              tabBarIcon: ({ color, size }) => {
                let iconName = '';

                if (route.name === 'Home') {
                  iconName = 'musical-note';
                } else if (route.name === 'Search') {
                  iconName = 'trophy';
                } else if (route.name === 'Profile') {
                  iconName = 'images';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6200ee', // 활성 탭 색상
              tabBarInactiveTintColor: 'gray', // 비활성 탭 색상
              tabBarStyle: {
                backgroundColor: '#FFFFFF', // 탭 바 배경색
                borderTopWidth: 0,
                elevation: 5, // Android 그림자
                height: 40, // 원하는 높이로 설정 (기본값은 약 60)
                paddingVertical: 5, // 아이콘을 세로로 가운데에 배치
              },
            })}
          >
            {/* 'Home' 탭 */}
            <Tab.Screen
              name="Home"
              component={HomeScreenComponent}
            />

            {/* 'Search' 탭 -> SearchScreen 사용 */}
            <Tab.Screen
              name="Search"
              component={SearchScreen}
            />

            {/* 'Profile' 탭 */}
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// 스타일링
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5', // 배경색 변경
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer2: {
      marginTop:-60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
  title: {
      marginTop:-20,
    fontSize: 30,
    fontWeight: 'bold',
  },
  title2: {
      fontSize: 30,
      fontWeight: 'bold',
    },
  shuffleButton: {
    backgroundColor: '#FFF', // 셔플 버튼 배경 색상
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Android 그림자
  },
  addButton: {
    backgroundColor: '#FFF',
    marginRight:0,
    marginTop:10,
    marginBottom:30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3.84,
    elevation: 5, // Android 그림자
  },
  searchInput: {
    backgroundColor: '#FFF',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  albumCover: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden', // 부모 컨테이너를 넘는 이미지를 숨김
    resizeMode: 'cover', // 이미지를 컨테이너에 맞추되, 비율 유지
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    position: 'absolute', // 썸네일 위치를 고정
    width: 70, // 확대된 썸네일 너비
    height: 70, // 확대된 썸네일 높이
  },
  textContainer: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  musicArtist: {
    fontSize: 14,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    borderRadius: 5,
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
  }
});
