import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

const MainMenu = () => {
  const router = useRouter();
  // State untuk melacak tab aktif di bottom navbar
  const [activeTab, setActiveTab] = useState('home');

  // Fungsi untuk handle ketika tab di bottom navbar ditekan
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    
    // Navigasi ke screen yang sesuai berdasarkan tab
    switch(tabName) {
      case 'materi':
        router.push('/materi');
        break;
      case 'home':
        // Tetap di screen ini jika home yang ditekan
        break;
      case 'permainan':
        // Arahkan ke halaman permainan
        router.push('/gameA'); // Sesuaikan dengan rute permainan yang Anda inginkan
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          style={styles.catIcon}
        />
      </View>

      <View style={styles.titleContainer}>
        <Image 
          source={require('../../assets/images/tampilan/mainmenu.png')}
          style={styles.titleImage} 
        />
      </View>

      <TouchableOpacity 
        style={styles.materiCard}
        onPress={() => router.push('/materi')}
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

      {/* Bottom Navigation Bar */}
      {/* <BottomNavBar 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  catIcon: {
    width: 40,
    height: 40,
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
  // Bisa ditambahkan style khusus untuk bottom navbar jika diperlukan
});

export default MainMenu;