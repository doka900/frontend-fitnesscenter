import { Component, OnInit } from '@angular/core';
import { FacilityService } from '../.service/facility.service';
import { FacilityCardComponent } from "../facility-card/facility-card.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export interface Facility {
  id: number;
  country: string;
  city: string;
  zipCode: string;
  address: string;
  phoneNumber: string;
  email: string;
  calendarLink: string;
  facilityType: string;
  image: string | null;
  name: string;
  description: string;
  capacity: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [ReactiveFormsModule, CommonModule, FacilityCardComponent],
  standalone: true
})
export class HomeComponent implements OnInit {
  facilities: Facility[] = []; 

  constructor(private facilityService: FacilityService) { }

  ngOnInit() {
    this.loadFacilities(); 
  }

  loadFacilities() {
    this.facilityService.getFacilities().subscribe(
      (data: Facility[]) => {
        this.facilities = data; 
        
    console.log(this.facilities);
      },
      error => {
        console.error('Error loading facilities', error); 
      }
    );
  }
}
