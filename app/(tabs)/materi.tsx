import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';

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

// Updated sowaraData with Carakan script images
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


// Conto data with image sources
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

// Updated pronounceData with Carakan script images
const pronounceData: PronounceItem[] = Array(20).fill(null).map((_, index) => ({
  id: index.toString(),
  imageSource: require('../../assets/images/tampilan/aksara/a.png') // Using the same image for all items
}));

const CarakanApp = () => {
  const [pronounceModalVisible, setPronounceModalVisible] = useState(false);
  const router = useRouter();

  const renderSowaraItem = ({ item }: { item: SowaraItem }) => (
    <View style={styles.sowaraItem}>
      {item.imageSource ? (
        <View style={styles.sowaraCircle}>
          <Image 
            source={item.imageSource}
            style={styles.sowaraImage}
          />
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.sowaraCircle}
          onPress={() => setPronounceModalVisible(true)}
        >
          <View style={styles.dotContainer}>
            {[...Array(9)].map((_, index) => (
              <View key={index} style={styles.dot} />
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContoItem = (item: ContoItem) => (
    <View key={item.id} style={styles.contoRow}>
      <View style={styles.contoBox}>
        <Image 
          source={item.imageSource}
          style={styles.contoImage}
        />
      </View>
      <View style={styles.contoTextContainer}>
        <Text style={styles.contoText}>{item.text}</Text>
      </View>
    </View>
  );

  const renderPronounceItem = ({ item }: { item: PronounceItem }) => (
    <View style={styles.pronounceItem}>
      <Image 
        source={item.imageSource}
        style={styles.pronounceImage}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Carakan</Text>
          <View style={styles.rightHeaderSpace} />
        </View>

        <View style={styles.contentContainer}>
          {/* Back button at the top */}
          <TouchableOpacity 
            onPress={() => router.push('/mainmenu')} 
            style={styles.backButton}
          >
            <Image 
              source={require('../../assets/images/tampilan/icon/left-arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          
          {/* Main image now below the back button */}
          <View style={styles.imgBox}>
            <Image 
              source={require('../../assets/images/tampilan/carakan.png')}
              style={styles.titleImage}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Sowara</Text>
          <FlatList
            data={sowaraData}
            renderItem={renderSowaraItem}
            keyExtractor={(item) => item.id}
            horizontal={true}
            contentContainerStyle={styles.sowaraList}
            scrollEnabled={false}
          />
          
          <Text style={styles.sectionTitle}>Kaangguy Conto</Text>
          <View style={styles.contoContainer}>
            {conto.map(item => renderContoItem(item))}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={pronounceModalVisible}
        onRequestClose={() => setPronounceModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>sowara aksara</Text>
              <TouchableOpacity
                onPress={() => setPronounceModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pronounceTitle}>pece' kaangguy{'\n'}ngeding agi</Text>

            <FlatList
              data={pronounceData}
              renderItem={renderPronounceItem}
              keyExtractor={item => item.id}
              numColumns={4}
              contentContainerStyle={styles.pronounceGrid}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#F7DA30',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16, 
    alignSelf: 'flex-start', 
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  rightHeaderSpace: {
    width: 40,
  },
  contentContainer: {
    padding: 16,
  },
  imgBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, 
    marginBottom: 16, 
  },
  titleImage: {
    borderRadius: 12,
    width: '132%',
    height: undefined,
    aspectRatio: 2 / 1,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 16,
  },
  sowaraList: {
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  sowaraItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  sowaraCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7E80D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sowaraImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  sowaraText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dotContainer: {
    width: 45,
    height: 45,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    margin: 3,
  },
  contoContainer: {
    width: '100%',
  },
  contoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contoBox: {
    width: 140,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7E80D8',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 16,
    marginLeft: 30,
    overflow: 'hidden', // Ensures image stays within borders
  },
  contoImage: {
    width: '200%',
    height: '200%',
    resizeMode: 'cover',
  },
  contoTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contoText: {
    fontSize: 18,
    color: '#1B4D89',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    height: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    color: '#666',
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  pronounceTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#615CB3',
    marginBottom: 20,
  },
  pronounceGrid: {
    paddingVertical: 10,
  },
  pronounceItem: {
    width: (width * 0.9 - 40) / 4.5,
    height: (width * 0.9 - 40) / 4.5,
    backgroundColor: '#FFD700',
    borderRadius: (width * 0.9 - 40) / 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  pronounceImage: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  pronounceSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  pronounceLetter: {
    fontSize: 20,
    color: '#000',
  },
});

export default CarakanApp;