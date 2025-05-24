import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../utils/firebase/config';
import { AntDesign } from '@expo/vector-icons';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  
  const router = useRouter();

  const showErrorModal = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showErrorModal('Error', 'Silakan isi semua field');
      return;
    }

    setIsLoading(true);

    try {
      if (username === 'admin' && password === 'admin') {
        console.log('Admin login mode');
        await AsyncStorage.setItem('userStreakData', JSON.stringify({
          streak: 1,
          lastLogin: new Date().toDateString()
        }));
        router.push('/mainmenu');
        setIsLoading(false);
        return;
      }

      const emailToUse = username.includes('@') ? username : `${username}@example.com`;
      
      console.log('Attempting to sign in with Firebase:', emailToUse);
      
      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log('Firebase login successful');
      
      await updateStreak();
      
      router.push('/mainmenu');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Username atau password salah';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'User tidak ditemukan';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Password salah';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Username atau password salah';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Koneksi jaringan bermasalah';
            break;
          default:
            errorMessage = `Error: ${error.code}`;
        }
      }
      
      showErrorModal('Login Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password) {
      showErrorModal('Error', 'Silakan isi semua field');
      return;
    }

    if (password.length < 6) {
      showErrorModal('Error', 'Password harus minimal 6 karakter');
      return;
    }

    const emailToUse = isSignUp && email ? email : `${username}@example.com`;
    if (!emailToUse.includes('@')) {
      showErrorModal('Error', 'Format email tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to create account with Firebase:', emailToUse);
      
      const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, password);
      console.log('Account created successfully with UID:', userCredential.user.uid);
      
      await updateProfile(userCredential.user, {
        displayName: username
      });
      console.log('Profile updated with displayName:', username);
      
      await initializeStreak();
      
      router.push('/mainmenu');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat mendaftar';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email sudah digunakan';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password terlalu lemah';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Koneksi jaringan bermasalah';
            break;
          default:
            errorMessage = `Error: ${error.code}`;
        }
      }
      
      showErrorModal('Pendaftaran Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeStreak = async () => {
    try {
      const today = new Date().toDateString();
      const initialStreakData = {
        streak: 1,
        lastLogin: today
      };
      await AsyncStorage.setItem('userStreakData', JSON.stringify(initialStreakData));
    } catch (error) {
      console.error('Error initializing streak:', error);
    }
  };

  const updateStreak = async () => {
    try {
      const streakDataJSON = await AsyncStorage.getItem('userStreakData');
      const today = new Date().toDateString();
      
      if (streakDataJSON) {
        const streakData = JSON.parse(streakDataJSON);
        const lastLoginDate = new Date(streakData.lastLogin).toDateString();
        
        if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();
          
          if (lastLoginDate === yesterdayString) {
            const newStreak = streakData.streak + 1;
            const newStreakData = {
              streak: newStreak,
              lastLogin: today
            };
            await AsyncStorage.setItem('userStreakData', JSON.stringify(newStreakData));
          } 
          else {
            const newStreakData = {
              streak: 1,
              lastLogin: today
            };
            await AsyncStorage.setItem('userStreakData', JSON.stringify(newStreakData));
          }
        }
      } else {
        await initializeStreak();
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/tampilan/logoapl.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.headerText}>
          {isSignUp ? 'Daftar Akun Baru' : 'Login'}
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/tampilan/icon/user.png')} 
              style={styles.icon}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={isSignUp ? "nyama" : "nyama atau email"}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {isSignUp && (
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../assets/images/tampilan/icon/user.png')} 
                style={styles.icon}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/tampilan/icon/locked-computer.png')} 
              style={styles.icon}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="password"
            secureTextEntry={!showPassword} 
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
            <Image 
              source={
                showPassword 
                  ? require('../../assets/images/tampilan/icon/view.png') 
                  : require('../../assets/images/tampilan/icon/hide.png') 
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {!isSignUp && (
          <Text style={styles.loginTip}>
            Gunakan email lengkap untuk login jika sudah terdaftar
          </Text>
        )}

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>
              {isSignUp ? 'Daftar' : 'mayu ajer'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)}
          style={styles.switchModeContainer}
        >
          <Text style={styles.switchModeText}>
            {isSignUp ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>otaba</Text>

        <TouchableOpacity style={styles.googleButton}>
          <Image 
            style={styles.googleLogo}
          />
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setErrorModalVisible(false)}
        >
          <View 
            style={styles.modalContent} 
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{errorModalTitle}</Text>
              <TouchableOpacity onPress={() => setErrorModalVisible(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <AntDesign name="exclamationcircle" size={50} color="#FF3B30" style={styles.modalIcon} />
              <Text style={styles.modalMessage}>{errorModalMessage}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7B7EDE', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    marginVertical: 10,
    width: '100%',
    height: 50,
  },
  iconContainer: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  icon: {
    width: 20,
    height: 20,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#F7DA30', 
    width: '100%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  switchModeContainer: {
    marginTop: 15,
  },
  switchModeText: {
    color: '#7B7EDE',
    fontSize: 14,
  },
  separator: {
    marginVertical: 15,
    color: '#777',
  },
  googleButton: {
    width: 140,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  googleLogo: {
    width: 100,
    height: 20,
    resizeMode: 'contain',
  },
  loginTip: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
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
    padding: 25,
    width: '85%',
    borderWidth: 2,
    borderColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#7B7EDE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LoginScreen;