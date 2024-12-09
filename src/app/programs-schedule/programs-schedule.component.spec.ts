import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsScheduleComponent } from './programs-schedule.component';

describe('ProgramsScheduleComponent', () => {
  let component: ProgramsScheduleComponent;
  let fixture: ComponentFixture<ProgramsScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramsScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramsScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
