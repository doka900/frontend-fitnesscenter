import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacilityService } from '../.service/facility.service';
import { CommonModule } from '@angular/common';
import { Facility } from '../home/home.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
  styleUrls: ['./facility-detail.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class FacilityDetailComponent implements OnInit {
  facilityId: number | null = null;
  facility: Facility | null = null;
  facilitySpaces: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private facilityService: FacilityService
  ) {}

  ngOnInit(): void {
    this.facilityId = +this.route.snapshot.paramMap.get('id')!;
    if (this.facilityId) {
      this.loadFacilityDetails(this.facilityId);
      this.loadFacilitySpaces(this.facilityId);
    }
  }

  loadFacilityDetails(facilityId: number): void {
    this.facilityService.getFacilityById(facilityId).subscribe(
      (facility: Facility) => {
        this.facility = facility;
      },
      error => {
        console.error('Greška prilikom učitavanja detalja o objektu', error);
      }
    );
  }

  loadFacilitySpaces(facilityId: number): void {
    this.facilityService.getFacilitySpaces(facilityId).subscribe(
      (spaces: any[]) => {
        this.facilitySpaces = spaces;
      },
      error => {
        console.error('Greška prilikom učitavanja prostorija objekta', error);
      }
    );
  }
}
