import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitySpacesComponent } from './facility-spaces.component';

describe('FacilitySpacesComponent', () => {
  let component: FacilitySpacesComponent;
  let fixture: ComponentFixture<FacilitySpacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitySpacesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacilitySpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
