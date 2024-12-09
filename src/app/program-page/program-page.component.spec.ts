import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPageComponent } from './program-page.component';

describe('ProgramPageComponent', () => {
  let component: ProgramPageComponent;
  let fixture: ComponentFixture<ProgramPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
