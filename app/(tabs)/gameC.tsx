import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DraggableItem {
  id: number;
  uri: ImageSourcePropType;
  letter: string; // Huruf/aksara yang diwakili
}

interface DropTarget {
  id: number;
  occupied: boolean;
  itemId: number | null;
  correctLetter: string; // Huruf yang seharusnya di target ini
  isCorrect?: boolean; // Apakah sudah diisi dengan benar
}

interface Question {
  id: number;
  text: string;
  draggableItems: DraggableItem[];
  dropTargets: DropTarget[];
}

const DragDropGameScreen = () => {
  // State untuk item yang aktif di-drag
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  
  // State untuk mengecek apakah semua target sudah diisi dengan benar
  const [allCorrect, setAllCorrect] = useState(false);
  
  // State untuk modal feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    isCorrect: false,
    message: ""
  });
  
  // State untuk mengecek pertanyaan aktif
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // State untuk melacak selesainya setiap pertanyaan
  const [completedQuestions, setCompletedQuestions] = useState([false, false, false]);
  
  // Buat array pertanyaan dengan masing-masing set items dan targets
  const [questions] = useState<Question[]>([
    {
      id: 1,
      text: "ACACA",
      draggableItems: [
        { 
          id: 1, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        },
        { 
          id: 2, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'C'
        },
        { 
          id: 3, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        }
      ],
      dropTargets: [
        { 
          id: 1, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A', // Target pertama harusnya A
          layout: null
        },
        { 
          id: 2, 
          occupied: false, 
          itemId: null,
          correctLetter: 'C', // Target kedua harusnya C
          layout: null
        },
        { 
          id: 3, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A', // Target ketiga harusnya A
          layout: null
        }
      ]
    },
    {
      id: 2,
      text: "BARATA",
      draggableItems: [
        { 
          id: 1, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'B'
        },
        { 
          id: 2, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        },
        { 
          id: 3, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'R'
        },
        { 
          id: 4, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        },
        { 
          id: 5, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'T'
        },
        { 
          id: 6, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        }
      ],
      dropTargets: [
        { 
          id: 1, 
          occupied: false, 
          itemId: null,
          correctLetter: 'B',
          layout: null
        },
        { 
          id: 2, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A',
          layout: null
        },
        { 
          id: 3, 
          occupied: false, 
          itemId: null,
          correctLetter: 'R',
          layout: null
        },
        { 
          id: 4, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A',
          layout: null
        },
        { 
          id: 5, 
          occupied: false, 
          itemId: null,
          correctLetter: 'T',
          layout: null
        },
        { 
          id: 6, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A',
          layout: null
        }
      ]
    },
    {
      id: 3,
      text: "MALALI",
      draggableItems: [
        { 
          id: 1, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'M'
        },
        { 
          id: 2, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        },
        { 
          id: 3, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'L'
        },
        { 
          id: 4, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'A'
        },
        { 
          id: 5, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'L'
        },
        { 
          id: 6, 
          uri: require('../../assets/images/tampilan/aksara/a.png'),
          letter: 'I'
        }
      ],
      dropTargets: [
        { 
          id: 1, 
          occupied: false, 
          itemId: null,
          correctLetter: 'M',
          layout: null
        },
        { 
          id: 2, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A',
          layout: null
        },
        { 
          id: 3, 
          occupied: false, 
          itemId: null,
          correctLetter: 'L',
          layout: null
        },
        { 
          id: 4, 
          occupied: false, 
          itemId: null,
          correctLetter: 'A',
          layout: null
        },
        { 
          id: 5, 
          occupied: false, 
          itemId: null,
          correctLetter: 'L',
          layout: null
        },
        { 
          id: 6, 
          occupied: false, 
          itemId: null,
          correctLetter: 'I', 
          layout: null
        }
      ]
    }
  ]);

  // State aktif untuk item dan target yang sedang ditampilkan
  const [activeDropTargets, setActiveDropTargets] = useState<DropTarget[]>(
    questions[activeQuestionIndex].dropTargets
  );

  // Referensi untuk container dan target area
  const containerRef = useRef(null);
  const targetRefs = useRef({});

  // Inisialisasi refs untuk semua target dari semua pertanyaan
  useEffect(() => {
    questions.forEach(question => {
      question.dropTargets.forEach(target => {
        if (!targetRefs.current[`q${question.id}-t${target.id}`]) {
          targetRefs.current[`q${question.id}-t${target.id}`] = React.createRef();
        }
      });
    });
  }, []);

  // Pindah ke pertanyaan berikutnya
  const goToNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prevIndex => prevIndex + 1);
      setAllCorrect(false); // Reset status all correct
    } else {
      // Semua pertanyaan selesai!
      Alert.alert("Selamat!", "Anda telah menyelesaikan semua soal!");
    }
  };

  // Pindah ke pertanyaan sebelumnya
  const goToPrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prevIndex => prevIndex - 1);
      setAllCorrect(false); // Reset status all correct
    }
  };

  // Efek saat pertanyaan aktif berubah
  useEffect(() => {
    // Update target aktif saat pertanyaan berubah
    setActiveDropTargets(questions[activeQuestionIndex].dropTargets);
    
    // Tidak perlu measureTargetLayouts() lagi karena pendekatan baru
  }, [activeQuestionIndex]);

  // Fungsi untuk menyiapkan target - solusi alternatif tanpa pakai measure()
  const prepareTargets = () => {
    // Kita tidak akan menggunakan measure() karena bisa menyebabkan crash
    // Sebagai gantinya, kita akan menggunakan bounding box relatif 
    // dan cek intersection dengan koordinat touch
  };

  // Efek untuk menutup modal secara otomatis setelah beberapa detik
  useEffect(() => {
    if (feedbackModal.visible) {
      const modalDuration = allCorrect ? 2000 : 1500; // Modal tampil lebih lama jika semua jawaban benar

      const timer = setTimeout(() => {
        setFeedbackModal({
          ...feedbackModal,
          visible: false
        });
        
        // Jika semua benar, setelah modal tertutup bisa lanjut ke soal berikutnya
        if (allCorrect) {
          // Update status pertanyaan selesai
          const newCompletedQuestions = [...completedQuestions];
          newCompletedQuestions[activeQuestionIndex] = true;
          setCompletedQuestions(newCompletedQuestions);
          
          // Tunggu sebentar lalu pindah ke pertanyaan berikutnya
          setTimeout(() => {
            // Jika bukan pertanyaan terakhir, pindah ke berikutnya
            if (activeQuestionIndex < questions.length - 1) {
              goToNextQuestion();
            }
          }, 500);
        }
      }, modalDuration);

      return () => clearTimeout(timer);
    }
  }, [feedbackModal.visible, allCorrect]);

  // Fungsi untuk memeriksa apakah semua target sudah diisi dengan benar
  const checkAllCorrect = (updatedTargets) => {
    const isAllCorrect = updatedTargets.every(target => 
      target.isCorrect === true
    );
    
    if (isAllCorrect && !allCorrect) {
      setAllCorrect(true);
      // Tampilkan gambar selamat setelah jeda singkat
      setTimeout(() => {
        setFeedbackModal({
          visible: true,
          isCorrect: true,
          message: "Semua Benar!"
        });
      }, 300);
    }
  };

  // Fungsi untuk menemukan target berdasarkan koordinat dan menangani drop
  const findDropTargetAndHandleDrop = (itemId, touchX, touchY, setVisible, resetPosition) => {
    // Ini akan diimplementasikan dengan pendekatan yang tidak menggunakan measure()
    // Kita akan menggunakan koordinat drop untuk menentukan target

    // Dapatkan semua targetRefs yang terlihat dan aktif
    const targetElements = targetRefs.current;
    if (!targetElements) return resetPosition();

    // Cari target yang cocok dengan iterasi dan pemeriksaan manual
    let targetId = null;
    let isOverTarget = false;

    // Gunakan callback measurements dengan timeout
    setTimeout(() => {
      // Cek apakah sedang di atas target
      const currentQuestion = questions[activeQuestionIndex];
      const availableTargets = activeDropTargets.filter(t => !t.occupied);
      
      // Pertama coba dengan manual iteration
      for (const target of availableTargets) {
        const targetElement = targetRefs.current[`q${currentQuestion.id}-t${target.id}`];
        if (targetElement && targetElement.current) {
          targetElement.current.measure((x, y, width, height, pageX, pageY) => {
            // Cek jika touchpoint berada di dalam target
            if (
              touchX >= pageX && 
              touchX <= pageX + width &&
              touchY >= pageY && 
              touchY <= pageY + height
            ) {
              isOverTarget = true;
              targetId = target.id;
              
              // Handle drop
              handleItemDrop(itemId, targetId, setVisible, resetPosition);
            }
          });
        }
      }
      
      // Jika tidak menemukan target, reset posisi item
      if (!isOverTarget) {
        resetPosition();
      }
    }, 50); // Gunakan timeout pendek
  };
  
  // Fungsi untuk menangani item drop
  const handleItemDrop = (itemId, targetId, setVisible, resetPosition) => {
    const currentQuestion = questions[activeQuestionIndex];
    const item = currentQuestion.draggableItems.find(item => item.id === itemId);
    const target = activeDropTargets.find(target => target.id === targetId);
    
    if (!item || !target) {
      resetPosition();
      return;
    }
    
    // Cek apakah huruf yang di-drop sesuai dengan yang seharusnya
    const isCorrect = item.letter === target.correctLetter;
    
    if (isCorrect) {
      // Jika benar, update target dan sembunyikan item asli
      const updatedTargets = activeDropTargets.map(t => 
        t.id === targetId 
          ? { 
              ...t, 
              occupied: true, 
              itemId: itemId,
              isCorrect: true
            } 
          : t
      );
      
      setActiveDropTargets(updatedTargets);
      
      // Update question di state utama juga
      const updatedQuestions = [...questions];
      updatedQuestions[activeQuestionIndex].dropTargets = updatedTargets;
      
      // Sembunyikan item di posisi asli
      setVisible(false);
      
      // Cek apakah semua sudah benar
      checkAllCorrect(updatedTargets);
      
      // Tampilkan gambar benar untuk feedback
      setFeedbackModal({
        visible: true,
        isCorrect: true,
        message: ""
      });
    } else {
      // Jika salah, kembalikan ke posisi awal
      resetPosition();
      
      // Tampilkan gambar salah untuk feedback
      setFeedbackModal({
        visible: true,
        isCorrect: false,
        message: ""
      });
    }
  };

  // Component untuk item yang bisa di-drag
  const DraggableItemComponent = ({ item }) => {
    // Nilai untuk animasi
    const offset = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const isVisible = useSharedValue(1);
    
    // Cek apakah item sudah ditempatkan di target dengan benar
    const occupiedTarget = activeDropTargets.find(t => t.itemId === item.id && t.isCorrect === true);
    const isLocked = !!occupiedTarget;
    
    // Jika item sudah ditempatkan dengan benar, sembunyikan dari container aslinya
    useEffect(() => {
      if (isLocked) {
        isVisible.value = 0;
      } else {
        isVisible.value = 1;
      }
    }, [isLocked, activeQuestionIndex]);
    
    // Reset visibility saat pertanyaan aktif berubah
    useEffect(() => {
      isVisible.value = 1;
      offset.value = { x: 0, y: 0 };
    }, [activeQuestionIndex]);
    
    // Fungsi untuk menyembunyikan item
    const setItemVisible = (visible) => {
      isVisible.value = visible ? 1 : 0;
    };
    
    // Fungsi untuk mengembalikan item ke posisi awal
    const resetItemPosition = () => {
      offset.value = withSpring({ x: 0, y: 0 });
    };
    
    // Gesture untuk drag
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
        isDragging.value = false;
        scale.value = withTiming(1, { duration: 100 });
        
        // Dapatkan informasi dari component aktif
        runOnJS(findDropTargetAndHandleDrop)(
          item.id, 
          event.absoluteX, 
          event.absoluteY, 
          setItemVisible,
          resetItemPosition
        );
        
        runOnJS(setActiveItemId)(null);
      });

    // Style untuk item
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
        <Animated.View 
          style={[styles.draggableItem, animatedStyle]}
        >
          <Image 
            source={item.uri}
            style={styles.aksaraImage}
            resizeMode="contain"
          />
          <Text style={styles.letterText}>{item.letter}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  // Modal komponen untuk feedback - tanpa tombol dan menutup otomatis
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
          {/* Gambar indikator benar/salah */}
          <Image
            source={
              feedbackModal.isCorrect
                ? require('../../assets/images/tampilan/correctpopup.png')
                : require('../../assets/images/tampilan/wrongpopup.png')
            }
            style={styles.feedbackImage}
            resizeMode="contain"
          />
          
          {/* Pesan tambahan jika semua benar */}
          {allCorrect && feedbackModal.isCorrect && (
            <Text style={styles.modalMessageText}>Semua Benar!</Text>
          )}
        </View>
      </View>
    </Modal>
  );

  // Ambil pertanyaan saat ini
  const currentQuestion = questions[activeQuestionIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} ref={containerRef}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Game</Text>
          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            {questions.map((_, index) => (
              <View 
                key={`progress-${index}`} 
                style={[
                  styles.progressDot,
                  index === activeQuestionIndex && styles.activeProgressDot,
                  completedQuestions[index] && styles.completedProgressDot
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Game Title */}
        <Text style={styles.gameTitle}>Nan Maenan</Text>
        
        {/* Game Instructions */}
        <Image 
          source={require('../../assets/images/tampilan/gameC.png')} 
          style={styles.instructionImage}
          resizeMode="contain"
        />

        {/* Question Container with Question Number */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
        </View>

        {/* Label untuk Drop Targets */}
        <Text style={styles.dropTargetLabel}>Tarik aksara dan letakkan di kotak di bawah ini:</Text>

        {/* Drop Target Area - Persegi dengan flex wrap */}
        <View style={styles.dropTargetRow}>
          {activeDropTargets.map(target => (
            <View 
              key={`target-${target.id}`}
              ref={targetRefs.current[`q${currentQuestion.id}-t${target.id}`]}
              style={[
                styles.dropTarget,
                target.occupied && (target.isCorrect ? styles.correctTarget : styles.incorrectTarget)
              ]}
            >
              {target.occupied && target.itemId && target.isCorrect ? (
                <>
                  {/* Tampilkan gambar aksara jika target sudah diisi dengan benar */}
                  <Image 
                    source={currentQuestion.draggableItems.find(item => item.id === target.itemId)?.uri}
                    style={styles.targetAksaraImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.targetLetterText}>
                    {currentQuestion.draggableItems.find(item => item.id === target.itemId)?.letter}
                  </Text>
                </>
              ) : (
                // Tampilkan teks jika target kosong
                <Text style={styles.dropHereText}>Letakkan di sini</Text>
              )}
            </View>
          ))}
        </View>

        {/* Draggable Items Container */}
        <View style={styles.draggableContainer}>
          <Text style={styles.draggableTitle}>Aksara yang bisa ditarik:</Text>
          <View style={styles.draggableItemsRow}>
            {currentQuestion.draggableItems.map(item => (
              <DraggableItemComponent key={`item-${item.id}`} item={item} />
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, activeQuestionIndex === 0 && styles.disabledButton]} 
            onPress={goToPrevQuestion}
            disabled={activeQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>Sebelumnya</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, !allCorrect && styles.disabledButton]} 
            onPress={goToNextQuestion}
            disabled={!allCorrect && !completedQuestions[activeQuestionIndex]}
          >
            <Text style={styles.navButtonText}>Selanjutnya</Text>
          </TouchableOpacity>
        </View>

        {/* Home Button */}
        <TouchableOpacity style={styles.homeButton}>
          <Text style={styles.homeButtonText}>Utama</Text>
        </TouchableOpacity>
        
        {/* Modal Feedback */}
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
    backgroundColor: '#FFD700', // Yellow header
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D89'
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0B000',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1B4D89',
  },
  activeProgressDot: {
    backgroundColor: '#1B4D89',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  completedProgressDot: {
    backgroundColor: '#4CAF50',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 10
  },
  instructionImage: {
    height: 120,
    width: '100%',
    marginBottom: 15,
    marginTop: 5
  },
  questionContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0B000',
    alignItems: 'center'
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
    width: '95%',
    marginBottom: 20,
    flexWrap: 'wrap'
  },
  dropTarget: {
    width: 70, 
    height: 70,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E0B000',
    borderStyle: 'dashed',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  correctTarget: {
    backgroundColor: '#A5D6A7', // Hijau muda jika benar
    borderColor: '#4CAF50',
    borderStyle: 'solid'
  },
  incorrectTarget: {
    backgroundColor: '#FFCDD2', // Merah muda jika salah
    borderColor: '#F44336',
    borderStyle: 'solid'
  },
  dropHereText: {
    fontSize: 11,
    color: '#1B4D89',
    textAlign: 'center'
  },
  targetLetterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginTop: 2
  },
  draggableContainer: {
    width: '95%',
    backgroundColor: '#7E80D8',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    maxHeight: '30%'
  },
  draggableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  draggableItemsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap'
  },
  draggableItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1E3A8A',
    margin: 8,
    elevation: 3,
  },
  letterText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginTop: 2
  },
  aksaraImage: {
    width: 40,
    height: 40
  },
  targetAksaraImage: {
    width: 45,
    height: 45
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 15
  },
  navButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    opacity: 0.7
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  homeButton: {
    backgroundColor: '#1B4D89',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 'auto',
    marginBottom: 20
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 180,
    height: 180,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    borderWidth: 3,
  },
  correctModalContainer: {
    borderColor: '#4CAF50', // Green border for correct feedback
    backgroundColor: '#E8F5E9',
  },
  incorrectModalContainer: {
    borderColor: '#F44336', // Red border for incorrect feedback
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
    color: '#4CAF50',
    textAlign: 'center'
  }
});

export default DragDropGameScreen;
