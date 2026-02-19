import { Injectable } from '@angular/core';
// Servicios
import { DataService } from './data.service';
@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly music: Map<string, string> = new Map();
  private readonly efects: Map<string, string> = new Map();

  constructor(private readonly dataService: DataService) {
    this.music = this.dataService.getMusic();
    this.efects = this.dataService.getEfects();
  }

  private currentMusic: HTMLAudioElement | null = null;
  private curretnEfect: HTMLAudioElement | null = null;

  private musicVolume = 0.1;
  private sfxVolume = 0.1;

  getMusicVolume() {
    return this.musicVolume;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  setMusicVolume(musicVolume: number) {
    this.musicVolume = musicVolume;

    if (this.currentMusic) {
      this.currentMusic.volume = musicVolume;
    }
  }

  setSfxVolume(sfxVolume: number) {
    this.sfxVolume = sfxVolume;
  }

  // ========= Musica
  playMusic(name: string = 'default', loop = true): void {
    const src = this.music.get(name);

    const audio = new Audio(src);
    // Comprobar que no se este ejecutando esa musica para no cambiarla
    if (this.currentMusic) {
      if (this.currentMusic.src == audio.src) return;
      this.currentMusic.pause();
      this.currentMusic = null;
    }
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
