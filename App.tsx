import * as React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 음악 데이터 (예시로 JSON 파일에서 로드된 데이터로 가정)
const musicData = [
  { name: "유재석", priority: 5 },
  { name: "강호동", priority: 4 },
  { name: "이영자", priority: 3 },
  { name: "김종국", priority: 2 },
  { name: "아이유", priority: 1 }
];

// Home 화면 컴포넌트
function HomeScreen() {
  // 우선순위대로 정렬된 음악 데이터 상태
  const [songs, setSongs] = React.useState([]);

  // 컴포넌트가 마운트될 때 데이터 정렬하여 상태 업데이트
  React.useEffect(() => {
    const sortedSongs = musicData.sort((a, b) => a.priority - b.priority);
    setSongs(sortedSongs);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music List</Text>

      {/* FlatList로 데이터 출력 */}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.name}</Text>
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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 스타일링
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 18,
  },
});
