// screens/SearchScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import MusicWorldcupScreen from './MusicWorldcupScreen';
import { db } from '../firebaseConfig'; // Firestore 초기화 파일 임포트
import { collection, getDocs } from 'firebase/firestore';
import AnimatedScreen from '../components/AnimatedScreen'; // AnimatedScreen 임포트

export interface Category {
  id: string;
  name: string;
  songCount: number;
  thumbnail: string | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SearchScreen() {
  // State to manage whether to show the Worldcup screen
  const [showWorldcup, setShowWorldcup] = useState(false);
  // State to store available categories
  const [categories, setCategories] = useState<Category[]>([]);
  // State to store selected category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesCollection);
        const categoriesList: Category[] = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const categoryId = doc.id;
            const categoryName = data.name || categoryId;

            // Fetch songs in the category
            const songsCollection = collection(db, 'categories', categoryId, 'songs');
            const songsSnapshot = await getDocs(songsCollection);
            const songCount = songsSnapshot.size;

            // Select a random song for thumbnail
            let thumbnail: string | null = null;
            if (songCount > 0) {
              // To select a random song, generate a random index
              const randomIndex = Math.floor(Math.random() * songCount);
              const randomSongDoc = songsSnapshot.docs[randomIndex];
              const randomSongData = randomSongDoc.data();
              const youtubeId = randomSongData.youtubeId;

              if (youtubeId) {
                thumbnail = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
              }
            }

            return {
              id: categoryId,
              name: categoryName,
              songCount,
              thumbnail,
            };
          })
        );
        setCategories(categoriesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('컬렉션을 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Start the Worldcup with the selected category ID
  const startWorldcup = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setShowWorldcup(true);
  };

  // Close the Worldcup screen and reset selection
  const closeWorldcup = () => {
    setShowWorldcup(false);
    setSelectedCategoryId(null);
  };

  // Render each category as a card
  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.card} onPress={() => startWorldcup(item.id)}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.songCount}>{item.songCount} 곡</Text>
      </View>
    </TouchableOpacity>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render Worldcup screen if selected
  if (showWorldcup && selectedCategoryId) {
    return <MusicWorldcupScreen categoryId={selectedCategoryId} onClose={closeWorldcup} />;
  }

  // Render the list of categories for selection
  return (
    <AnimatedScreen animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>어떤 플레이리스트로</Text>
        <Text style={styles.title2}>음악 월드컵을 진행할까요?</Text>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer} // Added padding at the end
          ListEmptyComponent={<Text>사용 가능한 카테고리가 없습니다.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    // alignItems: 'center', // Removed to allow children to stretch
  },
  title: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  title2: {
    fontSize: 22,
    marginBottom: 30, // Increased margin for better spacing
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    width: '100%',
    paddingBottom: 100, // Increased padding to avoid content being hidden
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%', // Make card take full width of the container
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#757575',
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  songCount: {
    fontSize: 14,
    color: '#757575',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
