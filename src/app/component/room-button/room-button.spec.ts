import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomButton } from './room-button';

describe('RoomButton', () => {
  let component: RoomButton;
  let fixture: ComponentFixture<RoomButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
