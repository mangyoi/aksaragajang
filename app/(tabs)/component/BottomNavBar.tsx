// ../app/(tabs)/component/BottomNavBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Pastikan Anda menginstal expo/vector-icons

interface BottomNavBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('materi')}
      >
        <Ionicons 
          name="book-outline" 
          size={24} 
          color={activeTab === 'materi' ? '#1E3A8A' : 'black'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'materi' && styles.activeTabText
        ]}>materi</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('home')}
      >
        <Ionicons 
          name="home-outline" 
          size={24} 
          color={activeTab === 'home' ? '#1E3A8A' : 'black'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'home' && styles.activeTabText
        ]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('permainan')}
      >
        <Ionicons 
          name="grid-outline" 
          size={24} 
          color={activeTab === 'permainan' ? '#1E3A8A' : 'black'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'permainan' && styles.activeTabText
        ]}>Permainan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#7DD3FC', // Warna biru muda seperti pada gambar
    paddingVertical: 10,
    borderRadius: 100, // Membuat sudut sangat melengkung
    marginHorizontal: 0,
    marginBottom: 0,
    marginTop: 10,
    justifyContent: 'space-around',
    elevation: 5, // Untuk bayangan di Android
    shadowColor: '#000', // Bayangan untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  tabText: {
    fontSize: 12,
    marginTop: 3,
    color: 'black',
  },
  activeTabText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  }
});

export default BottomNavBar;