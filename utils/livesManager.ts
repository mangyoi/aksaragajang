import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LivesInfo {
  lives: number;
  maxLives: number;
  timeUntilNextLife: number;
  isInitialized: boolean;
}

interface StoredLivesData {
  lives: number;
  lastUpdated: number;
}

const LIVES_KEY = 'carakan_game_lives';
const MAX_LIVES = 5;
const LIVES_RECOVERY_TIME = 1 * 60 * 1000;

class LivesManager {
  private lives: number;
  private lastUpdated: number;
  private isInitialized: boolean;

  constructor() {
    this.lives = MAX_LIVES;
    this.lastUpdated = Date.now();
    this.isInitialized = false;
  }

  public async initialize(): Promise<LivesInfo> {
    try {
      const livesData = await AsyncStorage.getItem(LIVES_KEY);
      
      if (livesData) {
        const parsedData: StoredLivesData = JSON.parse(livesData);
        this.lives = parsedData.lives;
        this.lastUpdated = parsedData.lastUpdated;
        this.recoverLivesBasedOnTime();
      } else {
        await this.saveLivesToStorage();
      }
      
      this.isInitialized = true;
      return this.getLivesInfo();
    } catch (error) {
      console.error('Error initializing lives:', error);
      this.lives = MAX_LIVES;
      this.lastUpdated = Date.now();
      this.isInitialized = true;
      return this.getLivesInfo();
    }
  }

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

  private recoverLivesBasedOnTime(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastUpdated;
    
    if (elapsedTime > 0 && this.lives < MAX_LIVES) {
      const livesToRecover = Math.floor(elapsedTime / LIVES_RECOVERY_TIME);
      
      if (livesToRecover > 0) {
        this.lives = Math.min(MAX_LIVES, this.lives + livesToRecover);
        this.lastUpdated = this.lastUpdated + (livesToRecover * LIVES_RECOVERY_TIME);
        
        if (this.lives === MAX_LIVES) {
          this.lastUpdated = now;
        }
        
        this.saveLivesToStorage();
      }
    }
  }

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

  public async useLife(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.recoverLivesBasedOnTime();
    
    if (this.lives > 0) {
      this.lives -= 1;
      this.lastUpdated = Date.now();
      await this.saveLivesToStorage();
      return true;
    }
    
    return false;
  }

  public async addLife(): Promise<LivesInfo> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.recoverLivesBasedOnTime();
    
    if (this.lives < MAX_LIVES) {
      this.lives += 1;
      await this.saveLivesToStorage();
    }
    
    return this.getLivesInfo();
  }

  public async resetLives(): Promise<LivesInfo> {
    this.lives = MAX_LIVES;
    this.lastUpdated = Date.now();
    await this.saveLivesToStorage();
    return this.getLivesInfo();
  }

  public formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return '0:00';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

const livesManager = new LivesManager();

export default livesManager;
