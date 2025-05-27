import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import livesManager, { LivesInfo } from "../utils/livesManager";

interface LivesDisplayProps {
  onLivesUpdated?: (info: LivesInfo) => void;
  livesInfo?: LivesInfo;
}

const LivesDisplay = ({
  onLivesUpdated,
  livesInfo: propLivesInfo,
}: LivesDisplayProps) => {
  const [internalLivesInfo, setInternalLivesInfo] = useState<LivesInfo>({
    lives: 0,
    maxLives: 5,
    timeUntilNextLife: 0,
    isInitialized: false,
  });

  const [timeString, setTimeString] = useState("");
  const livesInfo = propLivesInfo ?? internalLivesInfo;

  useEffect(() => {
    let isMounted = true;

    if (!propLivesInfo) {
      const initializeLives = async () => {
        try {
          const info = await livesManager.initialize();

          if (isMounted) {
            setInternalLivesInfo(info);
            if (onLivesUpdated) {
              onLivesUpdated(info);
            }
          }
        } catch (error) {
          console.error("Error initializing lives:", error);
        }
      };

      initializeLives();
    }

    return () => {
      isMounted = false;
    };
  }, [propLivesInfo]);

  useEffect(() => {
    if (propLivesInfo) {
      setInternalLivesInfo(propLivesInfo);
    }
  }, [propLivesInfo]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (livesInfo.isInitialized && livesInfo.lives < livesInfo.maxLives) {
      interval = setInterval(async () => {
        try {
          if (!propLivesInfo) {
            const updatedInfo = await livesManager.getLivesInfo();
            setInternalLivesInfo(updatedInfo);

            if (updatedInfo.timeUntilNextLife > 0) {
              const minutes = Math.floor(updatedInfo.timeUntilNextLife / 60000);
              const seconds = Math.ceil(
                (updatedInfo.timeUntilNextLife % 60000) / 1000
              );
              setTimeString(
                `${minutes}:${seconds.toString().padStart(2, "0")}`
              );
            } else {
              setTimeString("");
              const refreshedInfo = await livesManager.initialize();
              setInternalLivesInfo(refreshedInfo);
              if (onLivesUpdated) {
                onLivesUpdated(refreshedInfo);
              }
            }
          } else {
            if (livesInfo.timeUntilNextLife > 0) {
              const minutes = Math.floor(livesInfo.timeUntilNextLife / 60000);
              const seconds = Math.ceil(
                (livesInfo.timeUntilNextLife % 60000) / 1000
              );
              setTimeString(
                `${minutes}:${seconds.toString().padStart(2, "0")}`
              );
            } else {
              setTimeString("");
            }
          }
        } catch (error) {
          console.error("Error updating lives timer:", error);
        }
      }, 1000);
    } else {
      setTimeString("");
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    livesInfo.isInitialized,
    livesInfo.lives,
    livesInfo.maxLives,
    livesInfo.timeUntilNextLife,
    propLivesInfo,
  ]);

  const renderHearts = () => {
    const hearts = [];

    for (let i = 0; i < livesInfo.maxLives; i++) {
      const isFilled = i < livesInfo.lives;

      hearts.push(
        <View key={`heart-${i}`} style={styles.heartContainer}>
          <Image
            source={
              isFilled
                ? require("../assets/images/tampilan/icon/heart-filled.png")
                : require("../assets/images/tampilan/icon/heart-empty.png")
            }
            style={styles.heartIcon}
            resizeMode="contain"
          />
        </View>
      );
    }

    return hearts;
  };

  return (
    <View style={styles.container}>
      <View style={styles.heartsRow}>{renderHearts()}</View>
      {timeString !== "" && livesInfo.lives < livesInfo.maxLives && (
        <Text style={styles.timerText}>
          Nyawa berikutnya dalam: {timeString}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  heartsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  heartContainer: {
    marginHorizontal: 5,
  },
  heartIcon: {
    width: 25,
    height: 25,
  },
  timerText: {
    marginTop: 4,
    fontSize: 12,
    color: "#1B4D89",
    fontWeight: "bold",
  },
});

export default LivesDisplay;
