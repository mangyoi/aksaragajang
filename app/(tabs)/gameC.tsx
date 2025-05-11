//gameC.tsx with Lives System and Life Deduction on Wrong Answers
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import LivesDisplay from '../../components/LivesDisplay';
import NoLivesModal from '../../components/NoLivesModal';
import livesManager, { LivesInfo } from '../../utils/livesManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DraggableItem {
  id: number;
  letter: string;
}

interface DropTarget {
  id: number;
  occupied: boolean;
  itemId: number | null;
  correctLetter: string;
  isCorrect?: boolean;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface Question {
  id: number;
  text: string;
  items: DraggableItem[];
  targets: DropTarget[];
}

const DragDropGameScreen = () => {
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const router = useRouter();
  
  // Lives system state
  const [livesInfo, setLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false
  });
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    isCorrect: false,
    message: ""
  });

  const questions: Question[] = [
    {
      id: 1,
      text: "acaca",
      items: [
        { id: 1, letter: 'ꦲ' },
        { id: 2, letter: 'ꦕ' },
        { id: 3, letter: 'ꦕ' }
      ],
      targets: [
        { id: 1, occupied: false, itemId: null, correctLetter: 'ꦲ', layout: null },
        { id: 2, occupied: false, itemId: null, correctLetter: 'ꦕ', layout: null },
        { id: 3, occupied: false, itemId: null, correctLetter: 'ꦕ', layout: null }
      ]
    },
    {
      id: 2,
      text: "Sapana",
      items: [
        { id: 1, letter: 'ꦥ' },
        { id: 2, letter: 'ꦱ' },
        { id: 3, letter: 'ꦤ' },
      ],
      targets: [
        { id: 1, occupied: false, itemId: null, correctLetter: 'ꦱ', layout: null },
        { id: 2, occupied: false, itemId: null, correctLetter: 'ꦥ', layout: null },
        { id: 3, occupied: false, itemId: null, correctLetter: 'ꦤ', layout: null },

      ]
    },
    {
      id: 3,
      text: "Pamacana",
      items: [
        { id: 1, letter: 'ꦕ' },
        { id: 2, letter: 'ꦩ' },
        { id: 3, letter: 'ꦤ' },
        { id: 4, letter: 'ꦥ' },
      ],
      targets: [
        { id: 1, occupied: false, itemId: null, correctLetter: 'ꦥ', layout: null },
        { id: 2, occupied: false, itemId: null, correctLetter: 'ꦩ', layout: null },
        { id: 3, occupied: false, itemId: null, correctLetter: 'ꦕ', layout: null },
        { id: 4, occupied: false, itemId: null, correctLetter: 'ꦤ', layout: null },
      ]
    },
    {
      id: 4,
      text: "Kacamata",
      items: [
        { id: 1, letter: 'ꦕ' },
        { id: 2, letter: 'ꦩ' },
        { id: 3, letter: 'ꦩ' },
        { id: 4, letter: 'ꦏ' },
      ],
      targets: [
        { id: 1, occupied: false, itemId: null, correctLetter: 'ꦏ', layout: null },
        { id: 2, occupied: false, itemId: null, correctLetter: 'ꦕ', layout: null },
        { id: 3, occupied: false, itemId: null, correctLetter: 'ꦩ', layout: null },
        { id: 4, occupied: false, itemId: null, correctLetter: 'ꦠ', layout: null },
      ]
    }
  ];

  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>(questions[0].items);
  const [dropTargets, setDropTargets] = useState<DropTarget[]>(questions[0].targets);

  const containerRef = useRef(null);
  const targetRefs = useRef({});
  const hasMeasuredRef = useRef(false);

  // Check lives status when component mounts
  useEffect(() => {
    const checkLives = async () => {
      const info = await livesManager.initialize();
      setLivesInfo(info);
    };
    
    checkLives();
  }, []);

  // Start game tanpa mengurangi nyawa
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
    initializeQuestion(0);
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

  useEffect(() => {
    questions.forEach(question => {
      question.targets.forEach(target => {
        if (!targetRefs.current[target.id]) {
          targetRefs.current[target.id] = React.createRef();
        }
      });
    });
  }, []);

  const initializeQuestion = (index: number) => {
    const question = questions[index];
    setCurrentQuestion(question);
    setDraggableItems(question.items);
    setDropTargets(JSON.parse(JSON.stringify(question.targets)));
    setAllCorrect(false);
    setShowNextButton(false);
    hasMeasuredRef.current = false;
  };

  useEffect(() => {
    if (gameStarted) {
      initializeQuestion(currentQuestionIndex);
    }
  }, [currentQuestionIndex, gameStarted]);

  useEffect(() => {
    if (hasMeasuredRef.current) return;
    
    const timer = setTimeout(() => {
      if (!containerRef.current || hasMeasuredRef.current) return;
      
      const newTargets = [...dropTargets];
      let pendingMeasurements = dropTargets.length;
      let hasUpdates = false;
      
      dropTargets.forEach((target, index) => {
        const ref = targetRefs.current[target.id];
        if (!ref || !ref.current) {
          pendingMeasurements--;
          if (pendingMeasurements === 0 && hasUpdates) {
            hasMeasuredRef.current = true;
            setDropTargets(newTargets);
          }
          return;
        }
        
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          if (pageX !== null && pageY !== null) {
            newTargets[index] = {
              ...target,
              layout: {
                x: pageX,
                y: pageY,
                width: width || 80,
                height: height || 80,
              },
            };
            hasUpdates = true;
          }
          
          pendingMeasurements--;
          if (pendingMeasurements === 0 && hasUpdates) {
            hasMeasuredRef.current = true;
            setDropTargets(newTargets);
          }
        });
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dropTargets]);

  useEffect(() => {
    if (feedbackModal.visible) {
      const modalDuration = allCorrect ? 2000 : 1500;
      const timer = setTimeout(() => {
        setFeedbackModal({ ...feedbackModal, visible: false });
      }, modalDuration);
      return () => clearTimeout(timer);
    }
  }, [feedbackModal.visible, allCorrect]);

  const checkAllCorrect = (updatedTargets) => {
    const isAllCorrect = updatedTargets.every(target => target.isCorrect === true);
    
    if (isAllCorrect && !allCorrect) {
      setAllCorrect(true);
      
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setShowNextButton(true);
      } else {
        setGameCompleted(true);
        
        // Reward the player with an extra life if they complete the game
        const rewardPlayer = async () => {
          await livesManager.addLife();
          const updatedInfo = await livesManager.getLivesInfo();
          setLivesInfo(updatedInfo);
        };
        
        rewardPlayer();
      }
      
      setTimeout(() => {
        setFeedbackModal({
          visible: true,
          isCorrect: true,
          message: currentQuestionIndex < questions.length - 1 ? 
                   "Benar! Lanjutkan ke soal berikutnya." : 
                   "Semua Benar! Anda telah menyelesaikan semua soal dan mendapatkan nyawa tambahan!"
        });
      }, 300);
    }
  };

  // Modifikasi handleSuccessfulDrop untuk mengurangi nyawa saat salah
  const handleSuccessfulDrop = async (itemId, targetId, setVisible, resetPosition) => {
    const item = draggableItems.find(item => item.id === itemId);
    const target = dropTargets.find(target => target.id === targetId);
    
    if (!target || !target.layout || !item) {
      resetPosition();
      return;
    }
    
    const isCorrect = item.letter === target.correctLetter;
    
    if (isCorrect) {
      // Jawaban benar - item cocok dengan target
      const updatedTargets = dropTargets.map(t => 
        t.id === targetId 
          ? { ...t, occupied: true, itemId: itemId, isCorrect: true } 
          : { ...t }
      );
      
      setDropTargets(updatedTargets);
      setVisible(false);
      checkAllCorrect(updatedTargets);
      
      setFeedbackModal({
        visible: true,
        isCorrect: true,
        message: ""
      });
    } else {
      // Jawaban salah - item tidak cocok dengan target
      resetPosition();
      
      // Kurangi nyawa untuk jawaban salah
      const reduceLife = async () => {
        const stillHasLives = await livesManager.useLife();
        const updatedInfo = await livesManager.getLivesInfo();
        setLivesInfo(updatedInfo);
        
        // Jika nyawa habis setelah pengurangan, tutup game
        if (!stillHasLives || updatedInfo.lives <= 0) {
          setTimeout(() => {
            setFeedbackModal({ visible: false });
            setShowNoLivesModal(true);
          }, 1500);
        }
      };
      
      await reduceLife();
      
      setFeedbackModal({
        visible: true,
        isCorrect: false,
        message: `Salah! Nyawa berkurang 1.\nNyawa tersisa: ${livesInfo.lives}`
      });
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const DraggableItemComponent = ({ item }) => {
    const offset = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const isVisible = useSharedValue(1);
    
    const occupiedTarget = dropTargets.find(t => t.itemId === item.id && t.isCorrect === true);
    const isLocked = !!occupiedTarget;
    
    useEffect(() => {
      isVisible.value = isLocked ? 0 : 1;
    }, [isLocked]);
    
    const setItemVisible = (visible) => {
      isVisible.value = visible ? 1 : 0;
    };
    
    const resetItemPosition = () => {
      offset.value = withSpring({ x: 0, y: 0 });
    };
    
    const panGesture = Gesture.Pan()
      .enabled(!isLocked)
      .onStart(() => {
        isDragging.value = true;
        scale.value = withTiming(1.2, { duration: 100 });
        runOnJS(setActiveItemId)(item.id);
      })
      .onUpdate((event) => {
        offset.value = {
          x: event.translationX,
          y: event.translationY
        };
      })
      .onEnd((event) => {
        const itemPosition = {
          x: event.absoluteX,
          y: event.absoluteY
        };
        
        if (!dropTargets.some(target => target.layout)) {
          runOnJS(resetItemPosition)();
          return;
        }

        let droppedOnTarget = false;
        let targetId = null;

        for (const target of dropTargets) {
          if (target.occupied || !target.layout) continue;

          const { x, y, width, height } = target.layout;
          
          if (
            itemPosition.x >= x &&
            itemPosition.x <= x + width &&
            itemPosition.y >= y &&
            itemPosition.y <= y + height
          ) {
            droppedOnTarget = true;
            targetId = target.id;
            break;
          }
        }

        if (droppedOnTarget && targetId) {
          runOnJS(handleSuccessfulDrop)(item.id, targetId, setItemVisible, resetItemPosition);
        } else {
          runOnJS(resetItemPosition)();
        }
        
        scale.value = withTiming(1, { duration: 100 });
        runOnJS(setActiveItemId)(null);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: offset.value.x },
          { translateY: offset.value.y },
          { scale: scale.value }
        ],
        zIndex: isDragging.value ? 1000 : 1,
        opacity: isVisible.value,
        borderColor: isDragging.value ? '#2196F3' : '#1E3A8A'
      };
    });
    
    return (
      <GestureDetector gesture={panGesture}>
        <View>
          <Animated.View style={[styles.draggableItem, animatedStyle]}>
            <Text style={styles.draggableItemText}>{item.letter}</Text>
          </Animated.View>
        </View>
      </GestureDetector>
    );
  };

  // Modifikasi FeedbackModal untuk menampilkan info nyawa yang berkurang
  const FeedbackModal = () => (
    <Modal
      transparent={true}
      visible={feedbackModal.visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          feedbackModal.isCorrect ? styles.correctModalContainer : styles.incorrectModalContainer
        ]}>
          <Image
            source={
              feedbackModal.isCorrect
                ? require('../../assets/images/tampilan/correctpopup.png')
                : require('../../assets/images/tampilan/wrongpopup.png')
            }
            style={styles.feedbackImage}
            resizeMode="contain"
          />
          
          <Text style={[
            styles.modalMessageText,
            feedbackModal.isCorrect ? styles.correctMessageText : styles.incorrectMessageText
          ]}>
            {feedbackModal.isCorrect ? 'Benar!' : 'Salah!'}
          </Text>
          
          {feedbackModal.message && (
            <Text style={[
              styles.modalDetailText,
              feedbackModal.isCorrect ? styles.correctMessageText : styles.incorrectMessageText
            ]}>
              {feedbackModal.message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );

  // Render pre-game screen
  const renderPreGameScreen = () => {
    return (
      <View style={styles.preGameContainer}>
        <Text style={styles.preGameTitle}>Carakan - Nan Maenan</Text>
        <Text style={styles.preGameSubtitle}>Permainan Tempel Aksara</Text>
        
        <Text style={styles.preGameDescription}>
          Tarik aksara dan letakkan di posisi yang tepat. Nyawa akan berkurang jika aksara ditempatkan pada posisi yang salah.
        </Text>
        
        <Image 
          source={require('../../assets/images/tampilan/AstronoutGameA.png')} 
          style={styles.preGameImage} 
          resizeMode="contain"
        />
        
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
    );
  };

  // Render game completed screen
  const renderGameCompletedScreen = () => {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedTitle}>Permainan Selesai!</Text>
        <Text style={styles.completedSubtitle}>
          Anda telah menyelesaikan semua soal dengan sempurna!
        </Text>
        
        <Image 
          source={require('../../assets/images/tampilan/correctpopup.png')} 
          style={styles.completedImage} 
          resizeMode="contain"
        />
        
        <Text style={styles.bonusText}>
          Anda mendapatkan bonus nyawa tambahan!
        </Text>
        
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={startGame}
        >
          <Text style={styles.playAgainButtonText}>
            Main Lagi
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
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} ref={containerRef}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Game</Text>
          {gameStarted && !gameCompleted && (
            <Text style={styles.questionCounter}>
              Soal {currentQuestionIndex + 1} dari {questions.length}
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

        {!gameStarted ? (
          // Show pre-game screen
          renderPreGameScreen()
        ) : gameCompleted ? (
          // Show game completed screen
          renderGameCompletedScreen()
        ) : (
          // Main game interface
          <>
            <Text style={styles.gameTitle}>Nan Maenan</Text>
            
            <Text style={styles.instructionText}>kagabay okara e baba reya</Text>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
            </View>

            <Text style={styles.dropTargetLabel}>Tarik aksara dan letakkan di kotak di bawah ini:</Text>

            <View style={styles.dropTargetRow}>
              {dropTargets.map(target => (
                <View 
                  key={`target-${target.id}`}
                  ref={targetRefs.current[target.id]}
                  style={[
                    styles.dropTarget,
                    target.occupied && (target.isCorrect ? styles.correctTarget : styles.incorrectTarget)
                  ]}
                >
                  {target.occupied && target.itemId && target.isCorrect ? (
                    <View style={styles.targetContent}>
                      <Text style={styles.targetLetterText}>
                        {draggableItems.find(item => item.id === target.itemId)?.letter}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dropHereText}>Letakkan di sini</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.draggableContainer}>
              <Text style={styles.draggableTitle}>Aksara yang bisa ditarik:</Text>
              <View style={styles.draggableItemsRow}>
                {draggableItems.map(item => (
                  <DraggableItemComponent key={`item-${item.id}`} item={item} />
                ))}
              </View>
            </View>

            {showNextButton && (
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={goToNextQuestion}
              >
                <Text style={styles.nextButtonText}>Lanjut ke Soal Berikutnya</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/mainmenu')}>
              <Text style={styles.homeButtonText}>utama</Text>
            </TouchableOpacity>
          </>
        )}
        
        <FeedbackModal />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 10
  },
  instructionText: {
    fontSize: 16,
    color: '#1B4D89',
    marginBottom: 25
  },
  questionContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0B000'
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black'
  },
  dropTargetLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 20
  },
  dropTargetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '95%',
    marginBottom: 20
  },
  dropTarget: {
    width: 80,
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#E0B000',
    borderStyle: 'dashed',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  correctTarget: {
    backgroundColor: '#A5D6A7',
    borderColor: '#4CAF50',
    borderStyle: 'solid'
  },
  incorrectTarget: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
    borderStyle: 'solid'
  },
  dropHereText: {
    fontSize: 12,
    color: '#1B4D89',
    textAlign: 'center'
  },
  draggableContainer: {
    width: '95%',
    backgroundColor: '#7E80D8',
    borderRadius: 15,
    marginVertical: 20,
    padding: 15,
    alignItems: 'center'
  },
  draggableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    alignSelf: 'flex-start'
  },
  draggableItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
    paddingVertical: 10
  },
  draggableItem: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1E3A8A',
    margin: 10,
    elevation: 3,
  },
  draggableItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  targetContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  targetLetterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  homeButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 'auto',
    marginBottom: 30
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    elevation: 3
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  
  // Pre-game screen styles
  preGameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  preGameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  preGameSubtitle: {
    fontSize: 20,
    color: '#1E3A8A',
    marginBottom: 20,
  },
  preGameDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  preGameImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  startGameButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
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
  
  // Game completed screen
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  completedImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  bonusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 25,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    borderWidth: 3,
  },
  correctModalContainer: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  incorrectModalContainer: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  feedbackImage: {
    width: 100,
    height: 100,
  },
  modalMessageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalDetailText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  correctMessageText: {
    color: '#4CAF50',
  },
  incorrectMessageText: {
    color: '#F44336',
  }
});

export default DragDropGameScreen;