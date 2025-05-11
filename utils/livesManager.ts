// utils/livesManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface untuk data LivesInfo yang akan dikembalikan ke komponen
export interface LivesInfo {
  lives: number;
  maxLives: number;
  timeUntilNextLife: number;
  isInitialized: boolean;
}

// Interface untuk data yang disimpan di AsyncStorage
interface StoredLivesData {
  lives: number;
  lastUpdated: number;
}

// Konstanta
const LIVES_KEY = 'carakan_game_lives';
const MAX_LIVES = 5;
const LIVES_RECOVERY_TIME = 30 * 60 * 1000; // 30 menit dalam milidetik

// Kelas pengelola nyawa
class LivesManager {
  private lives: number;
  private lastUpdated: number;
  private isInitialized: boolean;

  constructor() {
    this.lives = MAX_LIVES;
    this.lastUpdated = Date.now();
    this.isInitialized = false;
  }

  // Inisialisasi nyawa dari storage
  public async initialize(): Promise<LivesInfo> {
    try {
      const livesData = await AsyncStorage.getItem(LIVES_KEY);
      
      if (livesData) {
        const parsedData: StoredLivesData = JSON.parse(livesData);
        this.lives = parsedData.lives;
        this.lastUpdated = parsedData.lastUpdated;
        
        // Periksa apakah nyawa harus dipulihkan berdasarkan waktu yang berlalu
        this.recoverLivesBasedOnTime();
      } else {
        // Pertama kali aplikasi dijalankan, atur nilai default
        await this.saveLivesToStorage();
      }
      
      this.isInitialized = true;
      return this.getLivesInfo();
    } catch (error) {
      console.error('Error initializing lives:', error);
      // Default fallback
      this.lives = MAX_LIVES;
      this.lastUpdated = Date.now();
      this.isInitialized = true;
      return this.getLivesInfo();
    }
  }

  // Simpan status nyawa saat ini ke storage
  private async saveLivesToStorage(): Promise<void> {
    try {
      const livesData: StoredLivesData = {
        lives: this.lives,
        lastUpdated: this.lastUpdated
      };
      await AsyncStorage.setItem(LIVES_KEY, JSON.stringify(livesData));
    } catch (error) {
      console.error('Error saving lives to storage:', error);
    }
  }

  // Hitung dan pulihkan nyawa berdasarkan waktu yang berlalu
  private recoverLivesBasedOnTime(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastUpdated;
    
    if (elapsedTime > 0 && this.lives < MAX_LIVES) {
      // Hitung berapa banyak nyawa yang harus dipulihkan berdasarkan waktu
      const livesToRecover = Math.floor(elapsedTime / LIVES_RECOVERY_TIME);
      
      if (livesToRecover > 0) {
        this.lives = Math.min(MAX_LIVES, this.lives + livesToRecover);
        
        // Perbarui waktu terakhir diperbarui berdasarkan nyawa yang dipulihkan
        this.lastUpdated = this.lastUpdated + (livesToRecover * LIVES_RECOVERY_TIME);
        
        // Jika waktu yang berlalu lebih dari yang diperlukan untuk pemulihan penuh
        if (this.lives === MAX_LIVES) {
          this.lastUpdated = now;
        }
        
        this.saveLivesToStorage();
      }
    }
  }

  // Dapatkan nyawa saat ini dan waktu hingga pemulihan berikutnya
  public getLivesInfo(): LivesInfo {
    const now = Date.now();
    let timeUntilNextLife = 0;
    
    if (this.lives < MAX_LIVES) {
      timeUntilNextLife = (this.lastUpdated + LIVES_RECOVERY_TIME) - now;
      timeUntilNextLife = Math.max(0, timeUntilNextLife);
    }
    
    return {
      lives: this.lives,
      maxLives: MAX_LIVES,
      timeUntilNextLife,
      isInitialized: this.isInitialized
    };
  }

  // Gunakan nyawa untuk bermain game
  public async useLife(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Pertama periksa apakah kita harus memulihkan nyawa
    this.recoverLivesBasedOnTime();
    
    if (this.lives > 0) {
      this.lives -= 1;
      this.lastUpdated = Date.now();
      await this.saveLivesToStorage();
      return true; // Berhasil menggunakan nyawa
    }
    
    return false; // Tidak ada nyawa yang tersedia
  }

  // Tambahkan nyawa (dapat digunakan untuk hadiah atau pembelian)
  public async addLife(): Promise<LivesInfo> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Pertama periksa apakah kita harus memulihkan nyawa
    this.recoverLivesBasedOnTime();
    
    if (this.lives < MAX_LIVES) {
      this.lives += 1;
      await this.saveLivesToStorage();
    }
    
    return this.getLivesInfo();
  }

  // Reset nyawa ke maksimum (dapat digunakan untuk pengujian atau reset aplikasi)
  public async resetLives(): Promise<LivesInfo> {
    this.lives = MAX_LIVES;
    this.lastUpdated = Date.now();
    await this.saveLivesToStorage();
    return this.getLivesInfo();
  }

  // Format waktu tersisa sampai pemulihan nyawa berikutnya
  public formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return '0:00';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Buat singleton instance dari LivesManager
const livesManager = new LivesManager();

export default livesManager;