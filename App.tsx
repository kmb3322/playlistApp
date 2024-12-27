// Music List에 노래를 추가할 버튼을 추가한 코드

import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image, TouchableOpacity, Linking, TextInput, Alert, Button, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper'; // 추가

// 스크린 import
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';

// 음악 데이터 (예시로 JSON 파일에서 로드된 데이터로 가정)
const musicData = [
  {
    title: "Gradation",
    artist: "10cm",
    priority: 1,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://www.youtube.com/watch?v=fbmStVcCL8s&list=PLtmZj29rItKfvHjuY-ykhEiCC2EbBW2J1"
  },
  {
    title: "한 페이지가 될 수 있게",
    artist: "DAY6",
    priority: 2,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://www.youtube.com/watch?v=-9fC6oDFl5k&list=PLtmZj29rItKfvHjuY-ykhEiCC2EbBW2J1&index=2"
  },
  {
    title: "사건의 지평선",
    artist: "YOUNHA",
    priority: 3,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music4",
    artist: "폴킴",
    priority: 4,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music5",
    artist: "아이유",
    priority: 5,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
      title: "music6",
      artist: "아이유",
      priority: 6,
      cover: require("./assets/images/gradation.jpg"),
      youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music7",
    artist: "아이유",
    priority: 7,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music8",
    artist: "아이유",
    priority: 8,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music9",
    artist: "아이유",
    priority: 9,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music10",
    artist: "아이유",
    priority: 10,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music11",
    artist: "아이유",
    priority: 11,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music12",
    artist: "아이유",
    priority: 12,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music13",
    artist: "아이유",
    priority: 13,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  },
  {
    title: "music14",
    artist: "아이유",
    priority: 14,
    cover: require("./assets/images/gradation.jpg"),
    youtubeUrl: "https://youtu.be/0-q1KafFCLU?si=oGX0i71bL0EkWxP3"
  }

];

// Home 화면 컴포넌트
function HomeScreenComponent() {
  const [songs, setSongs] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [newSongTitle, setNewSongTitle] = React.useState('');
  const [newSongArtist, setNewSongArtist] = React.useState('');

  // 데이터 정렬 및 상태 초기화
  React.useEffect(() => {
    const sortedSongs = [...musicData].sort((a, b) => b.priority - a.priority);
    setSongs(sortedSongs);
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
      console.error("Failed to open URL:", err);
    });
  };

  // 노래 추가 처리
  const handleAddSong = () => {
    if (newSongTitle.trim() && newSongArtist.trim()) {
      const newSong = {
        title: newSongTitle,
        artist: newSongArtist,
        priority: songs.length + 1,
        cover: require("./assets/images/gradation.jpg"),    //기본 커버
        youtubeUrl: "https://www.youtube.com", // 기본 URL 지정
      };
      setSongs((prevSongs) => [...prevSongs, newSong]);
      setNewSongTitle('');
      setNewSongArtist('');
      setIsModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please provide both title and artist.");
    }
  };

  //cancel버튼 처리
  const handleCancel = () => {
      setNewSongTitle('');
      setNewSongArtist('');
      setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 및 버튼 */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Music List</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
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
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMusicClick(item.youtubeUrl)}>
            <View style={styles.item}>
              <Image source={item.cover} style={styles.albumCover} />
              <View style={styles.textContainer}>
                <Text style={styles.musicTitle}>{item.title}</Text>
                <Text style={styles.musicArtist}>{item.artist}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    </View>
  );
}





// Profile 화면 컴포넌트
function ProfileScreenComponent() {
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
    </View>
  );
}

// Bottom Tabs 생성
const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
            component={ProfileScreenComponent}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
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
});
