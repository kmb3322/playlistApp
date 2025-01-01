// HomeScreenComponent.tsx

import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import AnimatedScreen from '../components/AnimatedScreen';
import { getYouTubeThumbnail, getYouTubeUrl } from '../utils/youtubeUtils';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Define the Song interface
interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  count: number;
  isYES: boolean;
}

const HomeScreenComponent: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongId, setNewSongId] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [swipeProgress, setSwipeProgress] = useState<Animated.Value[]>([]);
  const swipeableRefs = React.useRef<Swipeable[]>([]);
  const [randomSong, setRandomSong] = useState<Song | null>(null); // New state for random song

  useEffect(() => {
    const fetchSongs = async () => {
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

        console.log('Fetched Songs:', allSongs); // Debugging log

        if (allSongs.length === 0) {
          console.warn('No songs fetched from Firestore.');
        }

        const sortedSongs = [...allSongs].sort((a, b) => a.youtubeId.localeCompare(b.youtubeId));
        setSongs(sortedSongs);
        setSwipeProgress(sortedSongs.map(() => new Animated.Value(0)));

        // Select a random song
        if (sortedSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * sortedSongs.length);
          setRandomSong(sortedSongs[randomIndex]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching songs:', err);
        Alert.alert('Error', '노래를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Filter songs based on search text
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchText.toLowerCase())
  );

  // Shuffle songs
  const shuffleSongs = () => {
    swipeableRefs.current.forEach((swipeable) => {
      if (swipeable != null) swipeable.close(); // Close any open swipeables
    });
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    setSongs(shuffledSongs);
    setSwipeProgress(shuffledSongs.map(() => new Animated.Value(0)));

    // Reselect a random song after shuffling
    if (shuffledSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * shuffledSongs.length);
      setRandomSong(shuffledSongs[randomIndex]);
    }
  };

  // Open YouTube link
  const handleMusicClick = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'URL을 여는 데 실패했습니다.');
    });
  };

  // Delete song
  const handleDeleteSong = () => {
    if (selectedSongIndex === null) return;

    setSwipeProgress((prevProgress) => {
      const updatedProgress = [...prevProgress];
      updatedProgress.splice(selectedSongIndex, 1); // Reset progress for deleted item
      return updatedProgress;
    });

    setSongs((prevSongs) => {
      const updatedSongs = [...prevSongs];
      updatedSongs.splice(selectedSongIndex, 1);
      return updatedSongs;
    });

    setIsDeleteModalVisible(false);
    setSelectedSongIndex(null);
  };

  // Add new song
  const handleAddSong = () => {
    if (newSongTitle.trim() && newSongArtist.trim() && newSongId.trim()) {
      if (songs.some((song) => song.youtubeId === newSongId)) {
        Alert.alert('Invalid Input', 'This song already exists in the playlist');
        return;
      }
      const newSong: Song = {
        id: (songs.length + 1).toString(),
        title: newSongTitle,
        artist: newSongArtist,
        youtubeId: newSongId,
        count: 0,
        isYES: false,
      };
      setSongs((prevSongs) => [...prevSongs, newSong]);
      setSwipeProgress((prevSwipeProgress) => [...prevSwipeProgress, new Animated.Value(0)]);
      setNewSongTitle('');
      setNewSongArtist('');
      setNewSongId('');
      setIsModalVisible(false);

      // Set the new song as the random song
      setRandomSong(newSong);
    } else {
      Alert.alert('Invalid Input', 'Please provide title, artist, and YouTube ID.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setSelectedSongIndex(null);
  };

  // Cancel adding song
  const handleCancel = () => {
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongId('');
    setIsModalVisible(false);
  };

  // Render swipeable delete action
  const renderRightActions = (index: number) => {
    return (
      <Animated.View style={[styles.deleteButton, { opacity: swipeProgress[index] }]}>
        <TouchableOpacity
          style={styles.deleteButtonTouchable}
          onPress={() => {
            setSelectedSongIndex(index);
            setIsDeleteModalVisible(true);
          }}
        >
          <Icon name="trash" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSwipeProgress = (index: number, progress: number) => {
    Animated.timing(swipeProgress[index], {
      toValue: progress, // Animate based on swipe progress
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>로딩 중...</Text>
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

  // Define the header component to be included in FlatList
  const renderListHeader = () => (
    <View style={styles.headerWrapper}>
      {randomSong && (
        <ImageBackground
          source={{ uri: getYouTubeThumbnail(randomSong.youtubeId) }}
          style={styles.headerBackground}
          imageStyle={styles.headerImage} // Apply scaling here
          resizeMode="cover"
        >
          {/* Gradient overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.gradient}
          >
            {/* Header Content */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>지금 떠오르는</Text>

              {/* Add Song Button */}
              <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Icon name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContainer2}>
              <Text style={styles.title2}>{'\n'}음악 플레이리스트</Text>
              {/* Shuffle Button */}
              <TouchableOpacity style={styles.shuffleButton} onPress={shuffleSongs}>
                <Icon name="shuffle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="검색할 음악"
              placeholderTextColor="#ccc"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </LinearGradient>
        </ImageBackground>
      )}
    </View>
  );

  return (
    <AnimatedScreen>
      <View style={styles.container}>
        {/* Music List */}
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.youtubeId}
          ListHeaderComponent={renderListHeader} // Include header here
          contentContainerStyle={styles.listContent} // Added padding at the end
          renderItem={({ item, index }) => (
            <Swipeable
              ref={(ref) => (swipeableRefs.current[index] = ref as Swipeable)}
              renderRightActions={() => renderRightActions(index)}
              onSwipeableWillOpen={() => handleSwipeProgress(index, 1)} // Start animation on swipe open
              onSwipeableWillClose={() => handleSwipeProgress(index, 0)} // End animation on swipe close
            >
              <TouchableOpacity onPress={() => handleMusicClick(getYouTubeUrl(item.youtubeId))}>
                <View style={styles.item}>
                  <View style={styles.albumCover}>
                    <Image
                      source={{ uri: getYouTubeThumbnail(item.youtubeId) }}
                      style={styles.thumbnail}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.musicTitle}>{item.title}</Text>
                    <Text style={styles.musicArtist}>{item.artist}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
        />

        {/* Add Song Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>음악 추가하기</Text>
              <TextInput
                style={styles.input}
                placeholder="음악 제목"
                placeholderTextColor="#999"
                value={newSongTitle}
                onChangeText={setNewSongTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="아티스트"
                placeholderTextColor="#999"
                value={newSongArtist}
                onChangeText={setNewSongArtist}
              />
              <TextInput
                style={styles.input}
                placeholder="Youtube ID"
                placeholderTextColor="#999"
                value={newSongId}
                onChangeText={setNewSongId}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddSong}>
                  <Text style={styles.saveButtonText}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={isDeleteModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>정말로 삭제 하시겠습니까?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDelete}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleDeleteSong}>
                  <Text style={styles.saveButtonText}>삭제하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AnimatedScreen>
  );
};

export default HomeScreenComponent;

// 스타일링
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerWrapper: {
    marginBottom: 20,
  },
  headerBackground: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  headerImage: {
    transform: [{ scale: 1.4 }],
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom:-5,
  },
  title2: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom:-10,
    color: '#fff',
  },
  shuffleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 40,
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    marginTop: -20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 15,
    borderRadius: 20,
    color: '#333',
  },
  item: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#fff',
  },
  albumCover: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '140%',
    height: '140%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  musicArtist: {
    fontSize: 14,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    borderRadius: 20,
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButtonTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 80, // Extra space at the end of the list
  },
});
