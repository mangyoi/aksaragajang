import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView,
  ScrollView, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  BackHandler 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SowaraItem {
  id: string;
  imageSource: any | null;
}

interface ContoItem {
  id: string;
  text: string;
  imageSource: any; 
}

interface PronounceItem {
  id: string;
  imageSource: any;
}

type StreakData = {
  streak: number;
  lastLogin: string;
  isStreakActive: boolean;
  lastMaterialAccess?: string;
  materialTimeSpent?: number;
};

const sowaraData: SowaraItem[] = [
  { 
    id: '1', 
    imageSource: require('../../assets/images/tampilan/aksara/a.png')
  },
  { 
    id: '2', 
    imageSource: require('../../assets/images/tampilan/aksara/na.png')
  },
  { 
    id: '3', 
    imageSource: require('../../assets/images/tampilan/aksara/ca.png')
  },
  { 
    id: '4', 
    imageSource: null
  },
];

const conto: ContoItem[] = [
  { 
    id: '1', 
    text: 'arapa',
    imageSource: require('../../assets/images/tampilan/contoh/conto.png')  
  },
  { 
    id: '2', 
    text: 'nagara',
    imageSource: require('../../assets/images/tampilan/contoh/conto2.png')  
  },
  { 
    id: '3', 
    text: 'kaca',
    imageSource: require('../../assets/images/tampilan/contoh/conto3.png')  
  },
];

const mainImages = [
  require('../../assets/images/tampilan/carakan.png'),
  require('../../assets/images/tampilan/pangangguy.png'),
];

const pronounceData: PronounceItem[] = Array(20).fill(null).map((_, index) => ({
  id: index.toString(),
  imageSource: require('../../assets/images/tampilan/aksara/a.png') 
}));

