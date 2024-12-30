// screens/MusicWorldcupScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import YoutubePlayer from 'react-native-youtube-iframe';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig'; // Firebase 설정 파일
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
  runOnJS,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// 타입 정의
export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  count: number;
  isYES: boolean;
}

interface MusicWorldcupScreenProps {
  categoryId: string;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 스와이프 감도 조절을 위한 Threshold 설정

// 스택된 카드 컴포넌트
const NextCard = ({ song, index }: { song: Song; index: number }) => {
  const scale = useSharedValue(1 - 0.5 * index);
  const translateY = useSharedValue(10 * index);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animationDelay = index * 200;


    translateY.value = withDelay(
        animationDelay,
        withTiming(10 * index, {
          duration: 500, // 애니메이션 지속 시간
          easing: Easing.out(Easing.ease),
        })
      );
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        })
      );
  }, [index, scale, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
    zIndex: -index,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Card>
        <Card.Content>
          <Title>{song.title}</Title>
          <Paragraph>{song.artist}</Paragraph>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export default function MusicWorldcupScreen({ categoryId, onClose }: MusicWorldcupScreenProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [musicList, setMusicList] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [swipeDecisions, setSwipeDecisions] = useState<
    { songId: string; direction: 'YES' | 'NO' }[]
  >([]);

  // Firestore에서 음악 목록 가져오기
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsCollection = collection(db, 'categories', categoryId, 'songs');
        const q = query(songsCollection, orderBy('id', 'asc'));
        const querySnapshot = await getDocs(q);
        const songs: Song[] = [];
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          songs.push({
            id: docSnap.id,
            title: data.title,
            artist: data.artist,
            youtubeId: data.youtubeId,
            count: data.count || 0,
            isYES: data.isYES || false,
          });
        });
        songs.sort((a, b) => a.title.localeCompare(b.title));
        setMusicList(songs);
        setLoading(false);
      } catch (error) {
        // console.error('Error fetching songs:', error);
        setLoading(false);
      }
    };

    fetchSongs();
  }, [categoryId]);

  // Firestore 업데이트 함수 (월드컵 종료 시 일괄 업데이트)
  const updateFirestore = useCallback(async () => {
    try {
      const batchUpdates = swipeDecisions.map(decision => {
        const songDocRef = doc(db, 'categories', categoryId, 'songs', decision.songId);
        const song = musicList.find(song => song.id === decision.songId);

        if (decision.direction === 'YES') {
          return updateDoc(songDocRef, {
            count: song ? song.count + 1 : 1, // count를 +1
            isYES: true,
          });
        } else if (decision.direction === 'NO') {
          return updateDoc(songDocRef, {
            count: song ? song.count : 0, // count를 그대로 유지
            isYES: false,
          });
        }
        return Promise.resolve(); // NO일 경우 업데이트 필요 없음
      });

      await Promise.all(batchUpdates);
      // console.log('모든 스와이프가 Firestore에 업데이트되었습니다.');
    } catch (error) {
      // console.error('Firestore 업데이트 오류:', error);
    }
  }, [swipeDecisions, musicList, categoryId]);

  // 애니메이션 리셋 함수
  const resetAnimation = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      backgroundProgress.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });

      // YES 아이콘이 서서히 사라지도록 지연 추가
      opacityYes.value = withDelay(
        500, // 500ms 지연
        withTiming(0, {
          duration: 500, // 서서히 사라지는 시간
          easing: Easing.out(Easing.ease),
        })
      );

      // NO 아이콘이 서서히 사라지도록 지연 추가
      opacityNo.value = withDelay(
        500, // 500ms 지연
        withTiming(0, {
          duration: 500, // 서서히 사라지는 시간
          easing: Easing.out(Easing.ease),
        })
      );
  opacity.value = withDelay(
          500, // 500ms 지연
          withTiming(0, {
            duration: 500, // 서서히 사라지는 시간
            easing: Easing.out(Easing.ease),
          })
        );
    backgroundProgress.value = withSpring(0, { damping: 20, stiffness: 200 });

    scale.value = withDelay(
            1000,
            withTiming(1, {
              duration: 10000, // 서서히 사라지는 시간
              easing: Easing.out(Easing.ease),
            })
          );
  }, []);

  // 스와이프 처리 함수 (결과를 로컬 상태에 저장)
  const handleSwipe = useCallback(
    (direction: 'YES' | 'NO') => {
      if (currentIndex >= musicList.length) return;

      const currentSong = musicList[currentIndex];
      if (!currentSong) return;

      // 스와이프 결정을 로컬 상태에 추가
      setSwipeDecisions(prev => [...prev, { songId: currentSong.id, direction }]);

      // YES인 경우 likedSongs에 추가
      if (direction === 'YES') {
        setLikedSongs(prevLiked => {
          const alreadyInLiked = prevLiked.some(song => song.id === currentSong.id);
          if (!alreadyInLiked) {
            return [...prevLiked, currentSong];
          }
          return prevLiked;
        });
      }

      // 다음 곡으로 넘어가기
      setCurrentIndex(prevIndex => prevIndex + 1);
    },
    [currentIndex, musicList]
  );

  // 월드컵 다시 시작 함수
  const restartWorldcup = useCallback(async () => {
    setCurrentIndex(0);
    setLikedSongs([]);
    setSwipeDecisions([]);

    // Firestore 전체 초기화
    try {
      const resetList = musicList.map(song => ({
        ...song,
        isYES: false,
        count: song.count, // count 유지
      }));
      setMusicList(resetList);

      await Promise.all(
        resetList.map(async song => {
          const songDocRef = doc(db, 'categories', categoryId, 'songs', song.id);
          await updateDoc(songDocRef, {
            isYES: false,
          });
        })
      );
      // console.log('모든 곡이 초기화되었습니다.');
    } catch (error) {
      // console.error('곡 초기화 오류:', error);
    }
  }, [musicList, categoryId]);

  // YouTube 영상 상태 변경 핸들러
  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        if (currentIndex >= musicList.length) return;
        handleSwipe('YES');
      }
    },
    [currentIndex, musicList, handleSwipe]
  );

  // 애니메이션을 위한 Shared Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacityYes = useSharedValue(0);
  const opacityNo = useSharedValue(0);
  const opacity = useSharedValue(0);
  const backgroundProgress = useSharedValue(0);
  const scale = useSharedValue(1);


  // Gesture Handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
      rotation.value = (translateX.value / SCREEN_WIDTH) * 30;

      // 배경 그라데이션을 위한 진행도 업데이트
      backgroundProgress.value = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);

      // YES, NO 아이콘의 불투명도 설정
      if (translateX.value > 0) {
        opacityYes.value = interpolate(backgroundProgress.value, [0, 1], [0, 1]);
        opacityNo.value = 0;
      } else if (translateX.value < 0) {
        opacityNo.value = interpolate(backgroundProgress.value, [0, 1], [0, 1]);
        opacityYes.value = 0;
      } else {
        opacityYes.value = 0;
        opacityNo.value = 0;
      }
    },
    onEnd: () => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swiped Right - YES
        runOnJS(handleSwipe)('YES');
        runOnJS(resetAnimation)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swiped Left - NO
        runOnJS(handleSwipe)('NO');
        runOnJS(resetAnimation)();
      } else {
        // 원래 위치로 복귀
        translateX.value = withSpring(0, { damping: 25, stiffness: 100 });
            translateY.value = withSpring(0, { damping: 25, stiffness: 100 });
            rotation.value = withSpring(0, { damping: 25, stiffness: 100 });
            opacityYes.value = withSpring(0, { damping: 25, stiffness: 100 });
            opacityNo.value = withSpring(0, { damping: 25, stiffness: 100 });
            backgroundProgress.value = withSpring(0, { damping: 25, stiffness: 100 });
      }
    },
  });

  // Animated Styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const yesStyle = useAnimatedStyle(() => ({
    opacity: opacityYes.value,
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const noStyle = useAnimatedStyle(() => ({
    opacity: opacityNo.value,
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const backgroundStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      backgroundProgress.value,
      [0, 1],
      ['#F5F5F5', 'rgba(76, 175, 80, 0.5)'] // 초록색
    );

    const bgColorNo = interpolateColor(
      backgroundProgress.value,
      [0, 1],
      ['#F5F5F5', 'rgba(244, 67, 54, 0.5)'] // 빨간색
    );

    return {
      backgroundColor:
        translateX.value > 0
          ? bgColor
          : translateX.value < 0
          ? bgColorNo
          : '#F5F5F5', // 수정된 부분
    };
  });

  // 모든 곡을 스와이프했는지 체크
  const isFinished = currentIndex >= musicList.length;

  // 스와이프 완료 시 Firestore 업데이트
  useEffect(() => {
    if (isFinished && swipeDecisions.length > 0) {
      updateFirestore();
    }
  }, [isFinished, swipeDecisions, updateFirestore]);

  // 다음 트랙들을 얇게 표시하고 겹치도록 함
  const renderNextTracks = () => {
    return musicList
      .slice(currentIndex + 1, currentIndex + 2) // 다음 1곡 표시
      .map((song, index) => (
        <NextCard key={song.id} song={song} index={index + 1} />
      ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>데이터 로딩 중...</Text>
      </View>
    );
  }

  const currentSong = musicList[currentIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.container, backgroundStyle]}>
        {/* YES, NO 아이콘을 화면 중앙에 표시 */}
        <Animated.View style={[styles.iconContainer, yesStyle, styles.iconYes]}>
          <Icon name="check-circle" size={100} color="green" />
        </Animated.View>
        <Animated.View style={[styles.iconContainer, noStyle, styles.iconNo]}>
          <Icon name="times-circle" size={100} color="red" />
        </Animated.View>

        {isFinished ? (
          // 결과 화면
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>월드컵 종료!</Text>
            <Text style={styles.resultSubtitle}>내가 좋아한 곡들:</Text>

            {/* likedSongs(스와이프 YES했던 곡들) 스크롤 표시 */}
            <ScrollView style={styles.scrollView}>
              {likedSongs.length > 0 ? (
                likedSongs.map((song, index) => (
                  <Text key={song.id} style={styles.likedSong}>
                    {index + 1}. {song.title} - {song.artist}
                  </Text>
                ))
              ) : (
                <Text style={styles.likedSong}>좋아하는 곡이 없습니다.</Text>
              )}
            </ScrollView>

            {/* 월드컵 다시 시작 버튼 추가 */}
            <TouchableOpacity onPress={restartWorldcup} style={styles.restartButton}>
              <Text style={styles.backButtonText2}>월드컵 다시 시작하기</Text>
            </TouchableOpacity>
            {/* 뒤로가기 버튼 추가 */}
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>다른 플레이리스트 살펴보기</Text>
            </TouchableOpacity>

          </View>
        ) : (
          <>
            {/* 다음 트랙들 표시 */}
            {renderNextTracks()}

            {/* 현재 트랙 카드 */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.card, animatedStyle]}>
                <Card style={styles.paperCard}>
                  <Card.Content>
                    <Title style={styles.cardTitle}>{currentSong.title}</Title>
                    <Paragraph style={styles.cardArtist}>{currentSong.artist}</Paragraph>
                  </Card.Content>

                  {/* YouTube 영상을 재생하는 YoutubePlayer 컴포넌트 */}
                  <View style={styles.youtubeContainer}>
                    <YoutubePlayer
                      height={200}
                      play={true}
                      videoId={currentSong.youtubeId}
                      onChangeState={onStateChange}
                      webViewStyle={{ opacity: 0.99 }} // iOS에서 WebView 깜빡임 방지
                    />
                  </View>

                  <Text style={styles.instructionText}>
                    화면을 좌/우로 스와이프하여 Yes/No를 결정하세요.
                  </Text>

                </Card>
              </Animated.View>
            </PanGestureHandler>
          </>
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 추가된 부분
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: '40%', // 화면 중앙에 위치하도록 조정
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1, // 카드 위에 표시되도록 설정
  },

  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%', // 가로 전체 사용
    flex: 1, // 세로 공간 채우기
    backgroundColor: '#F5F5F5', // 수정된 부분
  },
  scrollView: {
    width: '100%',
    marginVertical: 10,
    maxHeight: SCREEN_HEIGHT * 0.3, // 결과 리스트의 최대 높이 설정
  },
  /*
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  debugScrollView: {
    width: '100%',
    marginVertical: 10,
    maxHeight: SCREEN_HEIGHT * 0.3, // 디버그 리스트의 최대 높이 설정
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    fontSize: 14,
    marginVertical: 2,
  },
  */
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  resultSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  likedSong: {
      marginTop: 5,
    fontSize: 16,
    marginVertical: 2,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3, // Android용 그림자
  },
  restartButton: {
    marginTop: 10,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3, // Android용 그림자
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText2: {
      color: '#6200ee',
      fontSize: 16,
      fontWeight: 'bold',
    },

  card: {
    width: SCREEN_WIDTH * 0.9,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android 그림자
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: SCREEN_HEIGHT * 0.7,
  },
  paperCard: {
    borderRadius: 20, // 카드 곡률
    overflow: 'hidden',
    flex: 1, // 카드 내용이 공간을 채우도록 설정
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardArtist: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  youtubeContainer: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 0, // 유튜브 영상 자체에 곡률 적용하지 않음
    overflow: 'hidden',
  },
  instructionText: {
    marginTop: 15,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // 추가된 부분
  },
  /*
  // Removed debug styles
  debugTitle: {},
  debugScrollView: {},
  debugText: {},
  */
});
