// App.tsx
import * as React from 'react';
import { Text, View, FlatList, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 스크린 import
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';

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
  // ... 나머지 데이터
];

// Home 화면 컴포넌트
function HomeScreenComponent() {
  const [songs, setSongs] = React.useState([]);

  React.useEffect(() => {
    const sortedSongs = [...musicData].sort((a, b) => b.priority - a.priority);
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
          tabBarActiveTintColor: '#000', // 활성화된 아이콘 색상
          tabBarInactiveTintColor: 'gray', // 비활성화된 아이콘 색상
          tabBarStyle: {
            backgroundColor: '#FFFFFF', // 탭 바 배경색
            borderTopWidth: 0,
            elevation: 5, // 안드로이드 그림자
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
    alignSelf: 'center',
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
