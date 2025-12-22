class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private lastTypeSoundTime: number = 0;
  private readonly TYPE_SOUND_COOLDOWN: number = 10;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
      this.enabled = false;
    }
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "square",
    volume: number = 0.1
  ) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playType() {
    const now = Date.now();
    if (now - this.lastTypeSoundTime < this.TYPE_SOUND_COOLDOWN) {
      return;
    }
    this.lastTypeSoundTime = now;
    this.playTone(800, 0.05, "square", 0.05);
  }

  // Звук выполнения команды
  playCommand() {
    this.playTone(600, 0.1, "square", 0.08);
    setTimeout(() => this.playTone(800, 0.1, "square", 0.08), 50);
  }

  // Звук успеха
  playSuccess() {
    this.playTone(523, 0.1, "square", 0.1);
    setTimeout(() => this.playTone(659, 0.1, "square", 0.1), 100);
    setTimeout(() => this.playTone(784, 0.15, "square", 0.1), 200);
  }

  // Звук ошибки
  playError() {
    this.playTone(200, 0.2, "sawtooth", 0.15);
    setTimeout(() => this.playTone(150, 0.2, "sawtooth", 0.15), 200);
  }

  // Звук предупреждения
  playWarning() {
    this.playTone(400, 0.15, "square", 0.1);
    setTimeout(() => this.playTone(350, 0.15, "square", 0.1), 150);
  }

  // Звук взлома
  playHack() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(300 + i * 100, 0.08, "square", 0.08);
      }, i * 50);
    }
  }

  // Звук сканирования
  playScan() {
    this.playTone(400, 0.1, "sine", 0.06);
    setTimeout(() => this.playTone(500, 0.1, "sine", 0.06), 100);
    setTimeout(() => this.playTone(600, 0.1, "sine", 0.06), 200);
  }

  // Звук заражения
  playVirusInfection() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(200 + i * 50, 0.2, "sawtooth", 0.2);
      }, i * 200);
    }
    setTimeout(() => {
      this.playTone(150, 0.3, "sawtooth", 0.25);
    }, 600);
  }

  // Звук лечения
  playVirusCure() {
    this.playTone(400, 0.1, "sine", 0.1);
    setTimeout(() => this.playTone(500, 0.1, "sine", 0.1), 100);
    setTimeout(() => this.playTone(600, 0.1, "sine", 0.1), 200);
    setTimeout(() => this.playTone(700, 0.15, "sine", 0.12), 300);
  }

  // Звук тикающего таймера
  playVirusTick() {
    this.playTone(800, 0.05, "square", 0.05);
  }

  // Включить/выключить звуки
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundGenerator = new SoundGenerator();
