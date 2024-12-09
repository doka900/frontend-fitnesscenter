import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacilityService } from '../.service/facility.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

@Component({
  selector: 'app-facility-spaces',
  templateUrl: './facility-spaces.component.html',
  styleUrls: ['./facility-spaces.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class FacilitySpacesComponent implements OnInit {
  facilityId: number | null = null;
  facility: any;
  rooms: any[] = [];
  roomForm: FormGroup;
  editingRoomId: number | null = null;
  addingNewRoom = false;
  facilitySpaceTypes: any[] = [];
  selectedFile: File | null = null;
  roomImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private facilityService: FacilityService,
    private fb: FormBuilder
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      capacity: [0, [Validators.required, Validators.min(1)]],
      facilitySpaceType: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      image: [''] 
    });
  }

  ngOnInit(): void {
    this.facilityId = +this.route.snapshot.paramMap.get('id')!;
    this.loadFacility(this.facilityId);
    this.getFacilitySpaces(this.facilityId);
    this.loadFacilitySpaceTypes();
  }

  toggleModal(open: boolean): void {
    this.addingNewRoom = open;
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  loadFacilitySpaceTypes() {
    this.facilityService.getFacilitySpaceTypes().subscribe(
      data => {
        this.facilitySpaceTypes = data;
        
      },
      error => {
        console.error('Greška prilikom učitavanja tipova prostorija', error);
      }
    );
  }

  loadFacility(facilityId: number): void {
    this.facilityService.getFacilityById(facilityId).subscribe((facility: any) => {
      this.facility = facility;
      console.log(facility)
    });
  }

  getFacilitySpaces(facilityId: number): void {
    this.facilityService.getFacilitySpaces(facilityId).subscribe((rooms: any) => {
      this.rooms = rooms;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const storage = getStorage();
      const storageRef = ref(storage, `room-images/${file.name}`);

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
              this.roomImageUrl = downloadURL;

              this.roomForm.patchValue({ image: downloadURL });
            });
          }
        );
      }
    }
  }

  openAddRoomForm(): void {
    console.log('Otvaranje modala za dodavanje prostorije');
    this.addingNewRoom = true;
    this.roomForm.reset();
    this.toggleModal(true);
  }

  openUpdateRoomForm(room: any): void {
    console.log('Otvaranje modala za ažuriranje prostorije');
    this.editingRoomId = room.id;
    this.roomForm.patchValue(room);
    this.toggleModal(true);
  }

  closeRoomForm(): void {
    console.log('Zatvaranje modala za prostoriju');
    this.editingRoomId = null;
    this.addingNewRoom = false;
    this.roomForm.reset();
    this.toggleModal(false);
  }

  onRoomSubmit(): void {
    if (this.roomForm.invalid) {
      return;
    }

    const roomData = this.roomForm.value;
    if (this.editingRoomId) {
      this.facilityService.updateRoom(this.editingRoomId, roomData).subscribe(() => {
        this.getFacilitySpaces(this.facilityId!);
        this.closeRoomForm();
      });
    } else {
      roomData.facility_id = this.facilityId;
      this.facilityService.addRoom(roomData).subscribe(() => {
        this.getFacilitySpaces(this.facilityId!);
        this.closeRoomForm();
      });
    }
  }

  deleteRoom(roomId: number): void {
    if (confirm('Da li ste sigurni da želite da obrišete ovu prostoriju?')) {
      this.facilityService.deleteRoom(roomId).subscribe(
        () => {
          this.getFacilitySpaces(this.facilityId!);
        },
        error => {
          console.error('Greška prilikom brisanja prostorije', error);
          this.getFacilitySpaces(this.facilityId!);
        }
      );
    }
  }
}
