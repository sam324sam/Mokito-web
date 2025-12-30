import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSelector } from './color-selector';

describe('ColorSelector', () => {
  let component: ColorSelector;
  let fixture: ComponentFixture<ColorSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
