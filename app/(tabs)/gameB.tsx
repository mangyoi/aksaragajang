import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
} from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import LivesDisplay from "../../components/LivesDisplay";
import NoLivesModal from "../../components/NoLivesModal";
import livesManager, { LivesInfo } from "../../utils/livesManager";
import { Audio } from "expo-av";
import { BackHandler } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_KEY = "malengkap";
const manager = livesManager.getManager(GAME_KEY);

interface AksaraOption {
  id: number;
  text: string;
  letter: string;

  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  incompleteWord: string;
  latinWord: string;
  options: AksaraOption[];
}

const NanMaenanGameScreen: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [gameCompleteModalVisible, setGameCompleteModalVisible] =
    useState(false);

  const [livesInfo, setLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false,
  });
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const posX = useSharedValue(24);
  const posY = useSharedValue(110);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value }, { translateY: posY.value }],
  }));
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = posX.value;
      startY.value = posY.value;
    })
    .onUpdate((e) => {
      posX.value = startX.value + e.translationX;
      posY.value = startY.value + e.translationY;
    });

  const questions: Question[] = [
    {
      id: 1,
      questionText: "Lengkapi oca' e baba rea:",
      incompleteWord: "ꦲꦤ_",
      latinWord: "Anapa",
      options: [
        {
          id: 1,
          text: "ꦲ",
          letter: "a",
          isCorrect: false,
        },
        {
          id: 2,
          text: "ꦥ",
          letter: "pa",
          isCorrect: true,
        },
        {
          id: 3,
          text: "ꦕ",
          letter: "ca",
          isCorrect: false,
        },
        {
          id: 4,
          text: "ꦱ",
          letter: "sa",
          isCorrect: false,
        },
      ],
    },
    {
      id: 2,
      questionText: "Lengkapi kata berikut:",
      incompleteWord: "ꦩ_ꦤ",
      latinWord: "Macana",
      options: [
        {
          id: 1,
          text: "ꦕ",
          letter: "ca",
          isCorrect: true,
        },
        {
          id: 2,
          text: "ꦲ",
          letter: "a",
          isCorrect: false,
        },
        {
          id: 3,
          text: "ꦤ",
          letter: "na",
          isCorrect: false,
        },
        {
          id: 4,
          text: "ꦠ",
          letter: "ta",
          isCorrect: false,
        },
      ],
    },
    {
      id: 3,
      questionText: "Lengkapi kata berikut:",
      incompleteWord: "_ꦥꦤ",
      latinWord: "Sapana",
      options: [
        {
          id: 1,
          text: "ꦏ",
          letter: "ka",
          isCorrect: false,
        },
        {
          id: 2,
          text: "ꦗ",
          letter: "ja",
          isCorrect: false,
        },
        {
          id: 3,
          text: "ꦱ",
          letter: "sa",
          isCorrect: true,
        },
        {
          id: 4,
          text: "ꦢ",
          letter: "da",
          isCorrect: false,
        },
      ],
    },
    {
      id: 4,
      questionText: "Lengkapi kata berikut:",
      incompleteWord: "_ꦩꦤ",
      latinWord: "Nyamana",
      options: [
        {
          id: 1,
          text: "ꦏ",
          letter: "ka",
          isCorrect: false,
        },
        {
          id: 2,
          text: "ꦲ",
          letter: "a",
          isCorrect: false,
        },
        {
          id: 3,
          text: "ꦠ",
          letter: "ta",
          isCorrect: false,
        },
        {
          id: 4,
          text: "ꦚ",
          letter: "nya",
          isCorrect: true,
        },
      ],
    },
    {
      id: 5,
      questionText: "Lengkapi kata berikut:",
      incompleteWord: "ꦚ_ꦤ",
      latinWord: "Nyatana",
      options: [
        {
          id: 1,
          text: "ꦕ",
          letter: "ca",
          isCorrect: false,
        },
        {
          id: 2,
          text: "ꦭ",
          letter: "la",
          isCorrect: false,
        },
        {
          id: 3,
          text: "ꦠ",
          letter: "ta",
          isCorrect: true,
        },
        {
          id: 4,
          text: "ꦤ",
          letter: "na",
          isCorrect: false,
        },
      ],
    },
  ];

  useEffect(() => {
    const backAction = () => {
      stopBackgroundMusic().then(() => {
        router.push("/mainmenu");
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const checkLives = async () => {
      const info = await manager.initialize();
      setLivesInfo(info);
    };

    checkLives();
  }, []);

  const startGame = async () => {
    const info = await manager.getInfo();
    setLivesInfo(info);

    if (info.lives <= 0) {
      setShowNoLivesModal(true);
      return;
    }

    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    await playBackgroundMusic();
  };

  useEffect(() => {
    if (selectedOption !== null) {
      const currentOptions = questions[currentQuestionIndex].options;
      const selectedOptionData = currentOptions.find(
        (option) => option.id === selectedOption
      );
      const isCorrect = selectedOptionData?.isCorrect || false;

      setIsAnswerCorrect(isCorrect);

      if (!isCorrect) {
        const reduceLife = async () => {
          const stillHasLives = await manager.useLife();
          const updatedInfo = await manager.getInfo();
          setLivesInfo(updatedInfo);

          if (!stillHasLives || updatedInfo.lives <= 0) {
            setTimeout(() => {
              setAlertVisible(false);
              setTimeout(() => {
                setShowNoLivesModal(true);
                setTimeout(() => {
                  router.push("/mainmenu");
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
        setCorrectAnswers((prev) => prev + 1);
      }
    }
  }, [selectedOption]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameCompleteModalVisible(true);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
    }
  };

  const toggleMusic = async () => {
    if (isMusicPlaying) {
      await stopBackgroundMusic();
    } else {
      await playBackgroundMusic();
    }
  };

  // const handleStart = () => {
  //   console.log("Mulai permainan ditekan");
  //   setGameStarted(true);
  // };
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

  const restartGame = async () => {
    const info = await manager.getInfo();
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

  const completeGameWithReward = async () => {
    if (correctAnswers >= Math.floor(questions.length * 0.8)) {
      await manager.addLife();
      const updatedInfo = await manager.getInfo();
      setLivesInfo(updatedInfo);
    }

    setGameCompleteModalVisible(false);
    await stopBackgroundMusic();
    router.push("/mainmenu");
  };

  const handleLivesUpdated = (info: LivesInfo) => {
    setLivesInfo(info);
  };

  const handleNoLivesGoHome = () => {
    setShowNoLivesModal(false);
    stopBackgroundMusic();
    router.push("/mainmenu");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playBackgroundMusic = async () => {
    if (isMusicPlaying) return;

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/music/GameBacksound.mp3"),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 0.5,
      }
    );

    soundRef.current = sound;
    await sound.playAsync();
    setIsMusicPlaying(true);
  };

  const stopBackgroundMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsMusicPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);
  const renderPreGameScreen = () => {
    return (
      <View style={styles.preGameContainer}>
        <Text style={styles.gameTitle}>Nan Maenan</Text>

        <TouchableOpacity
          style={[
            styles.startButton,
            livesInfo.lives <= 0 && styles.disabledButton,
          ]}
          onPress={startGame}
          disabled={livesInfo.lives <= 0}
        >
          <Text style={styles.startButtonText}>
            Molai Permainan {livesInfo.lives <= 0 ? "(Nyaba Tadha')" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, styles.menuButton]}
          onPress={() => {
            stopBackgroundMusic();
            router.push("/mainmenu");
          }}
        >
          <Text style={styles.menuButtonText}> Abali ka Menu Utama </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      <LivesDisplay gameKey={GAME_KEY} onLivesUpdated={handleLivesUpdated} />

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
        {!gameStarted ? (
          renderPreGameScreen()
        ) : (
          <>
            <View style={styles.mainSymbolContainer}>
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {currentQuestion.questionText}
                </Text>
                <Text style={styles.latinText}>
                  {currentQuestion.latinWord}
                </Text>
                <Text style={styles.incompleteWord}>
                  {currentQuestion.incompleteWord}
                </Text>
              </View>
              <Text style={styles.aksaraLabel}>Esse'e asksara se elang</Text>
            </View>

            <View style={styles.symbolGridContainer}>
              <Text style={styles.symbolGridTitle}>Pele aksara se bender:</Text>
              <View style={styles.symbolGrid}>
                {[
                  [currentQuestion.options[0], currentQuestion.options[1]],
                  [currentQuestion.options[2], currentQuestion.options[3]],
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.symbolRow}>
                    {row.map((aksara) => (
                      <TouchableOpacity
                        key={aksara.id}
                        style={[
                          styles.symbolButton,
                          selectedOption === aksara.id &&
                            (aksara.isCorrect
                              ? styles.correctAnswerButton
                              : styles.wrongAnswerButton),
                        ]}
                        onPress={() => handleOptionSelect(aksara.id)}
                      >
                        <Text style={styles.optionText}>{aksara.text}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.bottomMenuButton}
                onPress={() => {
                  stopBackgroundMusic();
                  router.push("/mainmenu");
                }}
              >
                <Text style={styles.bottomMenuButtonText}>
                  Abali ka Menu Utama
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {gameStarted && !gameCompleted && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.musicFloatingButton, animatedStyle]}>
              <TouchableOpacity onPress={toggleMusic} activeOpacity={0.7}>
                <Image
                  source={
                    isMusicPlaying
                      ? require("../../assets/images/tampilan/icon/sound.png")
                      : require("../../assets/images/tampilan/icon/no-sound.png")
                  }
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>
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
          <View
            style={[
              styles.modalContainer,
              isAnswerCorrect
                ? styles.correctModalContainer
                : styles.incorrectModalContainer,
            ]}
          >
            <Image
              source={
                isAnswerCorrect
                  ? require("../../assets/images/tampilan/correctpopup.png")
                  : require("../../assets/images/tampilan/wrongpopup.png")
              }
              style={styles.feedbackImage}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.modalText,
                isAnswerCorrect ? styles.correctText : styles.incorrectText,
              ]}
            >
              {isAnswerCorrect ? "Teppa'!" : "Salah!"}
            </Text>

            <Text style={styles.modalDetailText}>
              {isAnswerCorrect
                ? currentQuestionIndex < questions.length - 1
                  ? "Terros ka soal saterrossa."
                  : "Areya soal dibudina!"
                : `Nyaba a korang 1. Nyaba a kare: ${livesInfo.lives}\nEatore ulang.`}
            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                isAnswerCorrect ? styles.correctButton : styles.incorrectButton,
              ]}
              onPress={closeAlert}
            >
              <Text style={styles.modalButtonText}>Iya</Text>
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
            {/* <Image
              source={require("../../assets/images/tampilan/correctpopup.png")}
              style={styles.gameCompleteImage}
              resizeMode="contain"
            /> */}

            <Text style={styles.gameCompleteTitle}>Salamet!</Text>
            <Text style={styles.gameCompleteText}>
              Ba'na la ma mare kakabbih soal dengan {correctAnswers} jawaban
              teppa' dari {questions.length} soal.
              {correctAnswers >= Math.floor(questions.length * 0.8) &&
                "\n\nBa'na olle bonus tambaan nyaba!"}
            </Text>

            <View style={styles.gameCompleteButtons}>
              <TouchableOpacity
                style={[styles.gameCompleteButton, styles.restartButton]}
                onPress={restartGame}
              >
                <Text style={styles.gameCompleteButtonText}>Amain Pole</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gameCompleteButton, styles.menuButton]}
                onPress={async () => {
                  await stopBackgroundMusic();
                  completeGameWithReward();
                }}
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
    backgroundColor: "white",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  questionIndicator: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 150,
    color: "#1B4D89",

    alignItems: "center",
  },
  instructionImage: {
    height: 150,
    width: "100%",
    marginBottom: 15,
    marginTop: 5,
  },
  mainSymbolContainer: {
    width: "90%",
    backgroundColor: "#7E80D8",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginVertical: 15,
  },
  musicFloatingButton: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: "#1B4D89",
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  questionContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  latinText: {
    fontSize: 18,
    color: "white",
    fontStyle: "italic",
    textAlign: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  incompleteWord: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 5,
    textAlign: "center",
  },
  aksaraLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  symbolGridContainer: {
    width: "90%",
    marginVertical: 15,
  },
  symbolGridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4D89",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  symbolGrid: {
    width: "100%",
  },
  symbolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  symbolButton: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.3,
    backgroundColor: "#F7DA30",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 5,
    borderWidth: 2,
    borderColor: "#E0B000",
    shadowColor: "#000",
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
    borderColor: "#4CAF50",
    backgroundColor: "#C8E6C9",
  },
  wrongAnswerButton: {
    borderWidth: 3,
    borderColor: "#F44336",
    backgroundColor: "#FFCDD2",
  },
  optionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  bottomPadding: {
    height: 20,
  },

  preGameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "80%",
  },
  preGameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  preGameDescription: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  characterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  characterImage: {
    width: 120,
    height: 120,
    marginRight: 10,
  },

  startButton: {
    backgroundColor: "#F7DA30",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1B4D89",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    borderColor: "#aaa",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  menuButton: {
    backgroundColor: "#1E3A8A",
    borderColor: "#4D5BD1",
    width: "100%",
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 250,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    borderWidth: 3,
  },
  correctModalContainer: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  incorrectModalContainer: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  feedbackImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  modalDetailText: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 15,
    textAlign: "center",
  },
  correctText: {
    color: "#4CAF50",
  },
  incorrectText: {
    color: "#F44336",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  correctButton: {
    backgroundColor: "#4CAF50",
  },
  incorrectButton: {
    backgroundColor: "#F44336",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  gameCompleteContainer: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1E3A8A",
  },
  gameCompleteImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  gameCompleteTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  gameCompleteText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#424242",
  },
  gameCompleteButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  gameCompleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    color: "##1E3A8A",
  },
  restartButton: {
    backgroundColor: "#FF9800",
  },
  gameCompleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomMenuButton: {
    marginTop: 20,
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4D5BD1",
    alignItems: "center",
  },
  bottomMenuButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default NanMaenanGameScreen;
