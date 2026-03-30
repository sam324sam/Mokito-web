import { Component, Input, AfterViewInit } from '@angular/core';
import { PetService } from '../../../../services/pet/pet.service';
import { AnimationSprite, AnimationType } from '../../../../models/sprites/animation-sprite.model';
import { Sprite } from '../../../../models/sprites/sprites.model';

export interface AnimationSpriteEntry {
  key: string;
  value: AnimationSprite;
}

@Component({
  selector: 'app-change-sprite',
  imports: [],
  templateUrl: './change-sprite.html',
  styleUrl: './change-sprite.css',
})
export class ChangeSprite implements AfterViewInit {
  @Input() isChangeSpriteSectionOpen: boolean = false;
  animationSprite: Record<string, AnimationSprite> = {};
  height: number = 0;
  width: number = 0;
  constructor(private readonly petService: PetService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        const pet = this.petService.getPet();
        this.animationSprite = pet.sprite.animationSprite;
        this.height = pet.sprite.height;
        this.width = pet.sprite.width;
      } catch (e) {
        console.log('a', e);
      }
    });
  }

  getKeys(): string[] {
    return Object.keys(this.animationSprite);
  }

  async onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const petSprite: Sprite = this.petService.getPet().sprite;
    const image = await this.fileToImage(file);
    this.height = this.petService.getPet().sprite.height;
    this.width = this.petService.getPet().sprite.width;
    // Reemplazamos la animacion existente
    petSprite.animationSprite[key] = {
      image,
      frameWidth: this.width,
      frameHeight: this.height,
      // Cambiar para despues
      frameCount: image.naturalWidth / this.width,
      animationType: AnimationType.once,
    };

    console.log(image);

    // Guardar en localStorage
  }

  private fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => resolve(img);

      img.src = URL.createObjectURL(file);
    });
  }
}
