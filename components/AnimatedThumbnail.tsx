// components/AnimatedThumbnail.tsx
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
  Linking,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getYouTubeThumbnail, getYouTubeUrl } from '../utils/youtubeUtils';
import Icon from 'react-native-vector-icons/FontAwesome'; // 유튜브 아이콘을 위한 임포트

interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  count: number;
  isYES: boolean;
}

interface AnimatedThumbnailProps {
  item: Song;
  index: number;
}

const AnimatedThumbnail: React.FC<AnimatedThumbnailProps> = ({ item, index }) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const getFlexBasis = (count: number): string => {
    if (count > 50) return '98%';
    if (count > 20) return '48%'; // 한 줄에 2개 (여백 고려)
    if (count > 10) return '31%'; // 한 줄에 3개
    if (count < 2) return '16%';
    return '23%'; // 한 줄에 4개
  };

  const getOverlaySizes = (count: number) => {
    if (count > 50) {
      return {
        titleFontSize: 16,
        artistFontSize: 14,
        countFontSize: 12,
        iconSize: 24,
      };
    } else if (count > 20) {
      return {
        titleFontSize: 14,
        artistFontSize: 12,
        countFontSize: 10,
        iconSize: 20,
      };
    } else if (count > 10) {
      return {
        titleFontSize: 12,
        artistFontSize: 10,
        countFontSize: 8,
        iconSize: 18,
      };
    } else if (count < 2) {
      return {
        titleFontSize: 8,
        artistFontSize: 6,
        countFontSize: 4,
        iconSize: 12,
      };
    } else {
      return {
        titleFontSize: 10,
        artistFontSize: 8,
        countFontSize: 6,
        iconSize: 16,
      };
    }
  };

  const overlaySizes = getOverlaySizes(item.count);

  const handleImagePress = () => {
    setShowOverlay(true);
  };

  const handleOpenYouTube = () => {
    if (item.youtubeId) {
      Linking.openURL(getYouTubeUrl(item.youtubeId)).catch((err) => {
        console.error("Failed to open URL:", err);
        Alert.alert("URL 열기 실패", "해당 URL을 여는 데 실패했습니다.");
      });
    } else {
      Alert.alert("URL 없음", "이 노래의 유튜브 ID가 없습니다.");
    }
  };

  // 오버레이를 닫습니다.
  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100)}
      style={[styles.thumbnailContainer, { flexBasis: getFlexBasis(item.count) }]}
    >
      <TouchableOpacity
        onPress={handleImagePress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getYouTubeThumbnail(item.youtubeId) }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
        {showOverlay && (
          <TouchableWithoutFeedback onPress={handleCloseOverlay}>
            <View style={styles.overlay}>
              <View style={styles.overlayContent}>
                <TouchableOpacity onPress={handleCloseOverlay}>
                  <Text style={[styles.title, { fontSize: overlaySizes.titleFontSize }]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseOverlay}>
                  <Text style={[styles.artist, { fontSize: overlaySizes.artistFontSize }]}>
                    {item.artist}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseOverlay}>
                  <Text style={[styles.count, { fontSize: overlaySizes.countFontSize }]}>
                    Count: {item.count}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleOpenYouTube} style={styles.youtubeButton}>
                  <Icon
                    name="youtube-play"
                    size={overlaySizes.iconSize}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    position: 'relative',
    marginRight: 5,
    marginBottom: 5,
    aspectRatio:1,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
    alignItems: 'center', // 중앙 정렬
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1, // 원래 비율 유지
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }],
    aspectRatio: 1,
    // 추가적인 스타일을 통해 중앙에 위치하도록 함
    // resizeMode는 'cover'로 설정되어 있어 이미지가 잘리지 않게 함
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // 적절한 패딩 값 설정
  },
  overlayContent: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 1,
    marginTop: 5,
    textAlign: 'center',
  },
  artist: {
    color: '#FFFFFF',
    marginBottom: 3,
    textAlign: 'center',
  },
  count: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  youtubeButton: {
    padding: 5,
    borderRadius: 3,
  },
});

export default AnimatedThumbnail;