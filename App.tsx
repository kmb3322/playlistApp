import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 음악 데이터 (예시로 JSON 파일에서 로드된 데이터로 가정)
//require("./assets/images/gradation.jpg")
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
function HomeScreen() {
  const [songs, setSongs] = React.useState([]);

  React.useEffect(() => {
    const sortedSongs = musicData.sort((a, b) => a.priority - b.priority);
    setSongs(sortedSongs);
  }, []);

  const handleMusicClick = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music List</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMusicClick(item.youtubeUrl)}>
            <View style={styles.item}>
              <Image source={item.cover } style={styles.albumCover} />
              <View style={styles.textContainer}>
                <Text style={styles.musicTitle}>{item.title}</Text>
                <Text style={styles.musicArtist}>{item.artist}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Search 화면 컴포넌트
function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text>Search Screen</Text>
    </View>
  );
}

// Profile 화면 컴포넌트
function ProfileScreen() {
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
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 스타일링
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
});