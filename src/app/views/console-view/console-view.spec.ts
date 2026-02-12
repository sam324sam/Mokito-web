import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleView } from './console-view';

describe('ConsoleView', () => {
  let component: ConsoleView;
  let fixture: ComponentFixture<ConsoleView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
