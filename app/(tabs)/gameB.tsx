import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  ScrollView,
  Modal
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Interface untuk pilihan aksara
interface AksaraOption {
  id: number;
  image: any; // ImageSourcePropType
  letter: string;
  isCorrect: boolean; // Menandakan apakah ini jawaban yang benar
}

// Interface untuk soal
interface Question {
  id: number;
  questionImage: any; // ImageSourcePropType untuk gambar soal
  options: AksaraOption[];
}

const NanMaenanGameScreen: React.FC = () => {
  // State untuk menyimpan indeks soal saat ini
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State untuk menyimpan total soal yang sudah dijawab benar
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // State untuk menyimpan pilihan jawaban
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // State untuk modal alert
  const [alertVisible, setAlertVisible] = useState(false);
  
  // State untuk mencatat apakah jawaban benar
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  
  // State untuk menampilkan modal selesai game
  const [gameCompleteModalVisible, setGameCompleteModalVisible] = useState(false);

  // Data soal
  const questions: Question[] = [
    {
      id: 1,
      questionImage: require('../../assets/images/tampilan/soal/acaca.png'),
      options: [
        { 
          id: 1, 
          image: require('../../assets/images/tampilan/aksara/na.png'), 
          letter: 'C',
          isCorrect: false
        },
        { 
          id: 2, 
          image: require('../../assets/images/tampilan/aksara/ca.png'), 
          letter: 'A',
          isCorrect: true // Ini adalah jawaban yang benar untuk soal 1
        },
        { 
          id: 3, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'N',
          isCorrect: false
        },
        { 
          id: 4, 
          image: require('../../assets/images/tampilan/aksara/ra.png'), 
          letter: 'H',
          isCorrect: false
        }
      ]
    },
    {
      id: 2,
      questionImage: require('../../assets/images/tampilan/soal/arapa.png'),
      options: [
        { 
          id: 1, 
          image: require('../../assets/images/tampilan/aksara/ra.png'), 
          letter: 'C',
          isCorrect: true // Ini adalah jawaban yang benar untuk soal 2
        },
        { 
          id: 2, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'A',
          isCorrect: false
        },
        { 
          id: 3, 
          image: require('../../assets/images/tampilan/aksara/na.png'), 
          letter: 'N',
          isCorrect: false
        },
        { 
          id: 4, 
          image: require('../../assets/images/tampilan/aksara/ca.png'), 
          letter: 'H',
          isCorrect: false
        }
      ]
    },
    {
      id: 3,
      questionImage: require('../../assets/images/tampilan/soal/atapa.png'),
      options: [
        { 
          id: 1, 
          image: require('../../assets/images/tampilan/aksara/ka.png'), 
          letter: 'C',
          isCorrect: false
        },
        { 
          id: 2, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'A',
          isCorrect: false
        },
        { 
          id: 3, 
          image: require('../../assets/images/tampilan/aksara/ta.png'), 
          letter: 'N',
          isCorrect: true // Ini adalah jawaban yang benar untuk soal 3
        },
        { 
          id: 4, 
          image: require('../../assets/images/tampilan/aksara/da.png'), 
          letter: 'H',
          isCorrect: false
        }
      ]
    },
    {
      id: 4,
      questionImage: require('../../assets/images/tampilan/soal/acara.png'),
      options: [
        { 
          id: 1, 
          image: require('../../assets/images/tampilan/aksara/ka.png'), 
          letter: 'C',
          isCorrect: false
        },
        { 
          id: 2, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'A',
          isCorrect: false
        },
        { 
          id: 3, 
          image: require('../../assets/images/tampilan/aksara/ra.png'), 
          letter: 'N',
          isCorrect: false
        },
        { 
          id: 4, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'H',
          isCorrect: true // Ini adalah jawaban yang benar untuk soal 4
        }
      ]
    },
    {
      id: 5,
      questionImage: require('../../assets/images/tampilan/soal/sala.png'),
      options: [
        { 
          id: 1, 
          image: require('../../assets/images/tampilan/aksara/ca.png'), 
          letter: 'C',
          isCorrect: false
        },
        { 
          id: 2, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'A',
          isCorrect: false
        },
        { 
          id: 3, 
          image: require('../../assets/images/tampilan/aksara/la.png'), 
          letter: 'N',
          isCorrect: true // Ini adalah jawaban yang benar untuk soal 5
        },
        { 
          id: 4, 
          image: require('../../assets/images/tampilan/aksara/a.png'), 
          letter: 'H',
          isCorrect: false
        }
      ]
    }
  ];

  // Effect yang berjalan ketika pengguna memilih jawaban
  useEffect(() => {
    if (selectedOption !== null) {
      // Cek apakah jawaban benar
      const currentOptions = questions[currentQuestionIndex].options;
      const selectedOptionData = currentOptions.find(option => option.id === selectedOption);
      const isCorrect = selectedOptionData?.isCorrect || false;
      
      setIsAnswerCorrect(isCorrect);
      
      // Tampilkan alert
      setAlertVisible(true);
      
      // Jika jawaban benar, tambahkan ke jumlah jawaban benar
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
    }
  }, [selectedOption]);

  // Fungsi untuk pindah ke soal berikutnya
  const goToNextQuestion = () => {
    // Jika sudah di soal terakhir, tampilkan modal selesai
    if (currentQuestionIndex === questions.length - 1) {
      setGameCompleteModalVisible(true);
    } else {
      // Pindah ke soal berikutnya
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      // Reset pilihan jawaban
      setSelectedOption(null);
    }
  };

  // Fungsi untuk memilih jawaban
  const handleOptionSelect = (optionId: number) => {
    setSelectedOption(optionId);
  };

  // Fungsi untuk menutup alert
  const closeAlert = () => {
    setAlertVisible(false);
    
    // Jika jawaban benar, pindah ke soal berikutnya setelah alert ditutup
    if (isAnswerCorrect) {
      goToNextQuestion();
    } else {
      // Jika jawaban salah, reset pilihan sehingga user bisa memilih lagi
      setSelectedOption(null);
    }
  };

  // Fungsi untuk mulai ulang permainan
  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setGameCompleteModalVisible(false);
  };

  // Mendapatkan soal saat ini
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game</Text>
        {/* Indikator soal (1/5, 2/5, dst) */}
        <Text style={styles.questionIndicator}>
          Soal {currentQuestionIndex + 1}/{questions.length}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Title */}
        <Text style={styles.gameTitle}>Nan Maenan</Text>
        <Image 
          source={require('../../assets/images/tampilan/AstronoutGameB.png')} 
          style={styles.instructionImage}
          resizeMode="contain"
        />

        {/* Main Symbol Area - Soal */}
        <View style={styles.mainSymbolContainer}>
          <View style={styles.aksaraContainer}>
            <Image 
              source={currentQuestion.questionImage} 
              style={styles.aksaraImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.aksaraLabel}>Isilah aksara yang hilang</Text>
        </View>

        {/* Symbol Grid - Pilihan Jawaban */}
        <View style={styles.symbolGridContainer}>
          <Text style={styles.symbolGridTitle}>Pilih aksara yang tepat:</Text>
          <View style={styles.symbolGrid}>
            {[
              [currentQuestion.options[0], currentQuestion.options[1]],
              [currentQuestion.options[2], currentQuestion.options[3]]
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.symbolRow}>
                {row.map((aksara) => (
                  <TouchableOpacity 
                    key={aksara.id}
                    style={[
                      styles.symbolButton,
                      selectedOption === aksara.id && (aksara.isCorrect ? styles.correctAnswerButton : styles.wrongAnswerButton)
                    ]}
                    onPress={() => handleOptionSelect(aksara.id)}
                  >
                    <Image 
                      source={aksara.image}
                      style={styles.aksaraOptionImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
        
        {/* Add extra padding at bottom for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modal Alert dengan Gambar */}
      <Modal
        visible={alertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isAnswerCorrect ? styles.correctModalContainer : styles.incorrectModalContainer
          ]}>
            {/* Gambar feedback */}
            <Image 
              source={
                isAnswerCorrect
                  ? require('../../assets/images/tampilan/correctpopup.png')
                  : require('../../assets/images/tampilan/wrongpopup.png')
              }
              style={styles.feedbackImage}
              resizeMode="contain"
            />
            
            {/* Text feedback */}
            <Text style={[
              styles.modalText,
              isAnswerCorrect ? styles.correctText : styles.incorrectText
            ]}>
              {isAnswerCorrect ? 'Benar!' : 'Salah!'}
            </Text>
            
            {/* Pesan khusus */}
            <Text style={styles.modalDetailText}>
              {isAnswerCorrect 
                ? currentQuestionIndex < questions.length - 1 
                  ? 'Lanjut ke soal berikutnya.' 
                  : 'Ini soal terakhir!'
                : 'Silakan coba lagi.'}
            </Text>
            
            {/* Tombol OK */}
            <TouchableOpacity
              style={[
                styles.modalButton,
                isAnswerCorrect ? styles.correctButton : styles.incorrectButton
              ]}
              onPress={closeAlert}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Game Complete */}
      <Modal
        visible={gameCompleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGameCompleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gameCompleteContainer}>
            <Image 
              source={require('../../assets/images/tampilan/correctpopup.png')} 
              style={styles.gameCompleteImage}
              resizeMode="contain"
            />
            
            <Text style={styles.gameCompleteTitle}>Selamat!</Text>
            <Text style={styles.gameCompleteText}>
              Anda telah menyelesaikan semua soal dengan {correctAnswers} jawaban benar dari {questions.length} soal.
            </Text>
            
            <View style={styles.gameCompleteButtons}>
              <TouchableOpacity
                style={[styles.gameCompleteButton, styles.restartButton]}
                onPress={restartGame}
              >
                <Text style={styles.gameCompleteButtonText}>Main Lagi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.gameCompleteButton, styles.homeButton]}>
                <Text style={styles.gameCompleteButtonText}>Menu Utama</Text>
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
    backgroundColor: 'white',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700', // Yellow header
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  questionIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#1B4D89'
  },
  instructionImage: {
    height: 150,
    width: '100%',
    marginBottom: 15,
    marginTop: 5
  },
  mainSymbolContainer: {
    width: '90%',
    backgroundColor: '#7E80D8', // Light lavender background
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15
  },
  aksaraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  aksaraImage: {
    width: '100%',
    height: 120,
    marginBottom: 10
  },
  aksaraLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  symbolGridContainer: {
    width: '90%',
    marginVertical: 15,
  },
  symbolGridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  symbolGrid: {
    width: '100%',
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  symbolButton: {
    width: (SCREEN_WIDTH * 0.4),
    height: (SCREEN_WIDTH * 0.3),
    backgroundColor: '#F7DA30', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 5,
    borderWidth: 2,
    borderColor: '#E0B000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  correctAnswerButton: {
    borderWidth: 3,
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9' // Hijau muda
  },
  wrongAnswerButton: {
    borderWidth: 3,
    borderColor: '#F44336',
    backgroundColor: '#FFCDD2' // Merah muda
  },
  aksaraOptionImage: {
    width: '80%',
    height: '80%',
  },
  bottomPadding: {
    height: 20 // Extra padding at the bottom for better scrolling experience
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3
  },
  correctModalContainer: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9'
  },
  incorrectModalContainer: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE'
  },
  feedbackImage: {
    width: 120,
    height: 120,
    marginBottom: 15
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  modalDetailText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 15,
    textAlign: 'center'
  },
  correctText: {
    color: '#4CAF50'
  },
  incorrectText: {
    color: '#F44336'
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  correctButton: {
    backgroundColor: '#4CAF50'
  },
  incorrectButton: {
    backgroundColor: '#F44336'
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  
  // Game Complete Modal Styles
  gameCompleteContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E3A8A',
    // backgroundColor: '#E3F2FD'
  },
  gameCompleteImage: {
    width: 150,
    height: 150,
    marginBottom: 15
  },
  gameCompleteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10
  },
  gameCompleteText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#424242'
  },
  gameCompleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  gameCompleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  restartButton: {
    backgroundColor: '#FF9800'
  },
  homeButton: {
    backgroundColor: '#1E3A8A'
  },
  gameCompleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default NanMaenanGameScreen;