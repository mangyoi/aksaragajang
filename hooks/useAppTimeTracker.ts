// hooks/useAppTimeTracker.ts
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

interface TimeData {
  totalTimeSpent: number;
  lastSessionStart: string | null;
}

export const useAppTimeTracker = () => {
  const appState = useRef(AppState.currentState);
  const sessionStartTime = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    const startTracking = async () => {
      sessionStartTime.current = new Date();
      const existing = await getTimeData();
      await saveTimeData({
        ...existing,
        lastSessionStart: sessionStartTime.current.toISOString(),
      });

      intervalRef.current = setInterval(() => {
        updateLiveTime();
      }, 1000);
    };

    const stopTracking = async () => {
      if (sessionStartTime.current) {
        const now = new Date();
        const duration = Math.floor((now.getTime() - sessionStartTime.current.getTime()) / 1000);
        const existing = await getTimeData();
        await saveTimeData({
          totalTimeSpent: existing.totalTimeSpent + duration,
          lastSessionStart: null,
        });
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const updateLiveTime = async () => {
      const now = new Date();
      const existing = await getTimeData();
      if (sessionStartTime.current) {
        const duration = Math.floor((now.getTime() - sessionStartTime.current.getTime()) / 1000);
        await saveTimeData({
          ...existing,
          totalTimeSpent: existing.totalTimeSpent + duration,
          lastSessionStart: sessionStartTime.current.toISOString(),
        });
        sessionStartTime.current = now; // refresh
      }
    };

    startTracking();

    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        await stopTracking();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        await startTracking();
      }
      appState.current = nextAppState;
    });

    return () => {
      stopTracking();
      subscription.remove();
    };
  }, []);
};

const getTimeData = async (): Promise<TimeData> => {
  try {
    const stored = await AsyncStorage.getItem('appTimeData');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { totalTimeSpent: 0, lastSessionStart: null };
};

const saveTimeData = async (data: TimeData) => {
  try {
    await AsyncStorage.setItem('appTimeData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving time data:', error);
  }
};
