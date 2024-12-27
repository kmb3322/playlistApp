// screens/SearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MusicWorldcupScreen from './MusicWorldcupScreen';

export default function SearchScreen() {
  // '음악 월드컵' 화면을 열지 여부
  const [showWorldcup, setShowWorldcup] = useState(false);

  // 음악 월드컵 시작
  const startMusicWorldcup = () => {
    setShowWorldcup(true);
  };

  // 월드컵 화면에서 "뒤로가기" 버튼을 누르면 호출할 함수
  const closeMusicWorldcup = () => {
    setShowWorldcup(false);
  };

  // showWorldcup 상태에 따라 다른 UI 렌더링
  if (showWorldcup) {
    return <MusicWorldcupScreen onClose={closeMusicWorldcup} />;
  }

  // showWorldcup가 false인 경우, 원래 SearchScreen UI 표시
  return (
    <View style={styles.container}>
      <Text style={styles.title}>음악 월드컵 플레이리스트 선택</Text>
      {/* 실제로는 여기에서 플레이리스트 목록을 보여주고, 하나를 탭하면 state로 저장하는 식으로 구현 가능 */}

      {/* 간단히 Button 하나로 예시 */}
      <Button title="음악 월드컵 시작" onPress={startMusicWorldcup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    marginBottom: 20
  },
});
