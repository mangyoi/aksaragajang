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

const DragDropGameScreen = () => {
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  
  const [allCorrect, setAllCorrect] = useState(false);
  
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    isCorrect: false,
    message: ""
  });
  
  const [draggableItems] = useState<DraggableItem[]>([
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
  ]);

  const [dropTargets, setDropTargets] = useState<DropTarget[]>([
    { 
      id: 1, 
      occupied: false, 
      itemId: null,
      correctLetter: 'A',
      layout: null
    },
    { 
      id: 2, 
      occupied: false, 
      itemId: null,
      correctLetter: 'C',
      layout: null
    },
    { 
      id: 3, 
      occupied: false, 
      itemId: null,
      correctLetter: 'A',
      layout: null
    }
  ]);

  const containerRef = useRef(null);
  const targetRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null)
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTargets = [...dropTargets];
      
      dropTargets.forEach((target, index) => {
        const ref = targetRefs[target.id];
        if (ref && ref.current) {
          ref.current.measure((x, y, width, height, pageX, pageY) => {
            newTargets[index] = {
              ...target,
              layout: {
                x: pageX,
                y: pageY,
                width,
                height
              }
            };
            
            if (index === dropTargets.length - 1) {
              setDropTargets(newTargets);
            }
          });
        }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (feedbackModal.visible) {
      const modalDuration = allCorrect ? 2000 : 1500;

      const timer = setTimeout(() => {
        setFeedbackModal({
          ...feedbackModal,
          visible: false
        });
      }, modalDuration);

      return () => clearTimeout(timer);
    }
  }, [feedbackModal.visible, allCorrect]);

  const checkAllCorrect = (updatedTargets) => {
    const isAllCorrect = updatedTargets.every(target => 
      target.isCorrect === true
    );
    
    if (isAllCorrect && !allCorrect) {
      setAllCorrect(true);
      setTimeout(() => {
        setFeedbackModal({
          visible: true,
          isCorrect: true,
          message: "Semua Benar!"
        });
      }, 300);
    }
  };

  const handleSuccessfulDrop = (itemId, targetId, setVisible, resetPosition) => {
    const item = draggableItems.find(item => item.id === itemId);
    const target = dropTargets.find(target => target.id === targetId);
    
    if (!item || !target) return;
    
    const isCorrect = item.letter === target.correctLetter;
    
    if (isCorrect) {
      const updatedTargets = dropTargets.map(t => 
        t.id === targetId 
          ? { 
              ...t, 
              occupied: true, 
              itemId: itemId,
              isCorrect: true
            } 
          : t
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
      resetPosition();
      
      setFeedbackModal({
        visible: true,
        isCorrect: false,
        message: ""
      });
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
      if (isLocked) {
        isVisible.value = 0;
      } else {
        isVisible.value = 1;
      }
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
        isDragging.value = false;
        scale.value = withTiming(1, { duration: 100 });
        
        let droppedOnTarget = false;
        let targetId = null;
        
        for (const target of dropTargets) {
          if (target.occupied || !target.layout) continue;
          
          const { x, y, width, height } = target.layout;
          
          if (
            event.absoluteX >= x && 
            event.absoluteX <= x + width && 
            event.absoluteY >= y && 
            event.absoluteY <= y + height
          ) {
            droppedOnTarget = true;
            targetId = target.id;
            break;
          }
        }
        
        if (droppedOnTarget && targetId) {
          runOnJS(handleSuccessfulDrop)(item.id, targetId, setItemVisible, resetItemPosition);
        } else {
          resetItemPosition();
        }
        
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
        <Animated.View 
          style={[styles.draggableItem, animatedStyle]}
        >
          <Image 
            source={item.uri}
            style={styles.aksaraImage}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    );
  };

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
          
          {allCorrect && feedbackModal.isCorrect && (
            <Text style={styles.modalMessageText}>Semua Benar!</Text>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} ref={containerRef}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Game</Text>
        </View>

        <Text style={styles.gameTitle}>Nan Maenan</Text>
        
        <Text style={styles.instructionText}>kagabay okara e baba reya</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>ACACA</Text>
        </View>

        <Text style={styles.dropTargetLabel}>Tarik aksara dan letakkan di kotak di bawah ini:</Text>

        <View style={styles.dropTargetRow}>
          {dropTargets.map(target => (
            <View 
              key={`target-${target.id}`}
              ref={targetRefs[target.id]}
              style={[
                styles.dropTarget,
                target.occupied && (target.isCorrect ? styles.correctTarget : styles.incorrectTarget)
              ]}
            >
              {target.occupied && target.itemId && target.isCorrect ? (
                <Image 
                  source={draggableItems.find(item => item.id === target.itemId)?.uri}
                  style={styles.targetAksaraImage}
                  resizeMode="contain"
                />
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

        <TouchableOpacity style={styles.homeButton}>
          <Text style={styles.homeButtonText}>utama</Text>
        </TouchableOpacity>
        
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
    justifyContent: 'space-around',
    width: '95%',
    marginBottom: 20
  },
  dropTarget: {
    width: 90,
    height: 90,
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
  aksaraImage: {
    width: 55,
    height: 55
  },
  targetAksaraImage: {
    width: 60,
    height: 60
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
    color: '#4CAF50',
    textAlign: 'center'
  }
});

export default DragDropGameScreen;