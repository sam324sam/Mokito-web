import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPet } from './room-pet';

describe('RoomPet', () => {
  let component: RoomPet;
  let fixture: ComponentFixture<RoomPet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomPet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomPet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
