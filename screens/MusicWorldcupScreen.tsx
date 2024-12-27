// screens/MusicWorldcupScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Button,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

// 예시 데이터 (YouTube 비디오 ID 사용)
const musicList = [
  {
    id: 1,
    title: 'Track 1',
    artist: 'Artist 1',
    youtubeId: 'ZKjIHQxG_3Q',
  },
  {
    id: 2,
    title: 'Track 2',
    artist: 'Artist 2',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'Track 3',
    artist: 'Artist 3',
    youtubeId: '9bZkp7q19f0',
  },
  // 필요한 만큼 추가...
];

interface Props {
  onClose: () => void; // 뒤로가기용 콜백
}

export default function MusicWorldcupScreen({ onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const position = useRef(new Animated.ValueXY()).current;
  const playerRef = useRef<any>(null);

  // PanResponder 설정
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 터치가 약간이라도 드래그 되면 PanResponder 활성화
        return (
          Math.abs(gestureState.dx) > 2 ||
          Math.abs(gestureState.dy) > 2
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // 오른쪽 스와이프 -> YES
          handleSwipe('YES');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // 왼쪽 스와이프 -> NO
          handleSwipe('NO');
        } else {
          // 제자리로 다시 돌아오기
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // 스와이프 처리 함수
  const handleSwipe = (direction: 'YES' | 'NO') => {
    Animated.timing(position, {
      toValue: { x: direction === 'YES' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // 스와이프 후 위치 초기화
      position.setValue({ x: 0, y: 0 });

      // YES인 경우 likedSongs에 추가
      if (direction === 'YES') {
        setLikedSongs((prev) => [...prev, musicList[currentIndex].title]);
      }

      // 다음 곡으로 넘어가기
      setCurrentIndex((prevIndex) => prevIndex + 1);
    });
  };

  // 모든 곡을 스와이프했는지 체크
  const isFinished = currentIndex >= musicList.length;

  return (
    <View style={styles.container}>
      {isFinished ? (
        // 결과 화면
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>월드컵 종료!</Text>
          <Text>내가 YES 누른 곡들: {likedSongs.join(', ')}</Text>
          <Button title="뒤로가기" onPress={onClose} />
        </View>
      ) : (
        // 아직 남은 곡이 있을 때
        musicList
          .map((song, index) => {
            if (index < currentIndex) {
              return null;
            }

            if (index === currentIndex) {
              return (
                <Animated.View
                  key={song.id}
                  {...panResponder.panHandlers}
                  style={[
                    styles.card,
                    {
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
                  <Text style={styles.cardTitle}>{song.title}</Text>
                  <Text style={styles.cardArtist}>{song.artist}</Text>

                  {/* YouTube 영상을 재생하는 YoutubePlayer 컴포넌트 */}
                  <View style={styles.youtubeContainer}>
                    <YoutubePlayer
                      ref={playerRef}
                      height={200}
                      play={true}
                      videoId={song.youtubeId}
                      onChangeState={useCallback((state) => {
                        if (state === 'ended') {
                          handleSwipe('NO'); // 자동으로 'NO' 스와이프
                        }
                      }, [currentIndex])}
                      webViewStyle={{ opacity: 0.99 }} // iOS에서 WebView 깜빡임 방지
                    />
                  </View>

                  {/* YES, NO 라벨 */}
                  <View style={styles.labelsContainer}>
                    <Animated.View
                      style={[
                        styles.label,
                        {
                          opacity: position.x.interpolate({
                            inputRange: [0, SWIPE_THRESHOLD],
                            outputRange: [0, 1],
                            extrapolate: 'clamp',
                          }),
                          backgroundColor: 'rgba(0, 255, 0, 0.3)', // 녹색
                          transform: [
                            {
                              rotate: '-20deg', // 라벨 회전
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.labelText}>YES</Text>
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.label,
                        {
                          opacity: position.x.interpolate({
                            inputRange: [-SWIPE_THRESHOLD, 0],
                            outputRange: [1, 0],
                            extrapolate: 'clamp',
                          }),
                          backgroundColor: 'rgba(255, 0, 0, 0.3)', // 빨간색
                          transform: [
                            {
                              rotate: '20deg', // 라벨 회전
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.labelText}>NO</Text>
                    </Animated.View>
                  </View>

                  <Text style={styles.instructionText}>
                    화면을 좌/우로 스와이프하여 Yes/No를 결정하세요.
                  </Text>
                </Animated.View>
              );
            } else {
              // 다음 대기 카드
              return (
                <View
                  key={song.id}
                  style={[
                    styles.card,
                    styles.nextCard,
                    { top: 5 * (index - currentIndex) }, // 약간 아래로 위치
                  ]}
                >
                  <Text style={styles.cardTitle}>{song.title}</Text>
                  <Text style={styles.cardArtist}>{song.artist}</Text>
                </View>
              );
            }
          })
          .reverse() // 마지막 곡이 뒤에 렌더
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 배경색 변경
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    padding: 20,
    borderRadius: 20, // 곡률 20으로 조정
    backgroundColor: '#FFFFFF', // 카드 색상을 순백색으로 변경
    alignItems: 'center',
    elevation: 5, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 }, // iOS 그림자
    shadowOpacity: 0.25, // iOS 그림자
    shadowRadius: 3.84, // iOS 그림자
  },
  nextCard: {
    opacity: 0.8, // 아직 넘기지 않은 트랙을 더 얇게 표시
    transform: [{ scale: 0.95 }], // 현재 트랙보다 약간 작게 표시
  },
  cardTitle: {
    fontSize: 20,
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
    borderRadius: 10,
    overflow: 'hidden',
  },
  instructionText: {
    marginTop: 15,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  labelsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // 추가적인 레이아웃 조정 가능
  },
  label: {
    padding: 10,
    borderRadius: 5,
  },
  labelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
