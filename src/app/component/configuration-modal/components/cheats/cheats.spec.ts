import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cheats } from './cheats';

describe('Cheats', () => {
  let component: Cheats;
  let fixture: ComponentFixture<Cheats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cheats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cheats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
