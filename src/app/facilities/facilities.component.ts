import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacilityService } from '../.service/facility.service';
import { AuthService } from '../.service/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class FacilitiesComponent implements OnInit {
  facilityForm: FormGroup;
  updateForm: FormGroup;
  facilities: any[] = [];
  facilityTypes: any[] = [];
  editingFacilityId: number | null = null;
  selectedFile: File | null = null;
  facilityImageUrl: string | null = null;
  isModalOpen = false;
  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private authService: AuthService,
    private router: Router
  ) {
    this.facilityForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      country: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      city: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      address: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^';"\\]+$/)]],
      calendarLink: ['', [Validators.pattern(/^[^';"\\]+$/)]],
      facilityType: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      image: ['']
    });
    
    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      city: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      country: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      address: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^';"\\]+$/)]],
      calendarLink: ['', [Validators.pattern(/^[^';"\\]+$/)]],
      facilityType: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.loadFacilities();
    this.loadFacilityTypes();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const storage = getStorage();
      const storageRef = ref(storage, `facility-images/${file.name}`);
      
      if (this.selectedFile) {
        const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {
            console.error('Greška prilikom otpremanja fajla:', error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('Fajl dostupan na', downloadURL);
              this.facilityImageUrl = downloadURL;
              this.facilityForm.patchValue({ image: downloadURL });
              if (this.editingFacilityId) {
                this.updateForm.patchValue({ image: downloadURL });
              }
            });
          }
        );
      }
    }
  }

  loadFacilities() {
    this.facilityService.getFacilities().subscribe(
      data => {
        this.facilities = data;
      },
      error => {
        console.error('Greška prilikom učitavanja objekata', error);
      }
    );
  }
  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

onSubmit(): void {
  this.toggleModal();
  if (this.facilityForm.valid && this.facilityImageUrl) {
    this.facilityForm.patchValue({ image: this.facilityImageUrl });

    this.facilityService.createFacility(this.facilityForm.value).subscribe({
      next: (response) => {
        console.log('Objekat kreiran:', response);
        this.loadFacilities();
      },
      error: (err) => {
        console.error('Greška prilikom kreiranja objekta:', err);
      }
    });
  } else {
    console.warn('Forma nije validna ili slika nije otpremljena');
  }
}

  editFacility(facility: any) {
    this.editingFacilityId = facility.id;
    this.updateForm.patchValue({
      name: facility.name,
      city: facility.city,
      country: facility.country,
      zipCode: facility.zipCode,
      address: facility.address,
      phoneNumber: facility.phoneNumber,
      email: facility.email,
      calendarLink: facility.calendarLink,
      facilityType: facility.facilityType,
      image: facility.image
    });
  }

  onUpdate(): void {
    if (this.updateForm.valid && this.editingFacilityId) {
      this.facilityService.updateFacility(this.editingFacilityId, this.updateForm.value).subscribe(
        response => {
          console.log('Objekat ažuriran:', response);
          this.loadFacilities();
          this.cancelEdit();
        },
        error => {
          console.error('Greška prilikom ažuriranja objekta', error);
        }
      );
    }
  }

  deleteFacility(id: number): void {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj objekat?')) {
      this.facilityService.deleteFacility(id).subscribe(
        response => {
          this.loadFacilities();
          console.log('Objekat obrisan:', response);
          this.loadFacilities();
        },
        error => {
          console.error('Greška prilikom brisanja objekta', error);
          alert("Greška prilikom brisanja, objekat sadrži prostorije");
          this.loadFacilities();
        }
      );
    }
  }

  cancelEdit(): void {
    this.editingFacilityId = null;
    this.updateForm.reset();
    this.toggleModal();
  }

  loadFacilityTypes(): void {
    this.facilityService.getFacilityTypes().subscribe(
      data => {
        this.facilityTypes = data;
      },
      error => {
        console.error('Greška prilikom učitavanja tipova objekata', error);
      }
    );
  }

  viewFacilitySpaces(facilityId: number): void {
    this.router.navigate(['/facility', facilityId, 'spaces']);
  }

  resetForm(): void {
    this.facilityForm.reset();
  }
}
