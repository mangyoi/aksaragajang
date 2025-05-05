import { auth } from '../../utils/firebase/config';
import { signOut } from 'firebase/auth';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
// import { useAppTimeTracker } from '../../hooks/useAppTimeTracker';

type StreakData = {
  streak: number;
  lastLogin: string;
  isStreakActive: boolean;
  lastMaterialAccess?: string;
  materialTimeSpent?: number;
};

const MainMenu = () => {
  const router = useRouter();
  const [streakCount, setStreakCount] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [userName, setUserName] = useState('');
  const [isStreakActive, setIsStreakActive] = useState(false);
  
  // Use the app time tracker hook
  // const { startSession, endSession } = useAppTimeTracker();

  useEffect(() => {
    // Start tracking time when MainMenu loads
    // startSession();

    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace('/');
          return;
        }

        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          const emailPrefix = user.email ? user.email.split('@')[0] : 'Siswa';
          setUserName(emailPrefix);
        }

        await checkAndUpdateStreak();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    // Cleanup when component unmounts
    // return () => {
    //   // endSession();
    // };
  }, []);

  const checkAndUpdateStreak = async (): Promise<void> => {
    try {
      const storedStreakData = await AsyncStorage.getItem('userStreakData');
      const today = new Date().toDateString();
      
      if (storedStreakData) {
        const parsedData = JSON.parse(storedStreakData) as StreakData;
        const { streak, lastLogin, isStreakActive: storedStreakActive, lastMaterialAccess, materialTimeSpent } = parsedData;
        
        setStreakCount(streak);
        setLastLoginDate(lastLogin);
        
        const lastLoginDate = new Date(lastLogin).toDateString();
        
        if (lastLoginDate !== today) {
          // New day login
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();
          
          if (lastLoginDate === yesterdayString) {
            // Consecutive day login
            const newStreak = streak + 1;
            setStreakCount(newStreak);
            // Set streak as inactive by default for new day
            setIsStreakActive(false);
            await saveStreakData(newStreak, today, false);
          } else {
            // Streak broken
            setStreakCount(1);
            setIsStreakActive(false);
            await saveStreakData(1, today, false);
          }
        } else {
          // Same day login - check if streak is active
          if (lastMaterialAccess && materialTimeSpent) {
            const timeSinceLastAccess = new Date().getTime() - new Date(lastMaterialAccess).getTime();
            const timeSpentToday = materialTimeSpent;
            
            // If spent at least 60 seconds on material today
            if (timeSpentToday >= 60) {
              setIsStreakActive(true);
              await saveStreakData(streak, today, true, lastMaterialAccess, materialTimeSpent);
            } else {
              setIsStreakActive(false);
            }
          } else {
            setIsStreakActive(storedStreakActive || false);
          }
        }
      } else {
        // First time user
        setStreakCount(1);
        setIsStreakActive(false);
        await saveStreakData(1, today, false);
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const saveStreakData = async (
    streak: number, 
    date: string, 
    isActive: boolean,
    lastMaterialAccess?: string,
    materialTimeSpent?: number
  ): Promise<void> => {
    try {
      const streakData: StreakData = {
        streak,
        lastLogin: date,
        isStreakActive: isActive,
        lastMaterialAccess,
        materialTimeSpent
      };
      await AsyncStorage.setItem('userStreakData', JSON.stringify(streakData));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  };

  // Modified function to handle navigation to materi with time tracking
  const handleMateriNavigation = () => {
    // Save the current time when entering materi
    AsyncStorage.setItem('materiStartTime', new Date().toISOString());
    router.push('/materi');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Updated header with integrated elements */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.integratedHeader}
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>Halo, {userName}!</Text>
          </View>
          <View style={styles.rightSection}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{streakCount}</Text>
              <Image 
                style={styles.streakIcon} 
                source={isStreakActive 
                  ? require('../../assets/images/tampilan/icon/fire-on.png')
                  : require('../../assets/images/tampilan/icon/fire-off.png') 
                } 
              />
            </View>
            <View style={styles.profileIconContainer}>
              <Feather name="user" size={24} color="#1B4D89" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Lampu berada tepat di kanan box */}
        <TouchableOpacity style={styles.bulbIconContainer}>
          <Image
            source={require('../../assets/images/tampilan/icon/bulb.png')}
            style={styles.bulbIcon}
          />
        </TouchableOpacity>
      </View>


      <View style={styles.titleContainer}>
        <Image 
          source={require('../../assets/images/tampilan/mainmenu.png')}
          style={styles.titleImage} 
        />
      </View>

      <TouchableOpacity 
        style={styles.materiCard}
        onPress={handleMateriNavigation}
      >
        <Text style={styles.materiTitle}>Materi</Text>
        <Text style={styles.materiSubtitle}>kompolan carakan</Text>
        <Text style={styles.materiSubtitle}>kalaban sowara</Text>
      </TouchableOpacity>

      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.gridButton, styles.purpleButton]}
            onPress={() => router.push('/kuis')}
          >
            <Text style={styles.buttonText}>Quis</Text>
            <Text style={styles.buttonSubtext}>Analisis game</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridButton, styles.purpleButton]}
            onPress={() => router.push('/gameA')}
          >
            <Text style={styles.buttonText}>Game 1</Text>
            <Text style={styles.buttonSubtext}>Analisis game</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.gridButton, styles.purpleButton]}
            onPress={() => router.push('/gameB')}
          >
            <Text style={styles.buttonText}>Game 2</Text>
            <Text style={styles.buttonSubtext}>Analisis game</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridButton, styles.purpleButton]}
            onPress={() => router.push('/gameC')}
          >
            <Text style={styles.buttonText}>Game 3</Text>
            <Text style={styles.buttonSubtext}>Analisis game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  integratedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFE4B5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FFA500',
    flex: 1, // ini penting agar ambil sisa lebar
  },
  bulbIconContainer: {
    marginLeft: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFD580',
  },
  bulbIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD580',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginRight: 5, 
  },
  streakIcon: {
    width: 20,
    height: 20, 
    resizeMode: 'contain', 
  },
  // bulbIconContainer: {
  //   marginLeft: 10,
  //   padding: 4,
  // },
  // bulbIcon: {
  //   width: 24,
  //   height: 24,
  //   resizeMode: 'contain',
  // },
  profileIconContainer: {
    padding: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleImage: {
    width: 400,
    height: 200,
    resizeMode: 'contain',
  },
  materiCard: {
    backgroundColor: '#F7DA30',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'flex-start',
    borderWidth: 2,         
    borderColor: '#000000',
  },
  materiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  materiSubtitle: {
    fontSize: 16,
    color: '#000000',
  },
  gridContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridButton: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  purpleButton: {
    backgroundColor: '#7E80D8',
    borderWidth: 2,         
    borderColor: '#000000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default MainMenu;