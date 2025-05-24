import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image
} from 'react-native';

interface NoLivesModalProps {
  visible: boolean;
  onClose: () => void;
  onGoHome: () => void;
  timeUntilNextLife: number;
}

const NoLivesModal = ({ 
  visible, 
  onClose, 
  onGoHome,
  timeUntilNextLife 
}: NoLivesModalProps) => {
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || milliseconds <= 0) return '0:00';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Image 
            source={require('../assets/images/tampilan/AstronoutGameA.png')}
            style={styles.modalImage} 
            resizeMode="contain"
          />
          
          <Text style={styles.modalTitle}>Nyawa Habis!</Text>
          
          <Text style={styles.modalMessage}>
            Kamu kehabisan nyawa untuk bermain.
          </Text>
          
          {timeUntilNextLife > 0 && (
            <Text style={styles.timerText}>
              Nyawa berikutnya dalam: {formatTime(timeUntilNextLife)}
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={onGoHome}
            >
              <Text style={styles.homeButtonText}>Kembali ke Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#F44336',
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4D5BD1',
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default NoLivesModal;
