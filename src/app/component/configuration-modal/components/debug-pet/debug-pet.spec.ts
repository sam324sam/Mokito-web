import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugPet } from './debug-pet';

describe('DebugPet', () => {
  let component: DebugPet;
  let fixture: ComponentFixture<DebugPet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugPet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugPet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
