// components/AnimatedScreen.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AnimatedScreenProps {
  children: React.ReactNode;
  animationType?: 'slide' | 'fade'; // 애니메이션 유형을 지정
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children, animationType = 'slide' }) => {
  const animation = useRef(new Animated.Value(0)).current; // 기본값 설정
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      if (animationType === 'slide') {
        animation.setValue(width); // 슬라이드 시작 위치
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (animationType === 'fade') {
        animation.setValue(0); // 페이드 시작 투명도
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (animationType === 'slide') {
        Animated.timing(animation, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (animationType === 'fade') {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isFocused, animation, animationType]);

  const animatedStyle =
    animationType === 'slide'
      ? { transform: [{ translateX: animation }] }
      : { opacity: animation };

  return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedScreen;
