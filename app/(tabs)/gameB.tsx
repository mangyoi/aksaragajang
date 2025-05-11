//gameB.tsx with Lives System and Life Deduction on Wrong Answer
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
import { useRouter } from 'expo-router';
import LivesDisplay from '../../components/LivesDisplay';
import NoLivesModal from '../../components/NoLivesModal';
import livesManager, { LivesInfo } from '../../utils/livesManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AksaraOption {
  id: number;
  image: any;
  letter: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionImage: any;
  options: AksaraOption[];
}

const NanMaenanGameScreen: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [gameCompleteModalVisible, setGameCompleteModalVisible] = useState(false);
  
  // Lives system state
  const [livesInfo, setLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false
  });
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

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
          isCorrect: true
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
          isCorrect: true
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
          isCorrect: true
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
          isCorrect: true
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
          isCorrect: true
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

  // Check lives status when component mounts
  useEffect(() => {
    const checkLives = async () => {
      const info = await livesManager.initialize();
      setLivesInfo(info);
    };
    
    checkLives();
  }, []);

  // Start game tanpa mengonsumsi nyawa
  const startGame = async () => {
    // Periksa apakah masih ada nyawa tersisa
    const info = await livesManager.getLivesInfo();
    setLivesInfo(info);
    
    if (info.lives <= 0) {
      setShowNoLivesModal(true);
      return;
    }
    
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
  };

  // Ubah useEffect untuk mengurangi nyawa saat jawaban salah
  useEffect(() => {
    if (selectedOption !== null) {
      const currentOptions = questions[currentQuestionIndex].options;
      const selectedOptionData = currentOptions.find(option => option.id === selectedOption);
      const isCorrect = selectedOptionData?.isCorrect || false;
      
      setIsAnswerCorrect(isCorrect);
      
      // Jika jawaban salah, kurangi nyawa
      if (!isCorrect) {
        const reduceLife = async () => {
          // Gunakan useLife dari livesManager untuk mengurangi nyawa
          const stillHasLives = await livesManager.useLife();
          const updatedInfo = await livesManager.getLivesInfo();
          setLivesInfo(updatedInfo);
          
          // Jika nyawa habis, tampilkan modal no lives setelah pesan jawaban salah
          if (!stillHasLives || updatedInfo.lives <= 0) {
            setTimeout(() => {
              setAlertVisible(false);
              setTimeout(() => {
                setShowNoLivesModal(true);
                // Kembali ke menu utama jika nyawa habis
                setTimeout(() => {
                  router.push('/mainmenu');
                }, 3000);
              }, 500);
            }, 1500);
            return;
          }
        };
        
        reduceLife();
      }
      
      setAlertVisible(true);
      
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
    }
  }, [selectedOption]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameCompleteModalVisible(true);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleOptionSelect = (optionId: number) => {
    if (!gameStarted) return;
    setSelectedOption(optionId);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    
    if (isAnswerCorrect) {
      goToNextQuestion();
    } else {
      setSelectedOption(null);
    }
  };

  // Restart game tanpa mengurangi nyawa
  const restartGame = async () => {
    // Periksa apakah masih ada nyawa tersisa
    const info = await livesManager.getLivesInfo();
    setLivesInfo(info);
    
    if (info.lives <= 0) {
      setGameCompleteModalVisible(false);
      setShowNoLivesModal(true);
      return;
    }
    
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setGameCompleteModalVisible(false);
  };

  // Add a life when completing the game with good score
  const completeGameWithReward = async () => {
    // If player got most answers correct, reward with extra life
    if (correctAnswers >= Math.floor(questions.length * 0.8)) {
      await livesManager.addLife();
      const updatedInfo = await livesManager.getLivesInfo();
      setLivesInfo(updatedInfo);
    }
    
    setGameCompleteModalVisible(false);
    router.push('/mainmenu');
  };

  // Handle lives updates
  const handleLivesUpdated = (info: LivesInfo) => {
    setLivesInfo(info);
  };
  
  // Close no lives modal and return to main menu
  const handleNoLivesGoHome = () => {
    setShowNoLivesModal(false);
    router.push('/mainmenu');
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game</Text>
        {gameStarted && (
          <Text style={styles.questionIndicator}>
            Soal {currentQuestionIndex + 1}/{questions.length}
          </Text>
        )}
      </View>

      {/* Lives Display */}
      <LivesDisplay onLivesUpdated={handleLivesUpdated} />

      {/* No Lives Modal */}
      <NoLivesModal
        visible={showNoLivesModal}
        onClose={() => setShowNoLivesModal(false)}
        onGoHome={handleNoLivesGoHome}
        timeUntilNextLife={livesInfo.timeUntilNextLife}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.gameTitle}>Nan Maenan</Text>
        <Image 
          source={require('../../assets/images/tampilan/AstronoutGameB.png')} 
          style={styles.instructionImage}
          resizeMode="contain"
        />

        {!gameStarted ? (
          // Game start screen
          <View style={styles.startGameContainer}>
            <Text style={styles.startGameText}>
              Siap untuk bermain? Nyawa akan berkurang jika jawaban salah.
            </Text>
            <TouchableOpacity
              style={[
                styles.startGameButton,
                livesInfo.lives <= 0 && styles.disabledButton
              ]}
              onPress={startGame}
              disabled={livesInfo.lives <= 0}
            >
              <Text style={styles.startGameButtonText}>
                Mulai Permainan {livesInfo.lives <= 0 ? "(Nyawa Habis)" : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.push('/mainmenu')}
            >
              <Text style={styles.homeButtonText}>
                Kembali ke Menu Utama
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Game content
          <>
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
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

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
            <Image 
              source={
                isAnswerCorrect
                  ? require('../../assets/images/tampilan/correctpopup.png')
                  : require('../../assets/images/tampilan/wrongpopup.png')
              }
              style={styles.feedbackImage}
              resizeMode="contain"
            />
            
            <Text style={[
              styles.modalText,
              isAnswerCorrect ? styles.correctText : styles.incorrectText
            ]}>
              {isAnswerCorrect ? 'Benar!' : 'Salah!'}
            </Text>
            
            <Text style={styles.modalDetailText}>
              {isAnswerCorrect 
                ? currentQuestionIndex < questions.length - 1 
                  ? 'Lanjut ke soal berikutnya.' 
                  : 'Ini soal terakhir!'
                : `Nyawa berkurang 1. Nyawa tersisa: ${livesInfo.lives}\nSilakan coba lagi.`}
            </Text>
            
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
              {correctAnswers >= Math.floor(questions.length * 0.8) && (
                "\n\nAnda mendapatkan bonus nyawa tambahan!"
              )}
            </Text>
            
            <View style={styles.gameCompleteButtons}>
              <TouchableOpacity
                style={[styles.gameCompleteButton, styles.restartButton]}
                onPress={restartGame}
              >
                <Text style={styles.gameCompleteButtonText}>Main Lagi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.gameCompleteButton, styles.homeButton]} 
                onPress={completeGameWithReward}
              >
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
    backgroundColor: '#FFD700',
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
    backgroundColor: '#7E80D8',
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
    backgroundColor: '#C8E6C9'
  },
  wrongAnswerButton: {
    borderWidth: 3,
    borderColor: '#F44336',
    backgroundColor: '#FFCDD2'
  },
  aksaraOptionImage: {
    width: '80%',
    height: '80%',
  },
  bottomPadding: {
    height: 20
  },
  
  // Start game container
  startGameContainer: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  startGameText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  startGameButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  startGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  
  // Game complete modal
  gameCompleteContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E3A8A',
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
  gameCompleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default NanMaenanGameScreen;