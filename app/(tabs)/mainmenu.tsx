import { auth } from "../../utils/firebase/config";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions } from "react-native";

type StreakData = {
  streak: number;
  lastLogin: string;
  isStreakActive: boolean;
  lastMaterialAccess?: string;
  materialTimeSpent?: number;
};

const MainMenu = () => {
  const router = useRouter();
  const [streakCount, setStreakCount] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [isStreakActive, setIsStreakActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerImages = [
    require("../../assets/images/tampilan/mainmenu.png"),
    require("../../assets/images/tampilan/mainmenu2.png"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000); // auto scroll setiap 3 detik

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.scrollTo({
        x: bannerIndex * 400,
        animated: true,
      });
    }
  }, [bannerIndex]);

  useFocusEffect(
    React.useCallback(() => {
      checkMaterialTime();
    }, [])
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace("/");
          return;
        }

        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          const emailPrefix = user.email ? user.email.split("@")[0] : "Siswa";
          setUserName(emailPrefix);
        }

        await checkAndUpdateStreak();
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const checkMaterialTime = async () => {
    try {
      const startTimeString = await AsyncStorage.getItem("materiStartTime");
      if (startTimeString) {
        const startTime = new Date(startTimeString).getTime();
        const endTime = new Date().getTime();
        const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);

        // Save the time spent
        const today = new Date().toDateString();
        const storedStreakData = await AsyncStorage.getItem("userStreakData");

        if (storedStreakData) {
          const parsedData = JSON.parse(storedStreakData) as StreakData;

          // Update material time spent for today
          const updatedData: StreakData = {
            ...parsedData,
            lastMaterialAccess: new Date().toISOString(),
            materialTimeSpent: timeSpentSeconds,
          };

          if (timeSpentSeconds >= 60) {
            updatedData.isStreakActive = true;
            setIsStreakActive(true);
          }

          await AsyncStorage.setItem(
            "userStreakData",
            JSON.stringify(updatedData)
          );
        }

        await AsyncStorage.removeItem("materiStartTime");

        await checkAndUpdateStreak();
      }
    } catch (error) {
      console.error("Error checking material time:", error);
    }
  };

  const checkAndUpdateStreak = async (): Promise<void> => {
    try {
      const storedStreakData = await AsyncStorage.getItem("userStreakData");
      const today = new Date().toDateString();

      if (storedStreakData) {
        const parsedData = JSON.parse(storedStreakData) as StreakData;
        const {
          streak,
          lastLogin,
          isStreakActive: storedStreakActive,
          lastMaterialAccess,
          materialTimeSpent,
        } = parsedData;

        setStreakCount(streak);
        setLastLoginDate(lastLogin);

        const lastLoginDate = new Date(lastLogin).toDateString();

        if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();

          if (lastLoginDate === yesterdayString) {
            const newStreak = streak + 1;
            setStreakCount(newStreak);
            setIsStreakActive(false);
            await saveStreakData(newStreak, today, false);
          } else {
            setStreakCount(1);
            setIsStreakActive(false);
            await saveStreakData(1, today, false);
          }
        } else {
          if (lastMaterialAccess && materialTimeSpent !== undefined) {
            const materialAccessDate = new Date(
              lastMaterialAccess
            ).toDateString();

            if (materialAccessDate === today && materialTimeSpent >= 60) {
              setIsStreakActive(true);
              await saveStreakData(
                streak,
                today,
                true,
                lastMaterialAccess,
                materialTimeSpent
              );
            } else {
              setIsStreakActive(storedStreakActive || false);
            }
          } else {
            setIsStreakActive(storedStreakActive || false);
          }
        }
      } else {
        setStreakCount(1);
        setIsStreakActive(false);
        await saveStreakData(1, today, false);
      }
    } catch (error) {
      console.error("Error checking streak:", error);
    }
  };

  const saveStreakData = async (
    streak: number,
    date: string,
    isActive: boolean,
    lastMaterialAccess?: string,
    materialTimeSpent?: number
  ): Promise<void> => {
    try {
      const streakData: StreakData = {
        streak,
        lastLogin: date,
        isStreakActive: isActive,
        lastMaterialAccess,
        materialTimeSpent,
      };
      await AsyncStorage.setItem("userStreakData", JSON.stringify(streakData));
    } catch (error) {
      console.error("Error saving streak data:", error);
    }
  };

  const handleMateriNavigation = () => {
    AsyncStorage.setItem("materiStartTime", new Date().toISOString());
    router.push("/materi");
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.integratedHeader}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <View style={styles.headerLeft}>
              <Text style={styles.greetingText}>Halo, {userName}!</Text>
            </View>
            <View style={styles.rightSection}>
              <View style={styles.streakBadge}>
                <Text style={styles.streakNumber}>{streakCount}</Text>
                <Image
                  style={styles.streakIcon}
                  source={
                    isStreakActive
                      ? require("../../assets/images/tampilan/icon/fire-on.png")
                      : require("../../assets/images/tampilan/icon/fire-off.png")
                  }
                />
              </View>
              <View style={styles.profileIconContainer}>
                <Image
                  source={require("../../assets/images/tampilan/icon/user.png")}
                  style={{ width: 25, height: 25 }}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bulbIconContainer}
            onPress={toggleModal}
          >
            <Image
              source={require("../../assets/images/tampilan/icon/bulb.png")}
              style={styles.bulbIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.bannerScroll}
            contentContainerStyle={styles.bannerContent}
          >
            {bannerImages.map((img, idx) => (
              <Image key={idx} source={img} style={styles.titleImage} />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.materiCard}
          onPress={handleMateriNavigation}
        >
          <View style={styles.materiContent}>
            <View>
              <Text style={styles.materiTitle}>Materi</Text>
              <Text style={styles.materiSubtitle}>Kompolan Carakan</Text>
              <Text style={styles.materiSubtitle}>Kalaban Sowara</Text>
            </View>
            <Image
              source={require("../../assets/images/tampilan/icon/materi.png")}
              style={styles.materiIcon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.gridButton, styles.purpleButton]}
              onPress={() => router.push("/kuis")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/images/tampilan/icon/brain.png")}
                  style={styles.iconKuis}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.buttonText}>Kuis</Text>
                  
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gridButton, styles.purpleButton]}
              onPress={() => router.push("/gameA")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/images/tampilan/icon/connect.png")}
                  style={styles.iconKuis}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.buttonText}>Mapadha</Text>
                  
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.gridButton, styles.purpleButton]}
              onPress={() => router.push("/gameB")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/images/tampilan/icon/choices.png")}
                  style={styles.iconKuis}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.buttonText}>Malengkap</Text>
                  
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gridButton, styles.purpleButton]}
              onPress={() => router.push("/gameC")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/images/tampilan/icon/puzzle.png")}
                  style={styles.iconKuis}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.buttonText}>Nyoson</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={isModalVisible}
          animationType="fade"
          transparent
          onRequestClose={toggleModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tips Menjaga Streak</Text>
              <Text style={styles.modalText}>
                Streak reya bukte kabenjenganna ba'na, edhimma jareya ba'na bisa
                magi otaba aberri' ka ca-kancana
              </Text>
              <Text style={styles.modalText}>
                Streak bakal odhi' kalamon ba'na mokka' ban agunaagi materi
                saabidda 1 mennet{" "}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
                <Text style={styles.closeButtonText}>Mayu Ajar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 20,
  },
  integratedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFE4B5",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFA500",
    flex: 1,
    marginTop: 20,
  },
  bulbIconContainer: {
    marginLeft: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FFD580",
    marginTop: 20,
  },
  bulbIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 10,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD580",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    marginRight: 5,
  },
  streakIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  profileIconContainer: {
    padding: 5,
  },
  bannerScroll: {
    width: width - 40,
    alignSelf: "center",
  },
  bannerContent: {
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  titleImage: {
    width: width - 40,
    height: 240,
    borderWidth: 4,
    borderColor: "black",
    borderRadius: 20,
    resizeMode: "cover",
  },
  materiCard: {
    backgroundColor: "#F7DA30",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: "#000000",
  },
  materiTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  materiSubtitle: {
    fontSize: 16,
    color: "#000000",
  },
  materiContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  materiIcon: {
    width: 200,
    height: 90,
    marginRight: -40,
  },

  gridContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridButton: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  purpleButton: {
    backgroundColor: "#7E80D8",
    borderWidth: 2,
    borderColor: "#000000",
  },
  iconKuis: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    left: 5,
    marginRight: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    borderColor: "#C5172E",
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FFD580",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainMenu;
