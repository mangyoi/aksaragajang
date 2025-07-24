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

const MAX_LIVES = 5;
const LIVES_RECOVERY_TIME = 1 * 60 * 1000;

class LivesManager {
  private managers: { [key: string]: GameLivesManager } = {};

  getManager(gameKey: string): GameLivesManager {
    if (!this.managers[gameKey]) {
      this.managers[gameKey] = new GameLivesManager(gameKey);
    }
    return this.managers[gameKey];
  }
}

class GameLivesManager {
  private gameKey: string;
  private lives: number = MAX_LIVES;
  private lastUpdated: number = Date.now();
  private isInitialized: boolean = false;

  constructor(gameKey: string) {
    this.gameKey = gameKey;
  }

  private getStorageKey(): string {
    return `carakan_lives_${this.gameKey}`;
  }

  private async saveToStorage() {
    const data: StoredLivesData = {
      lives: this.lives,
      lastUpdated: this.lastUpdated,
    };
    await AsyncStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  }

  private recoverLives() {
    const now = Date.now();
    const elapsed = now - this.lastUpdated;

    if (this.lives < MAX_LIVES && elapsed > 0) {
      const recovered = Math.floor(elapsed / LIVES_RECOVERY_TIME);
      if (recovered > 0) {
        this.lives = Math.min(MAX_LIVES, this.lives + recovered);
        this.lastUpdated += recovered * LIVES_RECOVERY_TIME;
        if (this.lives === MAX_LIVES) this.lastUpdated = now;
      }
    }
  }

  public async initialize(): Promise<LivesInfo> {
    const raw = await AsyncStorage.getItem(this.getStorageKey());
    if (raw) {
      const data: StoredLivesData = JSON.parse(raw);
      this.lives = data.lives;
      this.lastUpdated = data.lastUpdated;
      this.recoverLives();
    } else {
      await this.saveToStorage();
    }
    this.isInitialized = true;
    return this.getInfo();
  }

  public getInfo(): LivesInfo {
    this.recoverLives();
    const now = Date.now();
    const nextLife = this.lives < MAX_LIVES
      ? Math.max(0, this.lastUpdated + LIVES_RECOVERY_TIME - now)
      : 0;
    return {
      lives: this.lives,
      maxLives: MAX_LIVES,
      timeUntilNextLife: nextLife,
      isInitialized: this.isInitialized,
    };
  }

  public async useLife(): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    this.recoverLives();
    if (this.lives > 0) {
      this.lives -= 1;
      this.lastUpdated = Date.now();
      await this.saveToStorage();
      return true;
    }
    return false;
  }

  public async addLife(): Promise<LivesInfo> {
    if (!this.isInitialized) await this.initialize();
    this.recoverLives();
    if (this.lives < MAX_LIVES) {
      this.lives += 1;
      await this.saveToStorage();
    }
    return this.getInfo();
  }

  public async resetLives(): Promise<LivesInfo> {
    this.lives = MAX_LIVES;
    this.lastUpdated = Date.now();
    await this.saveToStorage();
    return this.getInfo();
  }

  public formatTime(ms: number): string {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
}

export default new LivesManager();
