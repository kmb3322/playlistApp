import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 음악 데이터 (예시로 JSON 파일에서 로드된 데이터로 가정)
const musicData = [
  {
    title: "music1",
    artist: "이적",
    priority: 5,
    cover: "https://via.placeholder.com/50x50?text=YJS"
  },
  {
    title: "music2",
    artist: "거미",
    priority: 4,
    cover: "https://via.placeholder.com/50x50?text=KHD"
  },
  {
    title: "music3",
    artist: "아이유",
    priority: 3,
    cover: "https://via.placeholder.com/50x50?text=LYJ"
  },
  {
    title: "music4",
    artist: "폴킴",
    priority: 2,
    cover: "https://via.placeholder.com/50x50?text=KJK"
  },
  {
    title: "music5",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
      title: "music6",
      artist: "아이유",
      priority: 1,
      cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music7",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music8",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music9",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music10",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music11",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music12",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music13",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  },
  {
    title: "music14",
    artist: "아이유",
    priority: 1,
    cover: "https://via.placeholder.com/50x50?text=IU"
  }
];

// Home 화면 컴포넌트
function HomeScreen() {
  const [songs, setSongs] = React.useState([]);

  React.useEffect(() => {
    const sortedSongs = musicData.sort((a, b) => a.priority - b.priority);
    setSongs(sortedSongs);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music List</Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.cover }} style={styles.albumCover} />
            <View style={styles.textContainer}>
              <Text style={styles.musicTitle}>{item.title}</Text>
              <Text style={styles.musicArtist}>{item.artist}</Text>
            </View>
          </View>
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
