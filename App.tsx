// Music List에 노래를 추가할 버튼을 추가한 코드

import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image, TouchableOpacity, Linking, TextInput, Alert, Button, Modal, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper'; // 추가
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getYouTubeThumbnail, getYouTubeUrl } from './utils/youtubeUtils';

// 스크린 import
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';


// 음악 데이터 (예시로 JSON 파일에서 로드된 데이터로 가정)
const musicData = [
  {
    id: 1,
    title: "Gradation",
    artist: "10cm",
    youtubeId: "fbmStVcCL8s",
  },
  {
    id: 2,
    title: "광화문에서",
    artist: "규현",
    youtubeId: "GAdFpZHTh1I",
  },
  {
    id: 3,
    title: "Hello",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
  {
    id: 4,
    title: "Hello1",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
  {
    id: 5,
    title: "Hello2",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
  {
    id: 6,
    title: "Hello3",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
  {
    id: 7,
    title: "Hello4",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
  {
    id: 8,
    title: "Hello5",
    artist: "허각",
    youtubeId: "R9qjc2bvdrY",
  },
];

// Home 화면 컴포넌트
function HomeScreenComponent() {
  const [songs, setSongs] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [newSongTitle, setNewSongTitle] = React.useState('');
  const [newSongArtist, setNewSongArtist] = React.useState('');
  const [newSongId, setNewSongId] = React.useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = React.useState(null);
  // 여러 스와이프 진행 상태 관리
    const [swipeProgress, setSwipeProgress] = React.useState(
      musicData.map(() => new Animated.Value(0)) // 각 항목에 대해 Animated.Value 초기화
    );


  // 데이터 정렬 및 상태 초기화
  React.useEffect(() => {
    const sortedSongs = [...musicData].sort((a, b) => a.id - b.id);
    setSongs(sortedSongs);
    setSwipeProgress(sortedSongs.map(() => new Animated.Value(0)));
  }, []);

  // 검색어에 맞게 필터링된 음악 데이터
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchText.toLowerCase())
  );

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
        <Text style={styles.title}>Music List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 입력란 */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search music..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />

      {/* 음악 리스트 출력 */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(index)}
            onSwipeableWillOpen={() => handleSwipeProgress(index, 1)} // 스와이프 시작 시 애니메이션 시작
            onSwipeableWillClose={() => handleSwipeProgress(index, 0)} // 스와이프 종료 시 애니메이션 종료
          >
            <TouchableOpacity onPress={() => handleMusicClick(getYouTubeUrl(item.youtubeId))}>
              <View style={styles.item}>
                <Image source={{ uri: getYouTubeThumbnail(item.youtubeId) }} style={styles.albumCover} />
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
            <Text style={styles.modalTitle}>Add New Song</Text>
            <TextInput
              style={styles.input}
              placeholder="Song Title"
              value={newSongTitle}
              onChangeText={setNewSongTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Artist"
              value={newSongArtist}
              onChangeText={setNewSongArtist}
            />
            <TextInput
              style={styles.input}
              placeholder="YoutubeId"
              value={newSongId}
              onChangeText={setNewSongId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddSong}>
                <Text style={styles.saveButtonText}>Add</Text>
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
              tabBarIcon: ({ color, size }) => {
                let iconName = '';

                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Search') {
                  iconName = 'search';
                } else if (route.name === 'Profile') {
                  iconName = 'person';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6200ee', // 활성 탭 색상
              tabBarInactiveTintColor: 'gray', // 비활성 탭 색상
              tabBarStyle: {
                backgroundColor: '#FFFFFF', // 탭 바 배경색
                borderTopWidth: 0,
                elevation: 5, // Android 그림자
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
    backgroundColor: '#FFFFFF', // 배경색 변경
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#17eb26',
    marginLeft: -70,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,

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
    backgroundColor: '#17eb26',
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
});
