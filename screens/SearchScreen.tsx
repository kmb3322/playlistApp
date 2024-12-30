// screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MusicWorldcupScreen from './MusicWorldcupScreen';
import { db } from '../firebaseConfig'; // Firestore 초기화 파일 임포트
import { collection, getDocs } from 'firebase/firestore';

export default function SearchScreen() {
  // State to manage whether to show the Worldcup screen
  const [showWorldcup, setShowWorldcup] = useState(false);
  // State to store available categories
  const [categories, setCategories] = useState<any[]>([]); // CollectionReference 타입 대신 any[] 사용
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
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  // Render each category as a button
  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.collectionButton} onPress={() => startWorldcup(item.id)}>
      <Text style={styles.collectionText}>{item.id}</Text>
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
    <View style={styles.container}>
      <Text style={styles.title}>어떤 플레이리스트로</Text>
      <Text style={styles.title2}>음악 월드컵을 진행할까요?</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text>사용 가능한 카테고리가 없습니다.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title2: {
    fontSize: 22,
    marginBottom: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  collectionButton: {
    backgroundColor: '#FFF', // 배경색을 변경하여 텍스트가 보이도록 함
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3.84,
            elevation: 3, // Android용 그림자
  },
  collectionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    width: '100%',
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
});
