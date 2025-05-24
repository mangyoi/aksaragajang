import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity, 
  ScrollView,
  Dimensions, 
  Alert, 
  Modal, 
  Image, 
  TextInput, 
  ActivityIndicator,
  Share,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../utils/firebase/config';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { MaterialIcons, Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

type StreakData = {
  streak: number;
  lastLogin: string;
  isStreakActive: boolean;
  lastMaterialAccess?: string;
  materialTimeSpent?: number;
};

type StreakDay = {
  dayNumber: number;
  isActive: boolean;
};

const ProfileScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const [displayedStreak, setDisplayedStreak] = useState<StreakDay[]>([]);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [lastSharedMilestone, setLastSharedMilestone] = useState<number | null>(null);
  const shareMilestones = [7, 30, 100, 200];
  

  // State untuk modal share
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showMilestoneWarning, setShowMilestoneWarning] = useState(false);

  
  // Referensi untuk ViewShot
  const shareViewRef = useRef<any>(null);

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

      if (user.displayName) {
        setUserName(user.displayName);
      } else {
        const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
        setUserName(emailPrefix);
      }

      const storedStreakData = await AsyncStorage.getItem('userStreakData');
      if (storedStreakData) {
        const streakData = JSON.parse(storedStreakData) as StreakData;
        setStreakCount(streakData.streak);
        generateDisplayedStreak(streakData);
      }

      const storedSharedMilestone = await AsyncStorage.getItem('lastSharedMilestone');
      if (storedSharedMilestone) {
        setLastSharedMilestone(parseInt(storedSharedMilestone));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const generateDisplayedStreak = (streakData: StreakData) => {
    const currentStreak = streakData.streak;
    const displayDays: StreakDay[] = [];
    
    let startDay = 1;
    if (currentStreak > 7) {
      startDay = currentStreak - 6; 
    }
    
    for (let i = 0; i < 7; i++) {
      const dayNumber = startDay + i;
      const isActive = dayNumber < currentStreak || (dayNumber === currentStreak && streakData.isStreakActive);
      displayDays.push({ dayNumber, isActive });
    }
    
    setDisplayedStreak(displayDays);
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
    setChangePasswordModalVisible(true);
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
  
  const validatePasswordChange = () => {
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Password saat ini harus diisi');
      return false;
    }
    
    if (!newPassword) {
      setPasswordError('Password baru harus diisi');
      return false;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru tidak cocok dengan konfirmasi');
      return false;
    }
    
    return true;
  };
  
  const handlePasswordChange = async () => {
    if (!validatePasswordChange()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('User tidak ditemukan');
      }
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      
      setPasswordSuccess(true);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setPasswordSuccess(false);
        setChangePasswordModalVisible(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Password saat ini salah');
      } else if (error.code === 'auth/too-many-requests') {
        setPasswordError('Terlalu banyak percobaan. Coba lagi nanti');
      } else {
        setPasswordError('Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const closePasswordModal = () => {
    setChangePasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  // Fungsi untuk menampilkan modal share
const handleShowShareModal = () => {
  const isMilestone = shareMilestones.includes(streakCount);

  if (!isMilestone || lastSharedMilestone === streakCount) {
    setShowMilestoneWarning(true);
    return;
  }

  setShareModalVisible(true);
};




  // Fungsi untuk melakukan share
  const handleShare = async () => {
    if (!shareViewRef.current) {
      Alert.alert('Error', 'Tidak dapat mengambil gambar');
      return;
    }
    
    try {
      setIsSharing(true);
      
      // Capture view as image
      const uri = await shareViewRef.current.capture();
      console.log('Captured URI:', uri);
      
      // For Android, we need to save to a temporary file location that other apps can access
      let shareUri = uri;
      
      if (Platform.OS === 'android') {
        const tempFilePath = `${FileSystem.cacheDirectory}share-image-${Date.now()}.jpg`;
        await FileSystem.copyAsync({
          from: uri,
          to: tempFilePath
        });
        shareUri = tempFilePath;
      }
      
      // Share image based on platform
      if (Platform.OS === 'ios') {
        // On iOS, we can use React Native's Share API with both message and URL
        const shareOptions = {
          title: 'Bagikan Statistik Belajar Saya',
          message: `Saya telah belajar Bahasa Carakan selama ${streakCount} hari berturut-turut dengan total waktu belajar ${formatTimeSpent(totalTimeSpent)}! #BelajarCarakan`,
          url: shareUri
        };
        
        await Share.share(shareOptions);
      } else if (Platform.OS === 'android') {
        // On Android, if both message and URL are provided, only the URL will be used
        // So we'll use expo-sharing which handles file sharing better
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareUri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Bagikan Statistik Belajar Saya'
          });
        } else {
          // Fallback to React Native's Share API
          const shareOptions = {
            title: 'Bagikan Statistik Belajar Saya',
            url: shareUri
          };
          
          await Share.share(shareOptions);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Gagal membagikan statistik. Silakan coba lagi.');
    } finally {
      setIsSharing(false);
      setShareModalVisible(false);
      await AsyncStorage.setItem('lastSharedMilestone', streakCount.toString());
      setLastSharedMilestone(streakCount);
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
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Streak</Text>
            <View style={styles.streakActions}>
              <Text style={styles.streakCountText}>Total: {streakCount} hari</Text>
              <TouchableOpacity style={styles.shareButton} onPress={handleShowShareModal}>
                <FontAwesome name="share-alt" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.streakDays}>
            {displayedStreak.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                <Image 
                  style={styles.streakIcon} 
                  source={day.isActive 
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

      {/* Modal Logout */}
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
      
      {/* Modal Change Password */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={closePasswordModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closePasswordModal}
        >
          <View 
            style={styles.passwordModalContent} 
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.passwordModalHeader}>
              <Text style={styles.passwordModalTitle}>Ubah Password</Text>
              <TouchableOpacity onPress={closePasswordModal}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {passwordSuccess ? (
              <View style={styles.successContainer}>
                <AntDesign name="checkcircle" size={60} color="#4CAF50" />
                <Text style={styles.successText}>Password berhasil diubah!</Text>
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password Saat Ini</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Masukkan password saat ini"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password Baru</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Konfirmasi Password</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Konfirmasi password baru"
                    placeholderTextColor="#999"
                  />
                </View>
                
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
                
                <TouchableOpacity 
                  style={styles.changePasswordSubmitButton}
                  onPress={handlePasswordChange}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.changePasswordSubmitText}>Ubah Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Share Streak */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShareModalVisible(false)}
        >
          <View 
            style={styles.shareModalContent} 
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>Bagikan Statistik Belajar</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Konten yang akan diambil screenshot */}
            <ViewShot 
              ref={shareViewRef} 
              options={{ format: 'jpg', quality: 0.9 }}
              style={styles.shareImageContainer}
            >
              <View style={styles.shareCard}>
                <View style={styles.shareHeader}>
                  <Image 
                    source={require('../../assets/images/tampilan/icon/fire-on.png')} 
                    style={styles.shareLogo} 
                  />
                  <Text style={styles.shareAppName}>Carakan</Text>
                </View>
                
                <View style={styles.shareContent}>
                  <Text style={styles.shareUserName}>{userName}</Text>
                  
                  <View style={styles.shareStatsContainer}>
                    <View style={styles.shareStatColumn}>
                      <Text style={styles.shareStatTitle}>
                        STREAK BELAJAR
                      </Text>
                      <View style={styles.shareStreakCount}>
                        <Text style={styles.shareCountNumber}>{streakCount}</Text>
                        <Text style={styles.shareDaysText}>HARI</Text>
                      </View>
                    </View>
                    
                    <View style={styles.shareStatDivider} />
                    
                    <View style={styles.shareStatColumn}>
                      <Text style={styles.shareStatTitle}>
                        WAKTU BELAJAR
                      </Text>
                      <View style={styles.shareTimeContainer}>
                        <Image 
                          source={require('../../assets/images/tampilan/icon/fire-on.png')}
                          style={styles.shareTimeIcon}
                        />
                        <Text style={styles.shareTimeText}>{formatTimeSpent(totalTimeSpent)}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Bagian streak days */}
                  <View style={styles.shareStreakContainer}>
                    <Text style={styles.shareStreakSubtitle}>Riwayat Streak</Text>
                    <View style={styles.shareStreakDays}>
                      {displayedStreak.map((day, index) => (
                        <View key={index} style={styles.shareDayContainer}>
                          <Text style={styles.shareDayNumber}>{day.dayNumber}</Text>
                          <Image 
                            style={styles.shareStreakIcon} 
                            source={day.isActive 
                              ? require('../../assets/images/tampilan/icon/fire-on.png')
                              : require('../../assets/images/tampilan/icon/fire-off.png')
                            } 
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <Text style={styles.shareMessage}>
                    Ayo belajar Bahasa Carakan bersama!
                  </Text>
                </View>
              </View>
            </ViewShot>
            
            <TouchableOpacity 
              style={styles.shareButton2}
              onPress={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <FontAwesome name="share-alt" size={20} color="#FFF" style={styles.shareButtonIcon} />
                  <Text style={styles.shareButtonText}>Bagikan Statistik Belajar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showMilestoneWarning}
        onRequestClose={() => setShowMilestoneWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Belum Bisa Dibagikan
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              Fitur bagikan akan aktif saat kamu mencapai streak 7, 30, 100, atau 200 hari.
            </Text>
            <TouchableOpacity
              onPress={() => setShowMilestoneWarning(false)}
              style={[styles.shareButton2, { backgroundColor: '#7E80D8' }]}
            >
              <Text style={styles.shareButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  streakCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: '#FFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
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
  passwordModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    borderWidth: 2,
    borderColor: '#000000',
  },
  passwordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  changePasswordSubmitButton: {
    backgroundColor: '#7E80D8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  changePasswordSubmitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
  },
  
  // Style untuk modal Share Streak
  shareModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    width: '100%',
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  shareImageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCard: {
    width: width * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E80D8',
    padding: 15,
  },
  shareLogo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  shareAppName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  shareContent: {
    padding: 20,
    alignItems: 'center',
  },
  shareUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  shareStreakTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  shareStreakCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shareCountNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  shareDaysText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareStreakDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  shareDayContainer: {
    alignItems: 'center',
  },
  shareDayNumber: {
    fontSize: 12,
    color: '#000',
    marginBottom: 5,
  },
  shareStreakIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  shareMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  shareButton2: {
    backgroundColor: '#7E80D8',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    width: '80%',
  },
  shareButtonIcon: {
    marginRight: 10,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Styles tambahan untuk share modal dengan waktu bermain
  shareStatsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  shareStatColumn: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  shareStatDivider: {
    width: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 5,
  },
  shareStatTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  shareTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTimeIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  shareTimeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4D5BD1',
    textAlign: 'center',
  },
  shareStreakContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  shareStreakSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default ProfileScreen;