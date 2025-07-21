import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {

      router.replace('/(tabs)'); 
    }, 4000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
  
      <View style={styles.mainContent}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5D922',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  mainContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    height: 250
  },

});