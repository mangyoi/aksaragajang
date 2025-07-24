import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import LivesDisplay from "../../components/LivesDisplay";
import NoLivesModal from "../../components/NoLivesModal";
import livesManager, { LivesInfo } from "../../utils/livesManager";
import { InteractionManager } from "react-native";
import { Audio } from "expo-av";
import { BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_KEY = "dragdrop";
const manager = livesManager.getManager(GAME_KEY);

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

const DropTargetBox = React.forwardRef(
  ({ target, letter }: { target: DropTarget; letter?: string }, ref) => (
    <View
      ref={ref as React.RefObject<View>}
      style={[
        styles.dropTarget,
        target.occupied &&
          (target.isCorrect ? styles.correctTarget : styles.incorrectTarget),
      ]}
    >
      {target.occupied && target.itemId && target.isCorrect ? (
        <View style={styles.targetContent}>
          <Text style={styles.targetLetterText}>{letter}</Text>
        </View>
      ) : (
        <Text style={styles.dropHereText}>Saba' E Dinna'</Text>
      )}
    </View>
  )
);

DropTargetBox.displayName = "DropTargetBox";

const DragDropGameScreen = () => {
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const router = useRouter();

  const [isTransitioning, setIsTransitioning] = useState(false);

  const [livesInfo, setLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false,
  });
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const questions: Question[] = [
    {
      id: 1,
      text: "Acaca",
      items: [
        { id: 101, letter: "ꦲ" },
        { id: 102, letter: "ꦕ" },
        { id: 103, letter: "ꦕ" },
      ],
      targets: [
        {
          id: 201,
          occupied: false,
          itemId: null,
          correctLetter: "ꦲ",
          layout: null,
        },
        {
          id: 202,
          occupied: false,
          itemId: null,
          correctLetter: "ꦕ",
          layout: null,
        },
        {
          id: 203,
          occupied: false,
          itemId: null,
          correctLetter: "ꦕ",
          layout: null,
        },
      ],
    },
    {
      id: 2,
      text: "Sapana",
      items: [
        { id: 104, letter: "ꦥ" },
        { id: 105, letter: "ꦱ" },
        { id: 106, letter: "ꦤ" },
      ],
      targets: [
        {
          id: 204,
          occupied: false,
          itemId: null,
          correctLetter: "ꦱ",
          layout: null,
        },
        {
          id: 205,
          occupied: false,
          itemId: null,
          correctLetter: "ꦥ",
          layout: null,
        },
        {
          id: 206,
          occupied: false,
          itemId: null,
          correctLetter: "ꦤ",
          layout: null,
        },
      ],
    },
    {
      id: 3,
      text: "Pamacana",
      items: [
        { id: 107, letter: "ꦕ" },
        { id: 108, letter: "ꦩ" },
        { id: 109, letter: "ꦤ" },
        { id: 110, letter: "ꦥ" },
      ],
      targets: [
        {
          id: 207,
          occupied: false,
          itemId: null,
          correctLetter: "ꦥ",
          layout: null,
        },
        {
          id: 208,
          occupied: false,
          itemId: null,
          correctLetter: "ꦩ",
          layout: null,
        },
        {
          id: 209,
          occupied: false,
          itemId: null,
          correctLetter: "ꦕ",
          layout: null,
        },
        {
          id: 210,
          occupied: false,
          itemId: null,
          correctLetter: "ꦤ",
          layout: null,
        },
      ],
    },
    {
      id: 4,
      text: "Kacamata",
      items: [
        { id: 111, letter: "ꦕ" },
        { id: 112, letter: "ꦩ" },
        { id: 113, letter: "ꦠ" },
        { id: 114, letter: "ꦏ" },
      ],
      targets: [
        {
          id: 211,
          occupied: false,
          itemId: null,
          correctLetter: "ꦏ",
          layout: null,
        },
        {
          id: 212,
          occupied: false,
          itemId: null,
          correctLetter: "ꦕ",
          layout: null,
        },
        {
          id: 213,
          occupied: false,
          itemId: null,
          correctLetter: "ꦩ",
          layout: null,
        },
        {
          id: 214,
          occupied: false,
          itemId: null,
          correctLetter: "ꦠ",
          layout: null,
        },
      ],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    questions[0]
  );
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>(
    questions[0].items
  );
  const [dropTargets, setDropTargets] = useState<DropTarget[]>(
    questions[0].targets
  );

  const containerRef = useRef(null);
  const targetRefs = useRef({});
  const hasMeasuredRef = useRef(false);

  const animatedValuesRef = useRef([]);
  //   useEffect(() => {
  //   if (showNoLivesModal) {
  //     const timeout = setTimeout(() => {
  //       setShouldShowModal(true);
  //     }, 200); // delay sedikit agar layout stabil
  //     return () => clearTimeout(timeout);
  //   } else {
  //     setShouldShowModal(false);
  //   }
  // }, [showNoLivesModal]);

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

    await playBackgroundMusic();
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    initializeQuestion(0);
  };

  const handleLivesUpdated = (info: LivesInfo) => {
    setLivesInfo(info);
  };

  const handleNoLivesGoHome = () => {
    stopBackgroundMusic();
    setShowNoLivesModal(false);
    router.push("/mainmenu");
  };

  const cleanupAnimatedValues = () => {
    animatedValuesRef.current.forEach((value) => {
      try {
        if (value && typeof value.value !== "undefined") {
          cancelAnimation(value);
        }
      } catch (error) {
        console.log("Error cleaning up animation:", error);
      }
    });

    animatedValuesRef.current = [];
  };

  const initializeQuestion = (index: number) => {
    setIsTransitioning(false);

    const baseQuestion = questions[index];

    const clonedTargets = baseQuestion.targets.map((target) => ({
      id: target.id,
      correctLetter: target.correctLetter,
      occupied: false,
      itemId: null,
      isCorrect: false,
      layout: null,
    }));

    const newTargetRefs = {};
    clonedTargets.forEach((target) => {
      newTargetRefs[target.id] = React.createRef();
    });
    targetRefs.current = newTargetRefs;

    setCurrentQuestion({
      ...baseQuestion,
      targets: clonedTargets,
      items: [...baseQuestion.items],
    });
    setDraggableItems([...baseQuestion.items]);
    setDropTargets(clonedTargets);
    setAllCorrect(false);
    setShowNextButton(false);
    hasMeasuredRef.current = false;

    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        hasMeasuredRef.current = false;
        requestAnimationFrame(() => {
          measureDropTargets();
        });
      }, 300);
    });
  };

  const soundRef = useRef<Audio.Sound | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playBackgroundMusic = async () => {
    try {
      if (isMusicPlaying) return;

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/music/GameBacksound.mp3"), // ← pastikan path benar
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0,
        }
      );

      soundRef.current = sound;
      await sound.playAsync();
      setIsMusicPlaying(true);
    } catch (error) {
      console.error("Gagal memutar musik:", error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsMusicPlaying(false);
      }
    } catch (error) {
      console.error("Gagal menghentikan musik:", error);
    }
  };

  useEffect(() => {
    if (dropTargets.some((t) => t.layout === null)) {
      const timeout = setTimeout(() => {
        measureDropTargets(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [dropTargets]);

  useEffect(() => {
    if (gameStarted && !isTransitioning) {
      initializeQuestion(currentQuestionIndex);
    }
  }, [currentQuestionIndex, gameStarted, isTransitioning]);

  const measureDropTargets = (force = false) => {
    if (
      (hasMeasuredRef.current && !force) ||
      !containerRef.current ||
      isMeasuring
    )
      return;

    setIsMeasuring(true);

    const newTargets = [...dropTargets];
    let pendingMeasurements = dropTargets.length;
    let hasUpdates = false;

    dropTargets.forEach((target, index) => {
      const ref = targetRefs.current[target.id];
      if (!ref || !ref.current) {
        pendingMeasurements--;
        if (pendingMeasurements === 0)
          finalizeMeasurements(newTargets, hasUpdates);
        return;
      }

      try {
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
          if (pendingMeasurements === 0)
            finalizeMeasurements(newTargets, hasUpdates);
        });
      } catch (e) {
        pendingMeasurements--;
        if (pendingMeasurements === 0)
          finalizeMeasurements(newTargets, hasUpdates);
      }
    });
  };

  const finalizeMeasurements = (targets, shouldUpdate) => {
    if (shouldUpdate) {
      setDropTargets(targets);
      hasMeasuredRef.current = true;
    }
    setIsMeasuring(false);
  };

  const checkAllCorrect = (updatedTargets: DropTarget[]) => {
    const isAllCorrect = updatedTargets.every(
      (target: DropTarget) => target.isCorrect === true
    );

    if (isAllCorrect && !allCorrect) {
      setAllCorrect(true);

      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setShowNextButton(true);
      } else {
        setGameCompleted(true);

        const rewardPlayer = async () => {
          await manager.addLife();
          const updatedInfo = await manager.getInfo();
          setLivesInfo(updatedInfo);
        };

        rewardPlayer();
      }
    }
  };

  const handleSuccessfulDrop = async (
    itemId: number,
    targetId: number,
    setVisible: (visible: boolean) => void,
    resetPosition: () => void
  ) => {
    const item = draggableItems.find((item) => item.id === itemId);
    const target = dropTargets.find((target) => target.id === targetId);

    if (!item || !target || !target.layout) {
      runOnJS(resetPosition)();
      return;
    }

    const isCorrect = item.letter === target.correctLetter;

    if (isCorrect) {
      const updatedTargets = dropTargets.map((t) =>
        t.id === targetId
          ? { ...t, occupied: true, itemId: itemId, isCorrect: true }
          : { ...t }
      );

      setDropTargets(updatedTargets);
      setVisible(false);
      checkAllCorrect(updatedTargets);
    } else {
      runOnJS(resetPosition)();

      const stillHasLives = await manager.useLife();
      const updatedInfo = await manager.getInfo();
      setLivesInfo(updatedInfo);

      if (!stillHasLives || updatedInfo.lives <= 0) {
        setTimeout(() => {
          setShowNoLivesModal(true);
        }, 1500);
      }
    }
  };

  const goToNextQuestion = () => {
    setIsTransitioning(true);
    cleanupAnimatedValues();

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const DraggableItemComponent = ({ item }) => {
    const offset = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const isVisible = useSharedValue(1);

    const occupiedTarget = dropTargets.find(
      (t) => t.itemId === item.id && t.isCorrect === true
    );
    const isLocked = !!occupiedTarget;

    useEffect(() => {
      isVisible.value = isLocked ? 0 : 1;
    }, [isLocked]);

    const setItemVisible = (visible) => {
      isVisible.value = visible ? 1 : 0;
    };

    const resetItemPosition = () => {
      offset.value = withSpring(
        { x: 0, y: 0 },
        {
          damping: 15,
          stiffness: 120,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }
      );
      scale.value = withTiming(1, { duration: 150 });
    };

    let startX = 0;
    let startY = 0;

    const panGesture = Gesture.Pan()
      .enabled(!isLocked)
      .onStart((event) => {
        if (isTransitioning || !hasMeasuredRef.current) return;
        isDragging.value = true;
        scale.value = withTiming(1.1, { duration: 100 });
        startX = event.absoluteX;
        startY = event.absoluteY;
        runOnJS(setActiveItemId)(item.id);
      })
      .onUpdate((event) => {
        if (
          typeof event.translationX !== "number" ||
          typeof event.translationY !== "number"
        )
          return;
        offset.value = {
          x: event.translationX,
          y: event.translationY,
        };
      })
      .onEnd((event) => {
        const itemPosition = {
          x: event.absoluteX,
          y: event.absoluteY,
        };

        let droppedOnTarget = false;
        let targetId = null;
        const buffer = 30;

        for (const target of dropTargets) {
          if (target.occupied || !target.layout) continue;

          const { x, y, width, height } = target.layout;

          if (
            itemPosition.x >= x - buffer &&
            itemPosition.x <= x + width + buffer &&
            itemPosition.y >= y - buffer &&
            itemPosition.y <= y + height + buffer
          ) {
            droppedOnTarget = true;
            targetId = target.id;
            break;
          }
        }

        if (droppedOnTarget && targetId != null) {
          runOnJS(handleSuccessfulDrop)(
            item.id,
            targetId,
            setItemVisible,
            resetItemPosition
          );
        } else {
          runOnJS(resetItemPosition)();
        }

        scale.value = withTiming(1, { duration: 100 });
        isDragging.value = false;
        runOnJS(setActiveItemId)(null);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: offset.value.x },
          { translateY: offset.value.y },
          { scale: scale.value },
        ],
        zIndex: isDragging.value ? 1000 : 1,
        opacity: isVisible.value,
        borderColor: isDragging.value ? "#2196F3" : "#1E3A8A",
      };
    });

    if (isLocked) return null;

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

  const renderGameCompletedScreen = () => {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedTitle}>Permainan Mare!</Text>
        <Text style={styles.completedSubtitle}>
          Ba'na la mamare kakabbih pertanyaan.
        </Text>

        <Image
          source={require("../../assets/images/tampilan/correctpopup.png")}
          style={styles.completedImage}
          resizeMode="contain"
        />

        <Text style={styles.bonusText}>Ba'na olle tamba'an nyaba</Text>

        <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
          <Text style={styles.playAgainButtonText}>A Main Pole</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            stopBackgroundMusic();
            router.push("/mainmenu");
          }}
        >
          <Text style={styles.homeButtonText}>Abali ke Menu Utama</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    return () => {
      cleanupAnimatedValues();
    };
  }, []);

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

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

        <LivesDisplay
          onLivesUpdated={handleLivesUpdated}
          livesInfo={livesInfo}
        />

        <NoLivesModal
          visible={showNoLivesModal}
          onClose={() => setShowNoLivesModal(false)}
          onGoHome={handleNoLivesGoHome}
          timeUntilNextLife={livesInfo.timeUntilNextLife}
        />

        {!gameStarted ? (
          renderPreGameScreen()
        ) : gameCompleted ? (
          renderGameCompletedScreen()
        ) : (
          <>
            <Text style={styles.gameTitle}>Nan Maenan</Text>

            <Text style={styles.instructionText}>
              kagabay okara e baba reya
            </Text>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
            </View>

            <Text style={styles.dropTargetLabel}>
              Erset aksara ban saba' e kotak e baba rea
            </Text>

            <View style={styles.dropTargetRow}>
              {dropTargets.map((target) => {
                const letter = draggableItems.find(
                  (item) => item.id === target.itemId
                )?.letter;
                return (
                  <DropTargetBox
                    key={`target-${target.id}`}
                    ref={targetRefs.current[target.id]}
                    target={target}
                    letter={letter}
                  />
                );
              })}
            </View>

            <View style={styles.draggableContainer}>
              <Text style={styles.draggableTitle}>Aksara se bisa e tarek:</Text>
              <View style={styles.draggableItemsRow}>
                {!isTransitioning &&
                  draggableItems.map((item) => (
                    <DraggableItemComponent
                      key={`item-${item.id}`}
                      item={item}
                    />
                  ))}
              </View>
            </View>

            {showNextButton && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goToNextQuestion}
                disabled={isTransitioning}
              >
                <Text style={styles.nextButtonText}>Terros ka Soal Laenna</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                stopBackgroundMusic();
                router.push("/mainmenu");
              }}
            >
              <Text style={styles.homeButtonText}>Abali ke Menu</Text>
            </TouchableOpacity>
          </>
        )}
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
    backgroundColor: "white",
    alignItems: "center",
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
  questionCounter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4D89",
    marginBottom: 10,
  },
  preGameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  instructionText: {
    fontSize: 16,
    color: "#1B4D89",
    marginBottom: 25,
  },
  questionContainer: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E0B000",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
  },
  dropTargetLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4D89",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  dropTargetRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "95%",
    marginBottom: 20,
  },
  dropTarget: {
    width: 80,
    height: 80,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#E0B000",
    borderStyle: "dashed",
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  correctTarget: {
    backgroundColor: "#A5D6A7",
    borderColor: "#4CAF50",
    borderStyle: "solid",
  },
  incorrectTarget: {
    backgroundColor: "#FFCDD2",
    borderColor: "#F44336",
    borderStyle: "solid",
  },
  dropHereText: {
    fontSize: 12,
    color: "#1B4D89",
    textAlign: "center",
  },
  draggableContainer: {
    width: "95%",
    backgroundColor: "#7E80D8",
    borderRadius: 15,
    marginVertical: 20,
    padding: 15,
    alignItems: "center",
  },
  draggableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  draggableItemsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    width: "100%",
    paddingVertical: 10,
  },
  draggableItem: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#1E3A8A",
    margin: 10,
    elevation: 3,
  },
  draggableItemText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  targetContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  targetLetterText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  homeButton: {
    backgroundColor: "#1B4D89",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    // marginTop: "auto",
    marginBottom: 30,
  },
  homeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    elevation: 3,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  characterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 10,
  },

  speechText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  astronautImage: {
    marginTop: 140,
    width: 350,
    height: 175,
  },

  startButton: {
    backgroundColor: "#FFD700",
    borderColor: "#1B4D89",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: "#1B4D89",
    fontSize: 16,
    fontWeight: "bold",
  },

  menuButton: {
    backgroundColor: "#1E3A8A",
    borderColor: "#4D5BD1",
  },

  menuButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  startGameButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  completedImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  bonusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 25,
  },
  playAgainButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  playAgainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    borderWidth: 3,
  },
});

export default DragDropGameScreen;
