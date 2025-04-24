import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Modal } from 'react-native';

// Interface untuk pasangan kata
interface WordPair {
  id: number;
  leftWord: string;
  rightWord: string;
}

// Interface untuk item yang ditampilkan
interface WordItem {
  id: string;
  pairId: number;
  word: string;
  column: 'left' | 'right';
}

// Interface untuk level
interface GameLevel {
  level: number;
  title: string;
  wordPairs: WordPair[];
  timeLimit: number; // dalam detik
}

// Interface untuk custom modal
interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText: string;
  primaryButtonAction: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  imageSource: any; // untuk gambar .png
}

// Custom Modal Component dengan stabilitas yang ditingkatkan
const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  message,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
  imageSource
}) => {
  // Mencegah re-render yang tidak perlu
  const memoizedPrimaryAction = React.useCallback(() => {
    if (primaryButtonAction) {
      primaryButtonAction();
    }
  }, [primaryButtonAction]);
  
  const memoizedSecondaryAction = React.useCallback(() => {
    if (secondaryButtonAction) {
      secondaryButtonAction();
    }
  }, [secondaryButtonAction]);
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
      // Menambahkan hardwareAccelerated untuk meningkatkan performa di Android
      hardwareAccelerated={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Image 
            source={imageSource} 
            style={styles.modalImage} 
            resizeMode="contain"
          />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={memoizedPrimaryAction}
              // Menambahkan activeOpacity untuk mencegah multiple taps
              activeOpacity={0.7}
            >
              <Text style={styles.modalPrimaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
            
            {secondaryButtonText && secondaryButtonAction && (
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={memoizedSecondaryAction}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MatchingGameScreen: React.FC = () => {
  // Data untuk semua level
  const gameLevels: GameLevel[] = [
    {
      level: 1,
      title: "Level 1 - Pemula",
      timeLimit: 60,
      wordPairs: [
        { id: 1, leftWord: 'ᮃᮕᮔ', rightWord: 'Apana' },
        { id: 2, leftWord: 'ᮏᮔ᭄ᮒᮁ', rightWord: 'Jantar' },
        { id: 3, leftWord: 'ᮞᮍᮥ', rightWord: 'Sangu' },
      ]
    },
    {
      level: 2,
      title: "Level 2 - Dasar",
      timeLimit: 75,
      wordPairs: [
        { id: 1, leftWord: 'ᮃᮕᮔ', rightWord: 'Apana' },
        { id: 2, leftWord: 'ᮏᮔ᭄ᮒᮁ', rightWord: 'Jantar' },
        { id: 3, leftWord: 'ᮞᮍᮥ', rightWord: 'Sangu' },
        { id: 4, leftWord: 'ᮊᮞᮞᮔ᭄', rightWord: 'Kasana' },
      ]
    },
    {
      level: 3,
      title: "Level 3 - Menengah",
      timeLimit: 90,
      wordPairs: [
        { id: 1, leftWord: 'ᮃᮕᮔ', rightWord: 'Apana' },
        { id: 2, leftWord: 'ᮏᮔ᭄ᮒᮁ', rightWord: 'Jantar' },
        { id: 3, leftWord: 'ᮞᮍᮥ', rightWord: 'Sangu' },
        { id: 4, leftWord: 'ᮊᮞᮞᮔ᭄', rightWord: 'Kasana' },
        { id: 5, leftWord: 'ᮎᮎᮁ', rightWord: 'Cacar' },
      ]
    },
    {
      level: 4,
      title: "Level 4 - Mahir",
      timeLimit: 100,
      wordPairs: [
        { id: 1, leftWord: 'ᮃᮕᮔ', rightWord: 'Apana' },
        { id: 2, leftWord: 'ᮏᮔ᭄ᮒᮁ', rightWord: 'Jantar' },
        { id: 3, leftWord: 'ᮞᮍᮥ', rightWord: 'Sangu' },
        { id: 4, leftWord: 'ᮊᮞᮞᮔ᭄', rightWord: 'Kasana' },
        { id: 5, leftWord: 'ᮎᮎᮁ', rightWord: 'Cacar' },
        { id: 6, leftWord: 'ᮋᮒᮔ᭄', rightWord: 'Katana' },
      ]
    },
    {
      level: 5,
      title: "Level 5 - Ahli",
      timeLimit: 120,
      wordPairs: [
        { id: 1, leftWord: 'ᮃᮕᮔ', rightWord: 'Apana' },
        { id: 2, leftWord: 'ᮏᮔ᭄ᮒᮁ', rightWord: 'Jantar' },
        { id: 3, leftWord: 'ᮞᮍᮥ', rightWord: 'Sangu' },
        { id: 4, leftWord: 'ᮊᮞᮞᮔ᭄', rightWord: 'Kasana' },
        { id: 5, leftWord: 'ᮎᮎᮁ', rightWord: 'Cacar' },
        { id: 6, leftWord: 'ᮋᮒᮔ᭄', rightWord: 'Katana' },
        { id: 7, leftWord: 'ᮌᮂᮔ᭄', rightWord: 'Gana' },
      ]
    }
  ];

  // State untuk level dan permainan
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [leftItems, setLeftItems] = useState<WordItem[]>([]);
  const [rightItems, setRightItems] = useState<WordItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WordItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState<boolean>(false);
  
  // State untuk custom modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalPrimaryButtonText, setModalPrimaryButtonText] = useState<string>("");
  const [modalPrimaryButtonAction, setModalPrimaryButtonAction] = useState<() => void>(() => {});
  const [modalSecondaryButtonText, setModalSecondaryButtonText] = useState<string | undefined>(undefined);
  const [modalSecondaryButtonAction, setModalSecondaryButtonAction] = useState<(() => void) | undefined>(undefined);
  const [modalImage, setModalImage] = useState(require('../../assets/images/tampilan/AstronoutGameA.png'));
  
  // Level saat ini
  const currentLevel = gameLevels[currentLevelIndex];

  // Auto mulai level 1 saat komponen di-mount
  useEffect(() => {
    // Langsung mulai level 1 saat screen dibuka
    initializeLevel(0);
  }, []);

  // Timer untuk permainan - dimodifikasi untuk menghindari race condition
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isMounted = true; // Flag untuk mengecek apakah komponen masih di-mount
    
    if (isGameActive && timeRemaining > 0) {
      timer = setInterval(() => {
        if (isMounted) {
          setTimeRemaining(prevTime => {
            if (prevTime <= 1) {
              if (timer) {
                clearInterval(timer);
              }
              // Jalankan handleGameOver di luar state update untuk menghindari race condition
              setTimeout(() => {
                if (isMounted) {
                  handleGameOver();
                }
              }, 0);
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      isMounted = false; // Tandai bahwa komponen sudah di-unmount
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isGameActive]); // Hanya bergantung pada isGameActive, tidak pada timeRemaining

  // Cek apakah permainan selesai
  useEffect(() => {
    if (matchedPairs.length === currentLevel.wordPairs.length && matchedPairs.length > 0) {
      handleLevelComplete();
    }
  }, [matchedPairs, currentLevel]);

  // Fungsi untuk menampilkan modal - menggunakan batch state updates
  const showModal = (
    title: string, 
    message: string, 
    primaryButtonText: string, 
    primaryButtonAction: () => void, 
    secondaryButtonText?: string, 
    secondaryButtonAction?: () => void,
    imageSource?: any
  ) => {
    // Simpan action sebagai referensi fungsi daripada menciptakan fungsi baru
    const primaryAction = primaryButtonAction;
    const secondaryAction = secondaryButtonAction;
    
    // Gunakan setTimeout untuk memastikan state updates tidak terjadi saat React sedang rendering
    setTimeout(() => {
      setModalTitle(title);
      setModalMessage(message);
      setModalPrimaryButtonText(primaryButtonText);
      setModalPrimaryButtonAction(() => primaryAction);
      
      if (secondaryButtonText && secondaryAction) {
        setModalSecondaryButtonText(secondaryButtonText);
        setModalSecondaryButtonAction(() => secondaryAction);
      } else {
        setModalSecondaryButtonText(undefined);
        setModalSecondaryButtonAction(undefined);
      }
      
      if (imageSource) {
        setModalImage(imageSource);
      } else {
        setModalImage(require('../../assets/images/tampilan/AstronoutGameA.png'));
      }
      
      setIsModalVisible(true);
    }, 0);
  };

  // Fungsi untuk menyembunyikan modal
  const hideModal = () => {
    // Gunakan setTimeout untuk menghindari konflik dengan React event queue
    setTimeout(() => {
      setIsModalVisible(false);
    }, 0);
  };

  // Fungsi untuk mengacak array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inisialisasi level
  const initializeLevel = (levelIndex: number) => {
    const level = gameLevels[levelIndex];
    
    // Buat array untuk kolom kiri dan kanan
    const left = level.wordPairs.map((pair) => ({
      id: `left-${pair.id}`,
      pairId: pair.id,
      word: pair.leftWord,
      column: 'left' as const
    }));

    const right = level.wordPairs.map((pair) => ({
      id: `right-${pair.id}`,
      pairId: pair.id,
      word: pair.rightWord,
      column: 'right' as const
    }));

    // Acak posisi kata
    setLeftItems(shuffleArray(left));
    setRightItems(shuffleArray(right));
    
    // Reset state permainan
    setSelectedItem(null);
    setMatchedPairs([]);
    setIsGameCompleted(false);
    setTimeRemaining(level.timeLimit);
    setIsGameActive(true);
    setAllLevelsCompleted(false);
  };

  // Mulai permainan dari level pertama
  const startGame = () => {
    setCurrentLevelIndex(0);
    setAllLevelsCompleted(false);
    initializeLevel(0);
  };

  // Menangani level selesai - otomatis lanjut ke level berikutnya
  const handleLevelComplete = () => {
    // Lebih aman untuk memisahkan state updates
    setIsGameActive(false);
    
    // Berikan delay sebelum set game completed 
    setTimeout(() => {
      setIsGameCompleted(true);
      
      // Jika masih ada level berikutnya
      if (currentLevelIndex < gameLevels.length - 1) {
        const nextLevelIndex = currentLevelIndex + 1;
        
        // Gunakan custom modal sebagai pengganti Alert
        // Buat fungsi handler di luar showModal untuk menghindari closure issues
        const handleNextLevel = () => {
          hideModal();
          // Berikan jeda untuk memastikan modal tertutup sebelum mengubah state lain
          setTimeout(() => {
            setCurrentLevelIndex(nextLevelIndex);
            initializeLevel(nextLevelIndex);
          }, 100);
        };
        
        showModal(
          "Level Berhasil!",
          `Selamat! Kamu telah menyelesaikan ${currentLevel.title} dengan sisa waktu ${timeRemaining} detik!`,
          `Lanjut ke Level ${nextLevelIndex + 1}`,
          handleNextLevel,
          undefined,
          undefined,
          require('../../assets/images/tampilan/AstronoutGameA.png') // Gunakan gambar sesuai kebutuhan
        );
      } else {
        // Jika semua level sudah selesai
        setAllLevelsCompleted(true);
        
        // Buat fungsi handler di luar showModal
        const handleRestart = () => {
          hideModal();
          setTimeout(() => {
            startGame();
          }, 100);
        };
        
        // Gunakan custom modal sebagai pengganti Alert
        showModal(
          "Selamat!",
          "Kamu telah menyelesaikan semua level dengan sukses!",
          "Main Lagi dari Awal",
          handleRestart,
          undefined,
          undefined,
          require('../../assets/images/tampilan/AstronoutGameA.png') // Gunakan gambar sesuai kebutuhan
        );
      }
    }, 500);
  };

  // Menangani game over (waktu habis)
  const handleGameOver = () => {
    setIsGameActive(false);
    
    // Berikan delay kecil untuk menghindari state updates saat render
    setTimeout(() => {
      // Buat handler functions terlebih dahulu
      const handleRetry = () => {
        hideModal();
        setTimeout(() => {
          initializeLevel(currentLevelIndex);
        }, 100);
      };
      
      const handleRestartGame = () => {
        hideModal();
        setTimeout(() => {
          startGame();
        }, 100);
      };
      
      // Gunakan custom modal sebagai pengganti Alert
      showModal(
        "Waktu Habis!",
        `Kamu berhasil menemukan ${matchedPairs.length} dari ${currentLevel.wordPairs.length} pasangan.`,
        "Coba Lagi",
        handleRetry,
        "Mulai Dari Awal",
        handleRestartGame,
        require('../../assets/images/tampilan/AstronoutGameA.png') // Gunakan gambar waktu habis
      );
    }, 50);
  };

  // Menangani pemilihan item
  const handleItemSelect = (item: WordItem) => {
    // Jika permainan tidak aktif, abaikan
    if (!isGameActive) return;
    
    // Jika sudah cocok, abaikan
    if (matchedPairs.includes(item.pairId)) {
      return;
    }

    // Jika belum ada item yang dipilih sebelumnya
    if (selectedItem === null) {
      setSelectedItem(item);
      return;
    }

    // Jika item yang sama dipilih dua kali atau dari kolom yang sama
    if (selectedItem.id === item.id || selectedItem.column === item.column) {
      setSelectedItem(item);
      return;
    }

    // Cek apakah cocok
    if (selectedItem.pairId === item.pairId) {
      // Match found
      setMatchedPairs([...matchedPairs, item.pairId]);
      setSelectedItem(null);
    } else {
      // Tidak cocok, reset pemilihan setelah delay
      setSelectedItem(item);
      setTimeout(() => {
        setSelectedItem(null);
      }, 1000);
    }
  };

  // Cek apakah item terpilih
  const isItemSelected = (item: WordItem) => {
    return selectedItem?.id === item.id;
  };

  // Cek apakah item sudah dicocokkan
  const isItemMatched = (item: WordItem) => {
    return matchedPairs.includes(item.pairId);
  };

  // Tampilan permainan selesai (semua level)
  const renderCompletionScreen = () => {
    return (
      <View style={styles.completionContainer}>
        <Text style={styles.completionTitle}>Selamat!</Text>
        <Text style={styles.completionText}>
          Kamu telah menyelesaikan semua level permainan.
        </Text>
        <Image 
          source={require('../../assets/images/tampilan/AstronoutGameA.png')} 
          style={styles.completionImage} 
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.startButton}
          onPress={startGame}
        >
          <Text style={styles.startButtonText}>Main Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Modal */}
      <CustomModal
        visible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        primaryButtonText={modalPrimaryButtonText}
        primaryButtonAction={modalPrimaryButtonAction}
        secondaryButtonText={modalSecondaryButtonText}
        secondaryButtonAction={modalSecondaryButtonAction}
        imageSource={modalImage}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Carakan</Text>
        
        {/* Tombol reset level hanya muncul jika permainan aktif dan belum semua level selesai */}
        {isGameActive && !allLevelsCompleted && (
          <TouchableOpacity 
            style={styles.resetLevelButton}
            onPress={() => initializeLevel(currentLevelIndex)}
          >
            <Text style={styles.resetLevelText}>Reset Level</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tampilan setelah semua level selesai */}
      {allLevelsCompleted ? (
        renderCompletionScreen()
      ) : (
        <>
          {/* Game Title & Level */}
          <View style={styles.gameInfoContainer}>
            <Text style={styles.gameTitle}>Nan Maenan</Text>
            <Text style={styles.levelTitle}>{currentLevel.title}</Text>
          </View>

          {/* Timer & Progress */}
          <View style={styles.gameStatus}>
            <View style={styles.timerContainer}>
              <Text style={[
                styles.timerText,
                timeRemaining <= 10 && styles.timerWarning
              ]}>
                Waktu: {timeRemaining}s
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {matchedPairs.length}/{currentLevel.wordPairs.length} Pasangan
              </Text>
            </View>
          </View>

          {/* Game Instructions */}
          <Image 
            source={require('../../assets/images/tampilan/AstronoutGameA.png')} 
            style={styles.instructionImage} 
            resizeMode="contain"
          />

          {/* Word Matching Area */}
          <View style={styles.matchingContainer}>
            {/* Left Column */}
            <View style={styles.column}>
              {leftItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.wordButton,
                    isItemSelected(item) && styles.selectedButton,
                    isItemMatched(item) && styles.matchedButton
                  ]}
                  onPress={() => handleItemSelect(item)}
                  disabled={isItemMatched(item) || !isGameActive}
                >
                  <Text style={styles.wordText}>{item.word}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Right Column */}
            <View style={styles.column}>
              {rightItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.wordButton,
                    isItemSelected(item) && styles.selectedButton,
                    isItemMatched(item) && styles.matchedButton
                  ]}
                  onPress={() => handleItemSelect(item)}
                  disabled={isItemMatched(item) || !isGameActive}
                >
                  <Text style={styles.wordText}>{item.word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={startGame}
            >
              <Text style={styles.buttonText}>Mulai Ulang</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.homeButton}
            >
              <Text style={styles.buttonText}>Utama</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#F7DA30',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  resetLevelButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resetLevelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gameInfoContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  levelTitle: {
    fontSize: 18,
    color: '#1E3A8A',
    marginTop: 4,
  },
  instructionImage: {
    height: 100,
    alignSelf: 'center',
    maxWidth: '100%',
    marginBottom: 5,
  },
  gameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  timerContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  timerWarning: {
    color: '#FF5722',
  },
  progressContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  matchingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    flex: 1,
  },
  column: {
    width: '48%',
    justifyContent: 'space-around',
  },
  wordButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedButton: {
    backgroundColor: '#FFC107',
    borderColor: '#FF5722',
    borderWidth: 3,
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4.65,
    elevation: 8,
  },
  matchedButton: {
    backgroundColor: '#90EE90',
    borderColor: '#2E8B57',
    borderWidth: 2.5,
    shadowColor: '#2E8B57',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 5,
  },
  restartButton: {
    backgroundColor: '#F7DA30',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#1B4D89',
  },
  homeButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#4D5BD1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Styles untuk tampilan setelah semua level selesai
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  completionImage: {
    width: 200,
    height: 150,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#F7DA30',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B4D89',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  // Styles untuk custom modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButton: {
    backgroundColor: '#F7DA30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B4D89',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  modalSecondaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4D5BD1',
    width: '100%',
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MatchingGameScreen;