const CarakanApp = () => {
  const [pronounceModalVisible, setPronounceModalVisible] = useState(false);
  const router = useRouter();
  const startTimeRef = useRef<Date | null>(null);
  const [timeSpentAlert, setTimeSpentAlert] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    startTimeRef.current = new Date();
    console.log('Started tracking time at:', startTimeRef.current);
    const hasShownStreakToday = async (): Promise<boolean> => {
    const shownDate = await AsyncStorage.getItem('streakShownDate');
    const today = new Date().toDateString();
    return shownDate === today;
    };

    const markStreakShownToday = async () => {
    const today = new Date().toDateString();
    await AsyncStorage.setItem('streakShownDate', today);
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      backHandler.remove();
      updateTimeSpent();
    };
  }, []);

  const handleBackPress = () => {
    updateTimeSpent();
    router.push('/mainmenu');
    return true;
  };

  const updateTimeSpent = async () => {
  if (!startTimeRef.current) return;

  try {
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);

    console.log('Time spent on materi:', timeSpent, 'seconds');

    const storedStreakData = await AsyncStorage.getItem('userStreakData');
    if (storedStreakData) {
      const streakData = JSON.parse(storedStreakData) as StreakData;
      const today = new Date().toDateString();

      if (streakData.lastLogin === today) {
        const totalTimeSpent = (streakData.materialTimeSpent || 0) + timeSpent;

        console.log('Total time spent today:', totalTimeSpent, 'seconds');

        const updatedStreakData: StreakData = {
          ...streakData,
          lastMaterialAccess: endTime.toISOString(),
          materialTimeSpent: totalTimeSpent,
          isStreakActive: totalTimeSpent >= 60
        };

        await AsyncStorage.setItem('userStreakData', JSON.stringify(updatedStreakData));

        if (
          streakData.materialTimeSpent < 60 &&
          totalTimeSpent >= 60
        ) {
          (async () => {
            const alreadyShown = await hasShownStreakToday();
            if (!alreadyShown) {
              setTimeSpentAlert(true);
              await markStreakShownToday();
            }
          })();
        }

      }
    }
  } catch (error) {
    console.error('Error updating time spent:', error);
  }
};


  const handleBackNavigation = () => {
    updateTimeSpent();
    router.push('/mainmenu');
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!startTimeRef.current) return;
      
      const currentTime = new Date();
      const timeSpent = Math.floor((currentTime.getTime() - startTimeRef.current.getTime()) / 1000);
      
      const storedStreakData = await AsyncStorage.getItem('userStreakData');
      if (storedStreakData) {
        const streakData = JSON.parse(storedStreakData) as StreakData;
        if (!streakData.isStreakActive && timeSpent >= 60) {
          await updateTimeSpent();
          clearInterval(interval);
        }
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const renderSowaraItem = ({ item }: { item: SowaraItem }) => (
    <View style={styles.sowaraItemContainer}>
      {item.imageSource ? (
        <View style={styles.sowaraCircle}>
          <Image 
            source={item.imageSource}
            style={styles.sowaraImage}
          />
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.sowaraCircleMore}
          onPress={() => setPronounceModalVisible(true)}
        >
          <View style={styles.dotContainer}>
            {[...Array(9)].map((_, index) => (
              <View key={index} style={styles.dotPattern} />
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContoItem = (item: ContoItem) => (
    <View key={item.id} style={styles.contoCard}>
      <View style={styles.contoImageBox}>
        <Image 
          source={item.imageSource}
          style={styles.contoImage}
        />
      </View>
      <View style={styles.contoTextBox}>
        <Text style={styles.contoText}>{item.text}</Text>
      </View>
    </View>
  );

  const renderPronounceItem = ({ item }: { item: PronounceItem }) => (
    <TouchableOpacity style={styles.pronounceItem}>
      <Image 
        source={item.imageSource}
        style={styles.pronounceImage}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Carakan</Text>
      </View>

      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          onPress={handleBackNavigation} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../assets/images/tampilan/icon/left-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sliderSection}>
          <View style={styles.sliderCard}>
            <FlatList
              data={mainImages} 
              renderItem={({ item }) => (
                <Image source={item} style={styles.slideImage} />
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true} 
              showsHorizontalScrollIndicator={false} 
              pagingEnabled={true} 
              onScroll={(event) => {
                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentIndex(slideIndex); 
              }}
              scrollEventThrottle={16} 
            />

            <View style={styles.sliderIndicator}>
              {mainImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    currentIndex === index && styles.activeIndicatorDot, 
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sowara</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.sowaraCard}>
            <FlatList
              data={sowaraData}
              renderItem={renderSowaraItem}
              keyExtractor={(item) => item.id}
              horizontal={true}
              contentContainerStyle={styles.sowaraList}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kaangguy Conto</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.contoSection}>
            {conto.map(item => renderContoItem(item))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={pronounceModalVisible}
        onRequestClose={() => setPronounceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>sowara aksara</Text>
              <TouchableOpacity
                onPress={() => setPronounceModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.pronounceTitle}>
                pece' kaangguy{'\n'}ngeding agi
              </Text>

              <FlatList
                data={pronounceData}
                renderItem={renderPronounceItem}
                keyExtractor={item => item.id}
                numColumns={4}
                contentContainerStyle={styles.pronounceGrid}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={timeSpentAlert}
        onRequestClose={() => setTimeSpentAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.streakModalContainer}>
            <View style={styles.streakModalHeader}>
              <Text style={styles.streakModalTitle}>🔥 Streak Aktif!</Text>
              <TouchableOpacity
                onPress={() => setTimeSpentAlert(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.streakModalContent}>
              <Image 
                source={require('../../assets/images/tampilan/icon/fire-on.png')}
                style={styles.streakIcon}
              />
              <Text style={styles.streakMessage}>
                Selamat! Anda telah belajar selama 1 menit.{'\n'}
                Streak hari ini sudah aktif!
              </Text>
              
              <TouchableOpacity
                style={styles.streakButton}
                onPress={() => setTimeSpentAlert(false)}
              >
                <Text style={styles.streakButtonText}>Mantap!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F7DA30',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    borderTopWidth: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    textAlign: 'center',
  },
  
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  sliderSection: {
    paddingHorizontal: 20,
    paddingTop: 12, 
  },
  sliderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000000',
  },
  slideImage: {
    width: width - 72, 
    height: 200, 
    resizeMode: 'contain',
    borderRadius: 12,
  },
  sliderIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0', 
    marginHorizontal: 4,
  },
  activeIndicatorDot: {
    backgroundColor: '#1B4D89', 
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: '#F7DA30',
    width: 50,
    borderRadius: 2,
  },
  
  sowaraCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  sowaraList: {
    paddingHorizontal: 10,
  },
  sowaraItemContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  sowaraCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7E80D8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  sowaraCircleMore: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  sowaraImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  dotContainer: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotPattern: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7E80D8',
    borderWidth: 1,
    borderColor: '#000000',
    margin: 2,
  },
  
  contoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  contoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  contoImageBox: {
    width: 80,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7E80D8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  contoImage: {
    width: '160%',
    height: '160%',
    resizeMode: 'cover',
  },
  contoTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  contoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B4D89',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#7E80D8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBody: {
    padding: 20,
  },
  pronounceTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E80D8',
    marginBottom: 20,
    lineHeight: 28,
  },
  pronounceGrid: {
    paddingVertical: 10,
  },
  pronounceItem: {
    width: (width * 0.9 - 100) / 4,
    height: (width * 0.9 - 100) / 4,
    backgroundColor: '#F7DA30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#000000',
  },
  pronounceImage: {
    width: '65%',
    height: '65%',
    resizeMode: 'contain',
  },
  
  streakModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.85,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  streakModalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7DA30',
  },
  streakModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  streakModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  streakIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  streakMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  streakButton: {
    backgroundColor: '#1B4D89',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  streakButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  bottomSpacer: {
    height: 20,
  },
});

export default CarakanApp;