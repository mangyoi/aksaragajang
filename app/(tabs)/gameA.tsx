//gameA.tsx - Dengan Pengurangan Nyawa Saat Jawaban Salah
import React, { 
  useState,
  useEffect,
  useRef 
} from 'react';
import {
  View, 
  Text,
  TouchableOpacity,
  StyleSheet, 
  SafeAreaView, 
  Image, 
  Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import LivesDisplay from '../../components/LivesDisplay';
import NoLivesModal from '../../components/NoLivesModal';
import livesManager, { LivesInfo } from '../../utils/livesManager';


interface WordPair {
  id: number;
  leftWord: string;
  rightWord: string;
}

interface WordItem {
  id: string;
  pairId: number;
  word: string;
  column: 'left' | 'right';
}

interface GameLevel {
  level: number;
  title: string;
  wordPairs: WordPair[];
  timeLimit: number;
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText: string;
  primaryButtonAction: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  imageSource: any;
  onClose?: () => void; // Tambahkan ini
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  message,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
  imageSource,
  onClose, // Tambahkan ini
}) => {
  const memoizedPrimaryAction = React.useCallback(() => {
    if (primaryButtonAction) primaryButtonAction();
  }, [primaryButtonAction]);

  const memoizedSecondaryAction = React.useCallback(() => {
    if (secondaryButtonAction) secondaryButtonAction();
  }, [secondaryButtonAction]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          
          {/* Tombol Close */}
          {onClose && (
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
          )}

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
  const router = useRouter();
  const isMounted = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lives system state
  const [livesInfo, setLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false
  });
  const [showNoLivesModal, setShowNoLivesModal] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Modal untuk menampilkan pesan pengurangan nyawa
  const [showLivesDeductionModal, setShowLivesDeductionModal] = useState<boolean>(false);
  
  const gameLevels: GameLevel[] = [
    {
      level: 1,
      title: "Level 1 - Pemula",
      timeLimit: 60,
      wordPairs: [
        { id: 1, leftWord: 'ꦲꦥꦤ', rightWord: 'Apana' },
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

  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [leftItems, setLeftItems] = useState<WordItem[]>([]);
  const [rightItems, setRightItems] = useState<WordItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WordItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState<boolean>(false);
  
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalPrimaryButtonText, setModalPrimaryButtonText] = useState<string>("");
  const [modalPrimaryButtonAction, setModalPrimaryButtonAction] = useState<() => void>(() => {});
  const [modalSecondaryButtonText, setModalSecondaryButtonText] = useState<string | undefined>(undefined);
  const [modalSecondaryButtonAction, setModalSecondaryButtonAction] = useState<(() => void) | undefined>(undefined);
  const [modalImage, setModalImage] = useState(require('../../assets/images/tampilan/AstronoutGameA.png'));
  
  const currentLevel = gameLevels[currentLevelIndex];

  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      setIsGameActive(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Check lives status when component mounts
  useEffect(() => {
    const checkLives = async () => {
      const info = await livesManager.initialize();
      setLivesInfo(info);
    };
    
    checkLives();
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isGameActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        if (isMounted.current) {
          setTimeRemaining(prevTime => {
            if (prevTime <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              timeoutRef.current = setTimeout(() => {
                if (isMounted.current) {
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
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameActive]);

  useEffect(() => {
    if (matchedPairs.length === currentLevel.wordPairs.length && matchedPairs.length > 0) {
      handleLevelComplete();
    }
  }, [matchedPairs, currentLevel]);

  const showModal = (
    title: string, 
    message: string, 
    primaryButtonText: string, 
    primaryButtonAction: () => void, 
    secondaryButtonText?: string, 
    secondaryButtonAction?: () => void,
    imageSource?: any
  ) => {
    if (!isMounted.current) return;
    
    const primaryAction = primaryButtonAction;
    const secondaryAction = secondaryButtonAction;
    
    setTimeout(() => {
      if (isMounted.current) {
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
      }
    }, 0);
  };

  const hideModal = () => {
    if (!isMounted.current) return;
    
    setTimeout(() => {
      if (isMounted.current) {
        setIsModalVisible(false);
      }
    }, 0);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Ubah initializeLevel untuk tidak mengkonsumsi nyawa saat mulai permainan
  const initializeLevel = async (levelIndex: number) => {
    if (!isMounted.current) return;
    
    // Periksa apakah masih ada nyawa tersisa
    if (levelIndex === 0 && !gameStarted) {
      const info = await livesManager.getLivesInfo();
      setLivesInfo(info);
      
      if (info.lives <= 0) {
        setShowNoLivesModal(true);
        return;
      }
      
      setGameStarted(true);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const level = gameLevels[levelIndex];
    
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

    setLeftItems(shuffleArray(left));
    setRightItems(shuffleArray(right));
    
    setSelectedItem(null);
    setMatchedPairs([]);
    setIsGameCompleted(false);
    setTimeRemaining(level.timeLimit);
    setIsGameActive(true);
    setAllLevelsCompleted(false);
  };

  const startGame = async () => {
    if (!isMounted.current) return;
    
    // Reset game state tanpa mengurangi nyawa
    setCurrentLevelIndex(0);
    setAllLevelsCompleted(false);
    setGameStarted(false);
    
    // Initialize level 0
    initializeLevel(0);
  };

  const handleLevelComplete = async () => {
    setIsGameActive(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isMounted.current) return;
    
    setTimeout(() => {
      if (!isMounted.current) return;
      
      setIsGameCompleted(true);
      
      if (currentLevelIndex < gameLevels.length - 1) {
        const nextLevelIndex = currentLevelIndex + 1;
        
        const handleNextLevel = () => {
          hideModal();
          setTimeout(() => {
            if (!isMounted.current) return;
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
          require('../../assets/images/tampilan/AstronoutGameA.png')
        );
      } else {
        setAllLevelsCompleted(true);
        
        // Reward player with an extra life for completing all levels
        const handleRestart = async () => {
          hideModal();
          
          // Add bonus life for completing all levels
          await livesManager.addLife();
          const updatedInfo = await livesManager.getLivesInfo();
          setLivesInfo(updatedInfo);
          
          setTimeout(() => {
            if (!isMounted.current) return;
            startGame();
          }, 100);
        };
        
        showModal(
          "Selamat!",
          "Kamu telah menyelesaikan semua level dengan sukses! Kamu mendapatkan tambahan nyawa!",
          "Main Lagi dari Awal",
          handleRestart,
          undefined,
          undefined,
          require('../../assets/images/tampilan/AstronoutGameA.png')
          
        );
      }
    }, 500);
  };

  const handleGameOver = async () => {
    setIsGameActive(false);
    
    if (!isMounted.current) return;
    
    // When game over, check lives status
    const info = await livesManager.getLivesInfo();
    setLivesInfo(info);
    
    setTimeout(() => {
      if (!isMounted.current) return;
      
      const handleRetry = () => {
        hideModal();
        
        setTimeout(() => {
          if (!isMounted.current) return;
          initializeLevel(currentLevelIndex);
        }, 100);
      };
      
      const handleRestartGame = () => {
        hideModal();
        
        setTimeout(() => {
          if (!isMounted.current) return;
          setCurrentLevelIndex(0);
          initializeLevel(0);
        }, 100);
      };
      
      showModal(
        "Waktu Habis!",
        `Kamu berhasil menemukan ${matchedPairs.length} dari ${currentLevel.wordPairs.length} pasangan.`,
        "Coba Lagi",
        handleRetry,
        "Mulai Dari Awal",
        handleRestartGame,
        require('../../assets/images/tampilan/AstronoutGameA.png')
      );
    }, 50);
  };

  const goToMainMenu = () => {
    setIsGameActive(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Arahkan ke menu utama
    router.push('/mainmenu');
  };

  // Modifikasi handleItemSelect untuk mengurangi nyawa saat jawaban salah
  const handleItemSelect = async (item: WordItem) => {
    if (!isGameActive || !isMounted.current) return;
    
    if (matchedPairs.includes(item.pairId)) {
      return;
    }

    if (selectedItem === null) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.id === item.id || selectedItem.column === item.column) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.pairId === item.pairId) {
      // Jawaban benar - pasangan cocok
      setMatchedPairs([...matchedPairs, item.pairId]);
      setSelectedItem(null);
    } else {
      // Jawaban salah - pasangan tidak cocok
      setSelectedItem(item);
      
      // Kurangi nyawa untuk jawaban salah
      const reduceLife = async () => {
        const stillHasLives = await livesManager.useLife();
        const updatedInfo = await livesManager.getLivesInfo();
        setLivesInfo(updatedInfo);
        
        // Tampilkan pesan pengurangan nyawa
        setModalTitle("Jawaban Salah!");
        setModalMessage(`Pasangan tidak cocok. Nyawa berkurang 1.\nNyawa tersisa: ${updatedInfo.lives}`);
        setModalPrimaryButtonText("OK");
        setModalPrimaryButtonAction(() => {
          setShowLivesDeductionModal(false);
          
          // Jika nyawa habis, tampilkan modal no lives
          if (!stillHasLives || updatedInfo.lives <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            setIsGameActive(false);
            setShowNoLivesModal(true);
          }
        });
        setModalImage(require('../../assets/images/tampilan/wrongpopup.png'));
        setShowLivesDeductionModal(true);
      };
      
      reduceLife();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setSelectedItem(null);
        }
      }, 1000);
    }
  };

  const isItemSelected = (item: WordItem) => {
    return selectedItem?.id === item.id;
  };

  const isItemMatched = (item: WordItem) => {
    return matchedPairs.includes(item.pairId);
  };

  // Handle lives update from LivesDisplay
  const handleLivesUpdated = (info: LivesInfo) => {
    setLivesInfo(info);
  };
  
  // Close no lives modal and return to main menu
  const handleNoLivesGoHome = () => {
    setShowNoLivesModal(false);
    goToMainMenu();
  };

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

        <TouchableOpacity
          style={[styles.startButton, styles.menuButton]}
          onPress={goToMainMenu}
        >
          <Text style={styles.menuButtonText}>Kembali ke Menu Utama</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show pre-game screen if not started yet
  const renderPreGameScreen = () => {
    return (
      <View style={styles.preGameContainer}>
        <Text style={styles.preGameTitle}>Carakan - Nan Maenan</Text>
        <Text style={styles.preGameDescription}>
          Pilih pasangan kata yang cocok. Nyawa akan berkurang jika kamu salah memilih pasangan.
        </Text>
        
        <Image 
          source={require('../../assets/images/tampilan/AstronoutGameA.png')} 
          style={styles.preGameImage} 
          resizeMode="contain"
        />
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => initializeLevel(0)}
          disabled={livesInfo.lives <= 0}
        >
          <Text style={styles.startButtonText}>
            Mulai Permainan {livesInfo.lives <= 0 ? "(Nyawa Habis)" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, styles.menuButton]}
          onPress={goToMainMenu}
        >
          <Text style={styles.menuButtonText}>Kembali ke Menu Utama</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomModal
        visible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        primaryButtonText={modalPrimaryButtonText}
        primaryButtonAction={modalPrimaryButtonAction}
        secondaryButtonText={modalSecondaryButtonText}
        secondaryButtonAction={modalSecondaryButtonAction}
        imageSource={modalImage}
        onClose={hideModal}
      />
      
      {/* Lives Deduction Modal */}
      <CustomModal
        visible={showLivesDeductionModal}
        title={modalTitle}
        message={modalMessage}
        primaryButtonText={modalPrimaryButtonText}
        primaryButtonAction={modalPrimaryButtonAction}
        imageSource={modalImage}
      />
      
      {/* No Lives Modal */}
      <NoLivesModal
        visible={showNoLivesModal}
        onClose={() => setShowNoLivesModal(false)}
        onGoHome={handleNoLivesGoHome}
        timeUntilNextLife={livesInfo.timeUntilNextLife}
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>Carakan</Text>
        
        {isGameActive && !allLevelsCompleted && (
          <TouchableOpacity 
            style={styles.resetLevelButton}
            onPress={() => initializeLevel(currentLevelIndex)}
          >
            <Text style={styles.resetLevelText}>Reset Level</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Lives Display */}
      <LivesDisplay onLivesUpdated={handleLivesUpdated} />

      {!gameStarted ? (
        // Show pre-game screen
        renderPreGameScreen()
      ) : allLevelsCompleted ? (
        // Show completion screen
        renderCompletionScreen()
      ) : (
        // Main game screen
        <>
          <View style={styles.gameInfoContainer}>
            <Text style={styles.gameTitle}>Nan Maenan</Text>
            <Text style={styles.levelTitle}>{currentLevel.title}</Text>
          </View>

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

          <Image 
            source={require('../../assets/images/tampilan/AstronoutGameA.png')} 
            style={styles.instructionImage} 
            resizeMode="contain"
          />

          <View style={styles.matchingContainer}>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={startGame}
            >
              <Text style={styles.buttonText}>Mulai Ulang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={goToMainMenu}>
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
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D89',
  },
  // Pre-game screen styles
  preGameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preGameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  preGameDescription: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  preGameImage: {
    width: 200,
    height: 150,
    marginBottom: 30,
  },
  // Modal styles
  menuButton: {
    backgroundColor: '#1E3A8A',
    borderColor: '#4D5BD1',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
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
    position: 'relative', // Untuk tombol close
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
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#ccc',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MatchingGameScreen;