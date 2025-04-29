  import React, { useState } from 'react';
  import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
  } from 'react-native';
  import { useRouter } from 'expo-router'; 


  const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

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
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../assets/images/tampilan/icon/user.png')} 
                style={styles.icon}
                
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="nyama"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password Input */}
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

          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/mainmenu')}>
            <Text style={styles.loginButtonText}>mayu ajer</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>otaba</Text>

          <TouchableOpacity style={styles.googleButton}>
            <Image 
              // source={require('./assets/images/google-logo.png')} 
              style={styles.googleLogo}
            />
          </TouchableOpacity>
        </View>
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
  
    logoSquare: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 15,
      height: 15,
      backgroundColor: '#F7DA30',
      borderWidth: 1,
      borderColor: 'black',
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
  });

  export default LoginScreen;