// // utils/streak.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type StreakData = {
//   currentStreak: number;
//   lastLoginDate: string;
//   highestStreak: number;
//   totalLogins: number;
// };

// // Mendapatkan data streak
// export const getStreak = async (): Promise<StreakData | null> => {
//   try {
//     const streakJSON = await AsyncStorage.getItem('userStreak');
//     if (streakJSON) {
//       return JSON.parse(streakJSON) as StreakData;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error getting streak:', error);
//     return null;
//   }
// };

// // Inisialisasi streak
// export const initializeStreak = async (): Promise<void> => {
//   try {
//     const initialStreak: StreakData = {
//       currentStreak: 1,
//       lastLoginDate: new Date().toISOString(),
//       highestStreak: 1,
//       totalLogins: 1
//     };
    
//     await AsyncStorage.setItem('userStreak', JSON.stringify(initialStreak));
//     console.log('Streak initialized');
//   } catch (error) {
//     console.error('Error initializing streak:', error);
//   }
// };

// // Update streak saat login
// export const updateStreak = async (): Promise<number> => {
//   try {
//     const streakData = await getStreak();
    
//     if (streakData) {
//       const lastLoginDate = new Date(streakData.lastLoginDate);
//       const currentDate = new Date();
      
//       // Reset waktu ke tengah malam untuk perbandingan harian
//       const lastLoginDay = new Date(lastLoginDate.setHours(0, 0, 0, 0));
//       const currentDay = new Date(currentDate.setHours(0, 0, 0, 0));
      
//       const timeDiff = currentDay.getTime() - lastLoginDay.getTime();
//       const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
//       let newStreakData: StreakData = {
//         ...streakData,
//         lastLoginDate: currentDate.toISOString(),
//         totalLogins: streakData.totalLogins + 1
//       };
      
//       if (dayDiff === 0) {
//         await AsyncStorage.setItem('userStreak', JSON.stringify(newStreakData));
//         return newStreakData.currentStreak;
//       }
//       else if (dayDiff === 1) {
//         const newStreak = streakData.currentStreak + 1;
//         newStreakData.currentStreak = newStreak;
        
//         if (newStreak > streakData.highestStreak) {
//           newStreakData.highestStreak = newStreak;
//         }
//       } 
//       else {
//         newStreakData.currentStreak = 1;
//       }
      
//       await AsyncStorage.setItem('userStreak', JSON.stringify(newStreakData));
//       return newStreakData.currentStreak;
//     } else {
//       await initializeStreak();
//       return 1;
//     }
//   } catch (error) {
//     console.error('Error updating streak:', error);
//     return 0;
//   }
// };