import { Component, Input } from '@angular/core';
import { SoundService } from '../../../../services/sound.service';

@Component({
  selector: 'app-sound-config',
  templateUrl: './sound-config.html',
  styleUrl: './sound-config.scss',
})
export class SoundConfig {

  @Input() isSoundSectionOpen: boolean = false;

  musicVolume: number = 0;
  sfxVolume: number = 0;

  constructor(private readonly soundService: SoundService) {
    this.musicVolume = Math.round(this.soundService.getMusicVolume() * 100);
    this.sfxVolume = Math.round(this.soundService.getSfxVolume() * 100);
  }

  setMusicVolume(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.musicVolume = value;

    // Convertimos a escala 0-1 para el audio
    this.soundService.setMusicVolume(value / 100);
  }

  setSfxVolume(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.sfxVolume = value;

    this.soundService.setSfxVolume(value / 100);
  }
}
