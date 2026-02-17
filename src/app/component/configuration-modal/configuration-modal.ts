// configuration-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
// componentes
import { SoundConfig } from './components/sound-config/sound-config';
import { ColorSelector } from './components/color-selector/color-selector';
import { DataConfig } from './components/data-config/data-config';
import { Cheats } from './components/cheats/cheats';
import { UserUiConfig } from "./components/user-ui-config/user-ui-config";
import { DebugShow } from "./components/debug-show/debug-show";

@Component({
  selector: 'app-configuration-modal',
  templateUrl: './configuration-modal.html',
  styleUrl: './configuration-modal.scss',
  imports: [SoundConfig, ColorSelector, DataConfig, Cheats, UserUiConfig, DebugShow],
})
export class ConfigurationModal {
  @Input() isOpenConfiguration: boolean = false;
  @Output() toggleConfiguration = new EventEmitter<boolean>();

  // Apartado para los togles de los menus
  isSoundSectionOpen = false;
  isColorSectionOpen = false;
  isCheatsSectionOpen = false;
  isSaveSectionOpen = false;
  isUserUiSectionOpen = false;
  isDebugSectionOpen = false;

  toggleSoundSection() {
    this.isSoundSectionOpen = !this.isSoundSectionOpen;
  }

  toggleColorSection() {
    this.isColorSectionOpen = !this.isColorSectionOpen;
  }

  toggleCheatsSection() {
    this.isCheatsSectionOpen = !this.isCheatsSectionOpen;
  }

  toggleSaveSection() {
    this.isSaveSectionOpen = !this.isSaveSectionOpen;
  }

  toggleUserUiSection(){
    this.isUserUiSectionOpen = !this.isUserUiSectionOpen;
  }

  togleDebugSection(){
    this.isDebugSectionOpen = !this.isDebugSectionOpen;
  }

  close() {
    this.isOpenConfiguration = false;
    this.isColorSectionOpen = false;
    this.isCheatsSectionOpen = false;
    this.toggleConfiguration.emit(false);
  }
}
