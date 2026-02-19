import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-home-view',
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
})
export class HomeView implements OnInit, AfterViewInit {
  howPlay = false;
  whatNew = false;
  credits = false;

  apiUrl: string = 'https://api.github.com/repos/sam324sam/Mokito-web/commits';

  latestCommitMessage: string = '';

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly soundService: SoundService,
  ) {}

  ngOnInit() {
    this.loadLatestCommit();
  }

  ngAfterViewInit() {
    this.soundService.playMusic();
  }

  async loadLatestCommit() {
    try {
      const commits: any[] = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      if (commits && commits.length > 0) {
        this.latestCommitMessage = commits[0].commit.message;
      }
    } catch (error) {
      console.error('Error al obtener las ne:', error);
      this.latestCommitMessage = 'No se pudo cargar el commit';
    }
  }

  howPlayToggle(): void {
    this.howPlay = !this.howPlay;
  }

  whatNewToggle(): void {
    this.whatNew = !this.whatNew;
  }

  creditsToggle(): void {
    this.credits = !this.credits;
  }

  goToGame(): void {
    this.soundService.playMusic();
    this.router.navigate(['game']);
  }
}
