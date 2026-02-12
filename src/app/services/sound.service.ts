import { Injectable } from '@angular/core';
// Servicios
import { DataService } from './data.service';
@Injectable({ providedIn: 'root' })
export class SoundService {
  music: Map<string, string> = new Map();
  efects: Map<string, string> = new Map();

  constructor(private readonly dataService: DataService) {
    this.music = this.dataService.getMusic();
    this.efects = this.dataService.getEfects();
  }

  private currentMusic: HTMLAudioElement | null = null;
  private curretnEfect: HTMLAudioElement | null = null;

  musicVolume = 0.2;
  sfxVolume = 1;

  // ========= Musica
  playMusic(name: string = 'default', loop = true): void {
    const src = this.music.get(name);

    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = this.musicVolume;
    audio.play().catch(() => {});

    this.currentMusic = audio;
  }

  stopMusic(): void {
    this.currentMusic?.pause();
    this.currentMusic = null;
  }

  // ========== Efectos
  playEfects(key: string): void {
    const src = this.efects.get(key);
    if (!src) return;

    if (this.curretnEfect) {
      this.curretnEfect.pause();
      this.curretnEfect = null;
    }

    const audio = new Audio(src);
    audio.volume = this.sfxVolume;
    audio.play().catch(() => {});

    this.curretnEfect = audio;
  }
}
