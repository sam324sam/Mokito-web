import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSprite } from './change-sprite';

describe('ChangeSprite', () => {
  let component: ChangeSprite;
  let fixture: ComponentFixture<ChangeSprite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeSprite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeSprite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
