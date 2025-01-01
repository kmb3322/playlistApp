// App.tsx
import * as React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import your screen components
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';

const Tab = createBottomTabNavigator();

// 커스텀 탭 바 컴포넌트
const MyTabBar = ({ state, descriptors, navigation }) => {
  const [translateX] = React.useState(new Animated.Value(0));
  const [tabWidth, setTabWidth] = React.useState((Dimensions.get('window').width - 40) / state.routes.length);

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [state.index, tabWidth]);

  // 화면 회전 등으로 레이아웃이 변경될 때 tabWidth 재계산
  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width / state.routes.length);
  };

  return (
    <View style={styles.tabBarContainer} onLayout={onLayout}>
      <View style={styles.tabBar}>
        {/* 하이라이트 영역 */}
        <Animated.View
          style={[
            styles.highlight,
            {
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
        {/* 탭 아이콘 */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName = '';
          if (route.name === 'Home') {
            iconName = 'musical-note';
          } else if (route.name === 'Search') {
            iconName = 'trophy';
          } else if (route.name === 'Profile') {
            iconName = 'images';
          }

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              key={index}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={1}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? '#6200ee' : 'gray'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false, // 헤더 제거
              tabBarShowLabel: false, // 라벨 숨기기
            }}
            tabBar={(props) => <MyTabBar {...props} />}
          >
            {/* 'Home' 탭 */}
            <Tab.Screen name="Home" component={HomeScreen} />

            {/* 'Search' 탭 */}
            <Tab.Screen name="Search" component={SearchScreen} />

            {/* 'Profile' 탭 */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// 추가 스타일 정의
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    // Optionally, add some opacity
    // opacity: 0.3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Adjust width if necessary
  },
});
