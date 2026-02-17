import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundConfig } from './sound-config';

describe('SoundConfig', () => {
  let component: SoundConfig;
  let fixture: ComponentFixture<SoundConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoundConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
