// screens/MusicWorldcupScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import YoutubePlayer from 'react-native-youtube-iframe';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { initialMusicList, Song } from '../data/musicData'; // 데이터 파일 불러오기

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 100; // 스와이프 감도 조절을 위한 Threshold 설정

export default function MusicWorldcupScreen() {
  const navigation = useNavigation(); // 내비게이션 객체 가져오기
  const [currentIndex, setCurrentIndex] = useState(0);

  // 음악 리스트를 상태로 관리하여 업데이트 가능하게 함
  const [musicList, setMusicList] = useState<Song[]>(
    initialMusicList.map(song => ({ ...song })) // 깊은 복사
  );

  const position = useRef(new Animated.ValueXY()).current;
  const theme = useTheme(); // React Native Paper 테마 사용

  // YES, NO 라벨의 애니메이션을 위한 상태
  const [swipeDirection, setSwipeDirection] = useState<'YES' | 'NO' | null>(null);

  // 스와이프 처리 함수 먼저 정의
  const handleSwipe = (direction: 'YES' | 'NO', song: Song) => {
    const toValue = direction === 'YES' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // 스와이프 후 위치 초기화
      position.setValue({ x: 0, y: 0 });
      setSwipeDirection(null);

      // 음악 리스트 업데이트: id 기준으로 업데이트
      setMusicList(prevList =>
        prevList.map(item =>
          item.id === song.id
            ? {
                ...item,
                count: direction === 'YES' ? item.count + 1 : item.count,
                isYES: direction === 'YES',
              }
            : item
        )
      );

      // 다음 곡으로 넘어가기
      setCurrentIndex(prevIndex => prevIndex + 1);
    });
  };

  // PanResponder 설정 (handleSwipe가 이미 defined)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 터치가 약간이라도 드래그 되면 PanResponder 활성화
        return (
          Math.abs(gestureState.dx) > 10 ||
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });

        // 스와이프 방향에 따라 YES, NO 표시
        if (gestureState.dx > 0) {
          setSwipeDirection('YES');
        } else if (gestureState.dx < 0) {
          setSwipeDirection('NO');
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (currentIndex >= musicList.length) return; // 인덱스 초과 방지

        const currentSong = musicList[currentIndex];
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // 오른쪽 스와이프 -> YES
          handleSwipe('YES', currentSong);
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // 왼쪽 스와이프 -> NO
          handleSwipe('NO', currentSong);
        } else {
          // 제자리로 다시 돌아오기
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start(() => setSwipeDirection(null));
        }
      },
    })
  ).current;

  // 모든 곡을 스와이프했는지 체크
  const isFinished = currentIndex >= musicList.length;

  // 다음 트랙들을 얇게 표시하고 겹치도록 함
  const renderNextTracks = () => {
    return musicList
      .slice(currentIndex + 1, currentIndex + 2) // 다음 1곡 표시
      .map((song, index) => (
        <Animated.View
          key={song.id}
          style={[
            styles.card,
            {
              top: 10 * (index + 1), // 약간 아래로
            },
          ]}
        >
          <Card>
            <Card.Content>
              <Title>{song.title}</Title>
              <Paragraph>{song.artist}</Paragraph>
            </Card.Content>
          </Card>
        </Animated.View>
      ));
  };

  // YouTube 영상 상태 변경 핸들러
  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        if (currentIndex >= musicList.length) return; // 인덱스 초과 방지

        const endedSong = musicList[currentIndex];
        handleSwipe('YES', endedSong);
      }
    },
    [currentIndex, musicList]
  );

  // 배경색을 스와이프 방향에 따라 변경하는 Animated 값
  const backgroundColor = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [
      'rgba(244, 67, 54, 0.5)', // Red for NO
      'rgba(255,255,255,1)',    // White for neutral
      'rgba(76, 175, 80, 0.5)', // Green for YES
    ],
    extrapolate: 'clamp',
  });

  // O/X 아이콘을 표시하기 위한 애니메이션
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  // 월드컵 다시 시작 함수
  const restartWorldcup = () => {
    setCurrentIndex(0);
    setMusicList(prevList =>
      prevList.map(song => ({
        ...song,
        isYES: false, // isYES 초기화
        // count는 그대로 유지
      }))
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* YES, NO 아이콘을 화면 중앙에 표시 */}
      {swipeDirection === 'YES' && (
        <Animated.View style={[styles.iconContainer, { transform: [{ rotate }] }]}>
          <Icon name="check-circle" size={100} color="green" />
        </Animated.View>
      )}
      {swipeDirection === 'NO' && (
        <Animated.View style={[styles.iconContainer, { transform: [{ rotate }] }]}>
          <Icon name="times-circle" size={100} color="red" />
        </Animated.View>
      )}

      {isFinished ? (
        // 결과 화면
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>월드컵 종료!</Text>
          <Text style={styles.resultSubtitle}>내가 좋아한 곡들:</Text>

          {/* 좋아한 곡들을 스크롤 가능하게 표시 */}
          <ScrollView style={styles.scrollView}>
            {musicList.filter(song => song.isYES).length > 0 ? (
              musicList
                .filter(song => song.isYES)
                .map((song, index) => (
                  <Text key={song.id} style={styles.likedSong}>
                    {index + 1}. {song.title} - {song.artist}
                  </Text>
                ))
            ) : (
              <Text style={styles.likedSong}>좋아하는 곡이 없습니다.</Text>
            )}
          </ScrollView>

          {/* 디버깅을 위한 전체 음악 리스트 출력 */}
          <Text style={styles.debugTitle}>디버그 정보:</Text>
          <ScrollView style={styles.debugScrollView}>
            {musicList.map((song, index) => (
              <Text key={song.id} style={styles.debugText}>
                {index + 1}. {song.title} - {song.artist} | isYES: {song.isYES ? 'true' : 'false'} | count: {song.count}
              </Text>
            ))}
          </ScrollView>

          {/* 뒤로가기 버튼 추가 */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
          {/* 월드컵 다시 시작 버튼 추가 */}
          <TouchableOpacity onPress={restartWorldcup} style={styles.restartButton}>
            <Text style={styles.backButtonText}>다시 시작하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 다음 트랙들 표시 */}
          {renderNextTracks()}

          {/* 현재 트랙 카드 */}
          {musicList.slice(currentIndex, currentIndex + 1).map(song => (
            <Animated.View
              key={song.id}
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
                  backgroundColor: '#FFFFFF', // 카드 색상 순백색으로 변경
                  borderRadius: 20, // 곡률 20으로 조정
                  height: SCREEN_HEIGHT * 0.7, // 화면 하단까지 완전히 덮지 않도록 높이 조정
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    {
                      rotate: position.x.interpolate({
                        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                        outputRange: ['-10deg', '0deg', '10deg'],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <Card style={styles.paperCard}>
                <Card.Content>
                  <Title style={styles.cardTitle}>{song.title}</Title>
                  <Paragraph style={styles.cardArtist}>{song.artist}</Paragraph>
                </Card.Content>

                {/* YouTube 영상을 재생하는 YoutubePlayer 컴포넌트 */}
                <View style={styles.youtubeContainer}>
                  <YoutubePlayer
                    height={200}
                    play={true}
                    videoId={song.youtubeId}
                    onChangeState={onStateChange}
                    webViewStyle={{ opacity: 0.99 }} // iOS에서 WebView 깜빡임 방지
                  />
                </View>

                <Text style={styles.instructionText}>
                  화면을 좌/우로 스와이프하여 Yes/No를 결정하세요.
                </Text>
              </Card>
            </Animated.View>
          ))}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 초기 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: '40%', // 화면 중앙에 위치하도록 조정
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0, // 카드 아래에 표시되도록 설정
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%', // 가로 전체 사용
    flex: 1, // 세로 공간 채우기
  },
  scrollView: {
    width: '100%',
    marginVertical: 10,
    maxHeight: SCREEN_HEIGHT * 0.3, // 결과 리스트의 최대 높이 설정
  },
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
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  likedSong: {
    fontSize: 16,
    marginVertical: 2,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  restartButton: {
    marginTop: 10,
    backgroundColor: '#03dac6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
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
});
