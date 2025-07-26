import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";

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
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | null;
  }>({});

  const [exitModalVisible, setExitModalVisible] = useState(false);

  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);

  const questions: Question[] = [
    {
      id: 1,
      carakanText: "ꦲꦫꦥ",
      answers: [
        { id: 1, text: "Pamacana" },
        { id: 2, text: "Apana" },
        { id: 3, text: "Arapa" },
        { id: 4, text: "Anapa" },
      ],
      correctAnswerId: 3,
    },
    {
      id: 2,
      carakanText: "ꦥꦩꦕꦤ",
      answers: [
        { id: 1, text: "Arapa" },
        { id: 2, text: "Calana" },
        { id: 3, text: "Pamacana" },
        { id: 4, text: "Nagara" },
      ],
      correctAnswerId: 3,
    },
    {
      id: 3,
      carakanText: "ꦚꦩꦤ",
      answers: [
        { id: 1, text: "Nyamana" },
        { id: 2, text: "Sapana" },
        { id: 3, text: "Nagara" },
        { id: 4, text: "Pamacana" },
      ],
      correctAnswerId: 1,
    },
    {
      id: 4,
      carakanText: "ꦱꦥꦤ",
      answers: [
        { id: 1, text: "Arapa" },
        { id: 2, text: "Sapana" },
        { id: 3, text: "Pamacana" },
        { id: 4, text: "Nyamana" },
      ],
      correctAnswerId: 2,
    },
    {
      id: 5,
      carakanText: "ꦲꦤꦥ",
      answers: [
        { id: 1, text: "Anapa" },
        { id: 2, text: "Arapa" },
        { id: 3, text: "Atapa" },
        { id: 4, text: "Apasa" },
      ],
      correctAnswerId: 1,
    },
    {
      id: 6,
      carakanText: "ꦱꦺꦴꦏꦺꦴꦤ",
      answers: [
        { id: 1, text: "Contona" },
        { id: 2, text: "Sokona" },
        { id: 3, text: "Gulana" },
        { id: 4, text: "Ropana" },
      ],
      correctAnswerId: 2,
    },
    {
      id: 7,
      carakanText: "ꦏꦺꦴꦏꦺꦴꦤ",
      answers: [
        { id: 1, text: "Sokona" },
        { id: 2, text: "Kokona" },
        { id: 3, text: "Gulana" },
        { id: 4, text: "Contona" },
      ],
      correctAnswerId: 2,
    },
    {
      id: 8,
      carakanText: "ꦱꦭꦗ",
      answers: [
        { id: 1, text: "Jakaja" },
        { id: 2, text: "Apana" },
        { id: 3, text: "Salaja" },
        { id: 4, text: "Sangaja" },
      ],
      correctAnswerId: 3,
    },
    {
      id: 9,
      carakanText: "ꦲꦱꦏꦺꦴꦭ",
      answers: [
        { id: 1, text: "Akaca" },
        { id: 2, text: "Sakola" },
        { id: 3, text: "Pokola" },
        { id: 4, text: "Asakola" },
      ],
      correctAnswerId: 4,
    },
    {
      id: 10,
      carakanText: "ꦲꦏꦕ",
      answers: [
        { id: 1, text: "Akaca" },
        { id: 2, text: "Saga" },
        { id: 3, text: "Sango" },
        { id: 4, text: "Pana" },
      ],
      correctAnswerId: 1,
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
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
    let answeredCount = 0;

    questions.forEach((question) => {
      const answer = selectedAnswers[question.id];
      if (answer !== undefined) {
        answeredCount += 1;
        if (answer === question.correctAnswerId) {
          totalScore += 1;
        }
      }
    });

    setScore(totalScore);
    setQuizCompleted(true);
    // bisa juga set totalAnswered(answeredCount) kalau mau ditampilkan
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  // Fungsi untuk kembali ke menu utama
  const goToMainMenu = () => {
    router.push("/mainmenu");
  };

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (!quizCompleted) {
          setExitModalVisible(true);
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [quizCompleted])
  );

  const allQuestionsAnswered = () => {
    return questions.every(
      (question) => selectedAnswers[question.id] !== undefined
    );
  };

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Carakan</Text>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Hasel Kuis</Text>
          <Text style={styles.scoreText}>
            Skor Anda: {score} dari {questions.length}
          </Text>

          <View style={styles.questionSummary}>
            {questions.map((question, index) => (
              <View key={question.id} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  Soal {index + 1}:{" "}
                  {selectedAnswers[question.id] === question.correctAnswerId
                    ? "✓"
                    : "✗"}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Text style={styles.restartButtonText}>Molai Pole</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainMenuButton}
            onPress={goToMainMenu}
          >
            <Text style={styles.mainMenuButtonText}>Abali ka Menu Utama</Text>
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
              {
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.carakanContainer}>
        <Text style={styles.carakanText}>{currentQuestion.carakanText}</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <Image
          source={require("../../assets/images/tampilan/AstronoutQuis.png")}
          style={styles.questionImage}
          resizeMode="contain"
        />
        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer) => (
            <TouchableOpacity
              key={answer.id}
              style={[
                styles.answerButton,
                getCurrentSelectedAnswer() === answer.id &&
                  styles.selectedAnswerButton,
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
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Sabelumma</Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !allQuestionsAnswered() && styles.disabledButton,
            ]}
            onPress={calculateScore}
            disabled={!allQuestionsAnswered()}
          >
            <Text style={styles.submitButtonText}>Mare</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Sateroorssa</Text>
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
              selectedAnswers[question.id] !== undefined && styles.answeredDot,
            ]}
          />
        ))}
      </View>
      {exitModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Keluar dari Kuis?</Text>
              <Text style={styles.modalMessage}>
                Jawaban yang sudah kamu isi akan langsung dinilai.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setExitModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={() => {
                    setExitModalVisible(false);
                    calculateScore();
                  }}
                >
                  <Text style={styles.modalConfirmText}>
                    Ya, Nilai Sekarang
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: "#F7DA30",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B4D89",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  progressText: {
    fontSize: 14,
    color: "#1B4D89",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4D5BD1",
    borderRadius: 4,
  },
  carakanContainer: {
    marginTop: 20,
    backgroundColor: "#7E80D8",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: "center",
  },
  carakanText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  questionImage: {
    alignSelf: "center",
    width: "100%",
    height: 150,
    marginVertical: 16,
  },
  answersContainer: {
    gap: 12,
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: "#7E80D8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedAnswerButton: {
    backgroundColor: "#4D5BD1",
    borderColor: "#1E3A8A",
    borderWidth: 3,
    shadowColor: "#1E3A8A",
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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  navButton: {
    backgroundColor: "#4D5BD1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
    borderWidth: 1,
    borderColor: "#1E3A8A",
  },
  navButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "48%",
    borderWidth: 2,
    borderColor: "#4D5BD1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    borderWidth: 1,
    borderColor: "#AAAAAA",
  },
  activeDot: {
    backgroundColor: "#4D5BD1",
    borderColor: "#1E3A8A",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  answeredDot: {
    backgroundColor: "#A3AED0",
    borderColor: "#7E80D8",
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4D89",
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 20,
    marginBottom: 24,
    color: "#1B4D89",
  },
  questionSummary: {
    width: "100%",
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  summaryText: {
    fontSize: 16,
  },
  restartButton: {
    backgroundColor: "#F7DA30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B4D89",
    marginTop: 16,
    width: "80%",
  },
  restartButtonText: {
    color: "#1B4D89",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Tambahkan style untuk tombol menu utama
  mainMenuButton: {
    backgroundColor: "#7E80D8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B4D89",
    marginTop: 16,
    width: "80%",
  },
  mainMenuButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    borderColor: "#DC3C22",
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1B4D89",
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#DC3C22",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#4D5BD1",
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default QuizScreen;
