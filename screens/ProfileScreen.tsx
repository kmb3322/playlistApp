// screens/ProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db } from '../firebaseConfig'; // Firestore 초기화 파일
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import AnimatedThumbnail from '../components/AnimatedThumbnail';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect 임포트
import AnimatedScreen from '../components/AnimatedScreen'; // AnimatedScreen 임포트

interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  count: number;
  isYES: boolean;
}

const ProfileScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firestore에서 모든 노래 가져오기
  const fetchSongs = async () => {
    setLoading(true);
    setError(null); // 이전 에러 상태 초기화
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
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError('노래를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect 대신 useFocusEffect 사용: 화면이 포커스될 때마다 fetchSongs 호출
  useFocusEffect(
    useCallback(() => {
      fetchSongs(); // 탭에 포커스될 때마다 데이터 로드
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
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

  return (
    <AnimatedScreen animationType="fade">
      <ScrollView contentContainerStyle={styles.container}>
        {/* 헤더를 ScrollView 내부로 이동 */}
        <Text style={styles.header}>내가 좋아한 음악</Text>

        <View style={styles.galleryContainer}>
          <View style={styles.grid}>
            {songs.map((item, index) => (
              <AnimatedThumbnail key={item.id} item={item} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
};

export default ProfileScreen;

// 스타일링
const styles = StyleSheet.create({
  galleryContainer: {
    padding: 10,
  },
  container: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 80, // 아래 여백 추가
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // 좌측 정렬
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: { // 헤더 스타일
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 10,
    textAlign: 'left',
    color: '#333',
  },
});
