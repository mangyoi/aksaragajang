import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
  Dimensions, Alert, Modal, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../utils/firebase/config';
import { signOut } from 'firebase/auth';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type StreakData = {
  streak: number;
  lastLogin: string;
  isStreakActive: boolean;
  lastMaterialAccess?: string;
  materialTimeSpent?: number;
};

const ProfileScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const loadTimeData = async () => {
      const stored = await AsyncStorage.getItem('appTimeData');
      if (stored) {
        const data = JSON.parse(stored);
        setTotalTimeSpent(data.totalTimeSpent || 0);
      }
    };

    const interval = setInterval(loadTimeData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/');
        return;
      }

      // Set user name
      if (user.displayName) {
        setUserName(user.displayName);
      } else {
        const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
        setUserName(emailPrefix);
      }

      // Load streak data
      const storedStreakData = await AsyncStorage.getItem('userStreakData');
      if (storedStreakData) {
        const streakData = JSON.parse(storedStreakData) as StreakData;
        setStreakCount(streakData.streak);
        generateWeeklyStreak(streakData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const generateWeeklyStreak = (streakData: StreakData) => {
    const weekStreak = [false, false, false, false, false, false, false];
    for (let i = 0; i < Math.min(streakData.streak - 1, 7); i++) {
      weekStreak[i] = true;
    }
    if (streakData.isStreakActive && streakData.streak > 0 && streakData.streak <= 7) {
      weekStreak[streakData.streak - 1] = true;
    }
    setWeeklyStreak(weekStreak);
  };

  const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} jam ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'Fitur ubah password akan segera hadir');
  };

  const handleOtherSettings = () => {
    setLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('loginTimestamp');
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Gagal logout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#3D3D8B" />
          </View>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Halo, {userName}!</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Waktu yang kamu habiskan</Text>
          <Text style={styles.timeText}>{formatTimeSpent(totalTimeSpent)}</Text>
        </View>

        <View style={[styles.card, styles.streakCard]}>
          <Text style={styles.streakTitle}>Streak</Text>
          <View style={styles.streakDays}>
            {weeklyStreak.map((isActive, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayNumber}>{index + 1}</Text>
                <Image 
                  style={styles.streakIcon} 
                  source={isActive 
                    ? require('../../assets/images/tampilan/icon/fire-on.png')
                    : require('../../assets/images/tampilan/icon/fire-off.png')
                  } 
                />
              </View>
            ))}
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>progresmu bagus, teruslah belajar</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, styles.changePasswordButton]} onPress={handleChangePassword}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonLeft}>
              <Feather name="edit-3" size={24} color="#000" />
              <Text style={styles.buttonText}>Ubah Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={handleOtherSettings}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonLeft}>
              <Feather name="settings" size={24} color="#000" />
              <Text style={styles.buttonText}>Pengaturan Lainnya</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>LogOut</Text>
            </TouchableOpacity>
            <Text style={styles.logoutInfoText}>
              Jika kamu logout kamu{'\n'}
              tidak akan kehilangan{'\n'}
              progresmu, namun kamu{'\n'}
              perlu melakukan login{'\n'}
              kembali
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  avatarSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7E80D8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  greetingContainer: {
    backgroundColor: '#7E80D8',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  greetingText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFD700',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 15,
  },
  streakCard: {
    backgroundColor: '#FFD700',
    borderColor: '#000',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  streakIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  progressContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 15,
  },
  changePasswordButton: {
    backgroundColor: '#FFD700',
  },
  settingsButton: {
    backgroundColor: '#FFD700',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#7E80D8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    borderWidth: 2,
    borderColor: '#000000',
  },
  logoutButton: {
    backgroundColor: '#FF3333',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutInfoText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
});

export default ProfileScreen;
