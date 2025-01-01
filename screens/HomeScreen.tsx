// screens/HomeScreen.tsx
import React from 'react';
import AnimatedScreen from '../components/AnimatedScreen';
import HomeScreenComponent from '../components/HomeScreenComponent';

const HomeScreen: React.FC = () => {
  return (
    <AnimatedScreen>
      <HomeScreenComponent />
    </AnimatedScreen>
  );
};

export default HomeScreen;
