import { Component, Input, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PetService } from '../../../../services/pet/pet.service';
import { AnimationSprite, AnimationType } from '../../../../models/sprites/animation-sprite.model';
import { Sprite } from '../../../../models/sprites/sprites.model';
import { NgStyle } from '@angular/common';

export interface AnimationSpriteEntry {
  key: string;
  value: AnimationSprite;
}

@Component({
  selector: 'app-change-sprite',
  imports: [NgStyle],
  templateUrl: './change-sprite.html',
  styleUrl: './change-sprite.css',
})
export class ChangeSprite implements AfterViewInit, OnDestroy {
  @Input() isChangeSpriteSectionOpen: boolean = false;
  animationSprite: Record<string, AnimationSprite> = {};
  height: number = 0;
  width: number = 0;
  opened: Record<string, boolean> = {};
  constructor(
    private readonly petService: PetService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

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
      this.intervalId = setInterval(() => {
        // fuerza refresco de la vista ver si afecta el settimiout de arriba
        this.cdr.detectChanges();
      }, 100);
    });
  }

  intervalId: any;

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  getKeys(): string[] {
    return Object.keys(this.animationSprite);
  }

  getDescription(key: string): string {
    return this.animationSprite[key].description;
  }

  toggle(key: string) {
    this.opened[key] = !this.opened[key];
  }

  async onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const petSprite: Sprite = this.petService.getPet().sprite;
    const image = await this.fileToImage(file);
    this.height = this.petService.getPet().sprite.height;
    this.width = this.petService.getPet().sprite.width;

    const description = petSprite.animationSprite[key].description;
    petSprite.animationSprite[key] = {
      image,
      frameWidth: this.width,
      frameHeight: this.height,
      frameCount: image.naturalWidth / this.width,
      animationType: AnimationType.once,
      description,
    };

    console.log(image);
  }

  private fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  }

  getSpriteStyle(key: string) {
    const anim = this.animationSprite[key];
    if (!anim?.image) return {};

    const frame = Math.floor(Date.now() / 100) % anim.frameCount;

    return {
      width: `${this.width}px`,
      height: `${this.height}px`,
      backgroundImage: `url(${anim.image.src})`,
      backgroundPosition: `-${frame * this.width}px 0`,
    };
  }
}
