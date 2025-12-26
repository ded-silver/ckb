import type {
  MusicTrack,
  MusicMetadata,
  MusicPlayerState,
  MusicPlayerStatus,
  RepeatMode,
  ShuffleMode,
  VisualizationMode,
  MusicPlayerSettings,
} from "../../../types";

class MusicPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private playlist: readonly MusicTrack[] = [];
  private currentIndex: number = -1;
  private status: MusicPlayerStatus = "stopped";
  private volume: number = 50;
  private shuffle: ShuffleMode = false;
  private repeat: RepeatMode = "off";
  private visualizationMode: VisualizationMode = "bars";
  private shuffledIndices: number[] = [];
  private playbackHistory: string[] = [];
  private readonly MAX_HISTORY = 50;
  private listeners: Map<string, Set<() => void>> = new Map();
  private readonly STORAGE_KEY = "cyberpunk_music_player_settings";

  constructor() {
    this.loadSettings();
    this.loadMetadata();
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  async loadMetadata(): Promise<void> {
    try {
      const response = await fetch("/music/metadata.json");
      if (!response.ok) {
        console.warn("Failed to load metadata.json");
        return;
      }
      const metadata: MusicMetadata = await response.json();
      this.playlist = metadata.tracks || ([] as readonly MusicTrack[]);
      if (this.shuffle) {
        this.generateShuffledIndices();
      }
      this.notifyListeners("playlistChanged");
    } catch (error) {
      console.warn("Error loading metadata:", error);
    }
  }

  async reloadMetadata(): Promise<void> {
    await this.loadMetadata();
  }

  async loadTrack(filename: string): Promise<boolean> {
    const track = this.playlist.find(t => t.filename === filename);
    if (!track) {
      console.warn(`Track not found: ${filename}`);
      return false;
    }

    const index = this.playlist.indexOf(track);
    if (index === -1) return false;

    this.currentIndex = index;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    const audioPath = `/music/${track.filename}`;
    this.audioElement = new Audio(audioPath);
    this.audioElement.volume = this.volume / 100;

    if (this.audioContext && this.audioElement) {
      try {
        if (this.source) {
          try {
            this.source.disconnect();
          } catch (error) {
            console.warn("Failed to disconnect audio source:", error);
          }
        }

        this.source = this.audioContext.createMediaElementSource(this.audioElement);

        if (!this.analyser) {
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.8;

          const bufferLength = this.analyser.frequencyBinCount;
          this.dataArray = new Uint8Array(bufferLength) as Uint8Array;
        }

        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } catch (error) {
        console.warn("Error setting up audio analysis:", error);
      }
    }

    this.audioElement.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    this.audioElement.addEventListener("loadedmetadata", () => {
      this.notifyListeners("trackLoaded");
    });

    this.audioElement.addEventListener("timeupdate", () => {
      this.notifyListeners("timeUpdate");
    });

    this.notifyListeners("trackChanged");
    return true;
  }

  async play(trackName?: string): Promise<boolean> {
    if (trackName) {
      const loaded = await this.loadTrack(trackName);
      if (!loaded) return false;
    }

    if (!this.audioElement) {
      if (this.playlist.length === 0) {
        console.warn("Playlist is empty");
        return false;
      }
      await this.loadTrack(this.playlist[0].filename);
    }

    if (!this.audioElement) return false;

    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn("Error resuming audio context:", error);
      }
    }

    try {
      await this.audioElement.play();
      this.status = "playing";
      this.addToHistory(this.getCurrentTrack()?.filename);
      this.notifyListeners("statusChanged");
      return true;
    } catch (error) {
      console.warn("Error playing audio:", error);
      return false;
    }
  }

  pause(): void {
    if (this.audioElement && this.status === "playing") {
      this.audioElement.pause();
      this.status = "paused";
      this.notifyListeners("statusChanged");
    }
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.status = "stopped";
      this.notifyListeners("statusChanged");
    }
  }

  private generateShuffledIndices(): void {
    this.shuffledIndices = Array.from({ length: this.playlist.length }, (_, i) => i);
    for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledIndices[i], this.shuffledIndices[j]] = [
        this.shuffledIndices[j],
        this.shuffledIndices[i],
      ];
    }
  }

  private getNextIndex(): number {
    if (this.playlist.length === 0) return -1;

    if (this.shuffle) {
      const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentIndex);
      if (currentShuffledIndex === -1) {
        return this.shuffledIndices[0] ?? -1;
      }
      const nextShuffledIndex = (currentShuffledIndex + 1) % this.shuffledIndices.length;
      return this.shuffledIndices[nextShuffledIndex];
    } else {
      return (this.currentIndex + 1) % this.playlist.length;
    }
  }

  private getPrevIndex(): number {
    if (this.playlist.length === 0) return -1;

    if (this.shuffle) {
      const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentIndex);
      if (currentShuffledIndex === -1) {
        return this.shuffledIndices[this.shuffledIndices.length - 1] ?? -1;
      }
      const prevShuffledIndex =
        currentShuffledIndex <= 0 ? this.shuffledIndices.length - 1 : currentShuffledIndex - 1;
      return this.shuffledIndices[prevShuffledIndex];
    } else {
      return this.currentIndex <= 0 ? this.playlist.length - 1 : this.currentIndex - 1;
    }
  }

  private async handleTrackEnded(): Promise<void> {
    if (this.repeat === "one") {
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        await this.play();
      }
    } else if (this.repeat === "all") {
      await this.next();
    } else {
      const nextIndex = this.getNextIndex();
      if (nextIndex !== -1 && nextIndex !== this.currentIndex) {
        await this.next();
      } else {
        this.stop();
      }
    }
  }

  async next(): Promise<boolean> {
    if (this.playlist.length === 0) return false;

    const nextIndex = this.getNextIndex();
    if (nextIndex === -1) return false;

    const nextTrack = this.playlist[nextIndex];
    const wasPlaying = this.status === "playing";
    await this.loadTrack(nextTrack.filename);

    if (wasPlaying) {
      const result = await this.play();
      return result;
    } else {
      this.addToHistory(nextTrack.filename);
    }

    return true;
  }

  async prev(): Promise<boolean> {
    if (this.playlist.length === 0) return false;

    const prevIndex = this.getPrevIndex();
    if (prevIndex === -1) return false;

    const prevTrack = this.playlist[prevIndex];
    const wasPlaying = this.status === "playing";
    await this.loadTrack(prevTrack.filename);

    if (wasPlaying) {
      const result = await this.play();
      return result;
    } else {
      this.addToHistory(prevTrack.filename);
    }

    return true;
  }

  async jumpToTrack(indexOrName: string | number): Promise<{
    success: boolean;
    track?: MusicTrack;
    matches?: MusicTrack[];
  }> {
    if (this.playlist.length === 0) {
      return { success: false };
    }

    if (typeof indexOrName === "number" || !isNaN(Number(indexOrName))) {
      const index = typeof indexOrName === "number" ? indexOrName : Number(indexOrName);
      const playlistIndex = index - 1;

      if (playlistIndex < 0 || playlistIndex >= this.playlist.length) {
        return { success: false };
      }

      const track = this.playlist[playlistIndex];
      const wasPlaying = this.status === "playing";
      await this.loadTrack(track.filename);

      if (wasPlaying) {
        await this.play();
      } else {
        this.addToHistory(track.filename);
      }

      return { success: true, track };
    }

    const query = indexOrName.toLowerCase().trim();
    const matches = this.playlist.filter(
      track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.filename.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      return { success: false, matches: [] };
    }

    if (matches.length === 1) {
      const track = matches[0];
      const wasPlaying = this.status === "playing";
      await this.loadTrack(track.filename);

      if (wasPlaying) {
        await this.play();
      } else {
        this.addToHistory(track.filename);
      }

      return { success: true, track };
    }

    return { success: false, matches };
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volume / 100;
    }
    this.saveSettings();
    this.notifyListeners("volumeChanged");
  }

  setShuffle(enabled: boolean): void {
    this.shuffle = enabled;
    if (enabled) {
      this.generateShuffledIndices();
    }
    this.saveSettings();
    this.notifyListeners("shuffleChanged");
  }

  getShuffle(): boolean {
    return this.shuffle;
  }

  setRepeat(mode: RepeatMode): void {
    this.repeat = mode;
    this.saveSettings();
    this.notifyListeners("repeatChanged");
  }

  getRepeat(): RepeatMode {
    return this.repeat;
  }

  seek(time: number): boolean {
    if (!this.audioElement) return false;
    const duration = this.audioElement.duration;
    if (!isFinite(duration) || duration <= 0) return false;

    const seekTime = Math.max(0, Math.min(time, duration));
    this.audioElement.currentTime = seekTime;
    this.saveSettings();
    return true;
  }

  parseTime(timeStr: string): number {
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":");
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseFloat(timeStr) || 0;
  }

  searchTracks(query: string): MusicTrack[] {
    if (!query || query.trim() === "") return [];
    const lowerQuery = query.toLowerCase().trim();
    return this.playlist.filter(
      track =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.filename.toLowerCase().includes(lowerQuery)
    );
  }

  getNextTrack(): MusicTrack | null {
    if (this.playlist.length === 0) return null;
    const nextIndex = this.getNextIndex();
    if (nextIndex === -1) return null;
    return this.playlist[nextIndex];
  }

  getCurrentTrack(): MusicTrack | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
      return this.playlist[this.currentIndex];
    }
    return null;
  }

  getPlaylist(): MusicTrack[] {
    return [...this.playlist];
  }

  getState(): MusicPlayerState {
    return {
      currentTrack: this.getCurrentTrack(),
      currentIndex: this.currentIndex,
      playlist: this.playlist,
      status: this.status,
      volume: this.volume,
      position: this.audioElement?.currentTime || 0,
      duration: this.audioElement?.duration || 0,
      shuffle: this.shuffle,
      repeat: this.repeat,
    };
  }

  getStatus(): MusicPlayerStatus {
    return this.status;
  }

  getVolume(): number {
    return this.volume;
  }

  on(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: () => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string): void {
    this.listeners.get(event)?.forEach(callback => callback());
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) {
      return null;
    }

    // @ts-ignore - getByteFrequencyData принимает Uint8Array
    this.analyser.getByteFrequencyData(this.dataArray);
    return new Uint8Array(this.dataArray);
  }

  getFrequencyBinCount(): number {
    return this.analyser ? this.analyser.frequencyBinCount : 0;
  }

  private saveSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const existingSettings: Partial<MusicPlayerSettings> = saved ? JSON.parse(saved) : {};

      const settings: MusicPlayerSettings = {
        volume: this.volume,
        lastTrack: this.currentIndex >= 0 ? this.playlist[this.currentIndex]?.filename : undefined,
        lastPosition:
          this.status === "paused" && this.audioElement ? this.audioElement.currentTime : undefined,
        shuffle: this.shuffle,
        repeat: this.repeat,
        visualizationMode: this.visualizationMode,
        windowSize: existingSettings.windowSize || { width: 600, height: 400 },
        windowPosition: existingSettings.windowPosition || { x: 0, y: 0 },
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save music player settings:", error);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const settings: Partial<MusicPlayerSettings> = JSON.parse(saved);
        if (settings.volume !== undefined) {
          this.volume = Math.max(0, Math.min(100, settings.volume));
        }
        if (settings.shuffle !== undefined) {
          this.shuffle = settings.shuffle;
        }
        if (settings.repeat !== undefined) {
          this.repeat = settings.repeat;
        }
      }
    } catch (error) {
      console.warn("Failed to load music player settings:", error);
    }
  }

  getSavedSettings(): Partial<MusicPlayerSettings> | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to get saved settings:", error);
    }
    return null;
  }

  saveWindowState(
    size: { width: number; height: number },
    position: { x: number; y: number }
  ): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const existingSettings: Partial<MusicPlayerSettings> = saved ? JSON.parse(saved) : {};
      const settings: Partial<MusicPlayerSettings> = {
        ...existingSettings,
        windowSize: size,
        windowPosition: position,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save window state:", error);
    }
  }

  getStats(): {
    totalTracks: number;
    totalDuration: number;
    currentPosition: number;
    currentDuration: number;
    artists: Array<{ name: string; count: number; percentage: number }>;
  } {
    const totalTracks = this.playlist.length;
    const totalDuration = this.playlist.reduce((sum, track) => sum + track.duration, 0);
    const currentPosition = this.audioElement?.currentTime || 0;
    const currentDuration = this.audioElement?.duration || 0;

    const artistMap = new Map<string, number>();
    this.playlist.forEach(track => {
      const count = artistMap.get(track.artist) || 0;
      artistMap.set(track.artist, count + 1);
    });

    const artists = Array.from(artistMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalTracks > 0 ? (count / totalTracks) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTracks,
      totalDuration,
      currentPosition,
      currentDuration,
      artists,
    };
  }

  private addToHistory(filename: string | undefined): void {
    if (!filename) return;

    this.playbackHistory = this.playbackHistory.filter(f => f !== filename);
    this.playbackHistory.unshift(filename);
    if (this.playbackHistory.length > this.MAX_HISTORY) {
      this.playbackHistory = this.playbackHistory.slice(0, this.MAX_HISTORY);
    }
  }

  getHistory(limit?: number): MusicTrack[] {
    const historyFilenames = limit ? this.playbackHistory.slice(0, limit) : this.playbackHistory;

    return historyFilenames
      .map(filename => this.playlist.find(t => t.filename === filename))
      .filter((track): track is MusicTrack => track !== undefined);
  }

  setVisualizationMode(mode: VisualizationMode): void {
    if (["bars", "waves", "spectrum"].includes(mode)) {
      this.visualizationMode = mode;
      this.saveSettings();
      this.notifyListeners("visualizationModeChanged");
    }
  }

  getVisualizationMode(): VisualizationMode {
    return this.visualizationMode;
  }
}

export const musicPlayer = new MusicPlayer();
