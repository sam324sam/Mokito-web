import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataConfig } from './data-config';

describe('DataConfig', () => {
  let component: DataConfig;
  let fixture: ComponentFixture<DataConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
