import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationModal } from './configuration-modal';

describe('ConfigurationModal', () => {
  let component: ConfigurationModal;
  let fixture: ComponentFixture<ConfigurationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
