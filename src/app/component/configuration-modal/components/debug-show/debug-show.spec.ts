import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugShow } from './debug-show';

describe('DebugShow', () => {
  let component: DebugShow;
  let fixture: ComponentFixture<DebugShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugShow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugShow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
