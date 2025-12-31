import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUiConfig } from './user-ui-config';

describe('UserUiConfig', () => {
  let component: UserUiConfig;
  let fixture: ComponentFixture<UserUiConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUiConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserUiConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
