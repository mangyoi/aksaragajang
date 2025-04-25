import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Image, ScrollView } from 'react-native';

interface Answer {
  id: number;
  text: string;
}

interface Question {
  id: number;
  carakanText: string;
  answers: Answer[];
  correctAnswerId: number;
}

const QuizScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number | null}>({});
  
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  
  const [score, setScore] = useState<number>(0);

  const questions: Question[] = [
    {
      id: 1,
      carakanText: 'ᮊᮞᮞᮔ᭄',
      answers: [
        { id: 1, text: 'Pamacana' },
        { id: 2, text: 'Apana' },
        { id: 3, text: 'Kasana' },
        { id: 4, text: 'Kulana' }
      ],
      correctAnswerId: 3
    },
    {
      id: 2,
      carakanText: 'ᮋᮒᮔ᭄',
      answers: [
        { id: 1, text: 'Katama' },
        { id: 2, text: 'Kelana' },
        { id: 3, text: 'Katana' },
        { id: 4, text: 'Ketana' }
      ],
      correctAnswerId: 3
    },
    {
      id: 3,
      carakanText: 'ᮌᮂᮔ᭄',
      answers: [
        { id: 1, text: 'Gana' },
        { id: 2, text: 'Gahana' },
        { id: 3, text: 'Guna' },
        { id: 4, text: 'Gona' }
      ],
      correctAnswerId: 1
    },
    {
      id: 4,
      carakanText: 'ᮍᮒᮕ᭄',
      answers: [
        { id: 1, text: 'Natipa' },
        { id: 2, text: 'Ngatap' },
        { id: 3, text: 'Ngatep' },
        { id: 4, text: 'Ngutap' }
      ],
      correctAnswerId: 2
    },
    {
      id: 5,
      carakanText: 'ᮎᮎᮁ',
      answers: [
        { id: 1, text: 'Cacar' },
        { id: 2, text: 'Cacah' },
        { id: 3, text: 'Carah' },
        { id: 4, text: 'Calak' }
      ],
      correctAnswerId: 1
    },
    {
      id: 6,
      carakanText: 'ᮏᮔ᭄ᮒᮁ',
      answers: [
        { id: 1, text: 'Jambar' },
        { id: 2, text: 'Jantar' },
        { id: 3, text: 'Jantur' },
        { id: 4, text: 'Jatkar' }
      ],
      correctAnswerId: 2
    },
    {
      id: 7,
      carakanText: 'ᮑᮕ',
      answers: [
        { id: 1, text: 'Naya' },
        { id: 2, text: 'Nyapa' },
        { id: 3, text: 'Nyepa' },
        { id: 4, text: 'Nyata' }
      ],
      correctAnswerId: 2
    },
    {
      id: 8,
      carakanText: 'ᮓᮕ᭄ᮒᮁ',
      answers: [
        { id: 1, text: 'Daftar' },
        { id: 2, text: 'Daltar' },
        { id: 3, text: 'Daptar' },
        { id: 4, text: 'Dartar' }
      ],
      correctAnswerId: 3
    },
    {
      id: 9,
      carakanText: 'ᮗᮥᮂ',
      answers: [
        { id: 1, text: 'Wanga' },
        { id: 2, text: 'Waha' },
        { id: 3, text: 'Wuga' },
        { id: 4, text: 'Wuha' }
      ],
      correctAnswerId: 4
    },
    {
      id: 10,
      carakanText: 'ᮞᮍᮥ',
      answers: [
        { id: 1, text: 'Sangu' },
        { id: 2, text: 'Sanga' },
        { id: 3, text: 'Sango' },
        { id: 4, text: 'Sengu' }
      ],
      correctAnswerId: 1
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const getCurrentSelectedAnswer = () => {
    return selectedAnswers[currentQuestion.id] || null;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswerId) {
        totalScore += 1;
      }
    });
    
    setScore(totalScore);
    setQuizCompleted(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  const allQuestionsAnswered = () => {
    return questions.every(question => selectedAnswers[question.id] !== undefined);
  };

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Carakan</Text>
        </View>
        
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Hasil Kuis</Text>
          <Text style={styles.scoreText}>Skor Anda: {score} dari {questions.length}</Text>
          
          <View style={styles.questionSummary}>
            {questions.map((question, index) => (
              <View key={question.id} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  Soal {index + 1}: {selectedAnswers[question.id] === question.correctAnswerId ? 
                    '✓' : '✗'}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={restartQuiz}
          >
            <Text style={styles.restartButtonText}>Mulai Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Carakan</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Soal {currentQuestionIndex + 1} dari {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.carakanContainer}>
        <Text style={styles.carakanText}>{currentQuestion.carakanText}</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <Image 
          source={require('../../assets/images/tampilan/AstronoutQuis.png')} 
          style={styles.questionImage} 
          resizeMode="contain"
        />
        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer) => (
            <TouchableOpacity
              key={answer.id}
              style={[
                styles.answerButton,
                getCurrentSelectedAnswer() === answer.id && styles.selectedAnswerButton
              ]}
              onPress={() => handleAnswerSelect(currentQuestion.id, answer.id)}
            >
              <Text style={styles.answerButtonText}>{answer.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Sebelumnya</Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity 
            style={[styles.submitButton, !allQuestionsAnswered() && styles.disabledButton]}
            onPress={calculateScore}
            disabled={!allQuestionsAnswered()}
          >
            <Text style={styles.submitButtonText}>Selesai</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Selanjutnya</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dotsContainer}>
        {questions.map((question, index) => (
          <TouchableOpacity
            key={question.id}
            onPress={() => setCurrentQuestionIndex(index)}
            style={[
              styles.dot,
              currentQuestionIndex === index && styles.activeDot,
              selectedAnswers[question.id] !== undefined && styles.answeredDot
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0'
  },
  progressText: {
    fontSize: 14,
    color: '#1B4D89',
    marginBottom: 4
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4D5BD1',
    borderRadius: 4
  },
  carakanContainer: {
    marginTop: 20,
    backgroundColor: '#7E80D8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: 'center'
  },
  carakanText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  questionImage: {
    alignSelf: 'center',
    width: '100%',
    height: 150,
    marginVertical: 16
  },
  answersContainer: {
    gap: 12,
    marginBottom: 20
  },
  answerButton: {
    backgroundColor: '#7E80D8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedAnswerButton: {
    backgroundColor: '#4D5BD1',
    borderColor: '#1E3A8A',
    borderWidth: 3,
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  answerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8
  },
  navButton: {
    backgroundColor: '#4D5BD1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#4D5BD1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  activeDot: {
    backgroundColor: '#4D5BD1',
    borderColor: '#1E3A8A',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  answeredDot: {
    backgroundColor: '#A3AED0',
    borderColor: '#7E80D8',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D89',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 20,
    marginBottom: 24,
    color: '#1B4D89',
  },
  questionSummary: {
    width: '100%',
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryText: {
    fontSize: 16,
  },
  restartButton: {
    backgroundColor: '#F7DA30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1B4D89',
    marginTop: 16,
  },
  restartButtonText: {
    color: '#1B4D89',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default QuizScreen;