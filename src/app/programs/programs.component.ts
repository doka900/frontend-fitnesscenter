import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramService } from '../.service/program.service';
import { AuthService } from '../.service/auth.service';
import { UserService } from '../.service/user.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { User } from '../.model/userRegister.model';
import { FacilityService } from '../.service/facility.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

declare var createGoogleEvent: any;

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class ProgramsComponent implements OnInit {
  programForm: FormGroup;
  updateForm: FormGroup;
  appointmentForm: FormGroup;
  programs: any[] = [];
  trainers: any[] = [];
  programDurations: string[] = ['ČETIRI_NEDELJE', 'OSAM_NEDELJA', 'DVANAEST_NEDELJA'];
  programLevels: string[] = ['POČETNIK', 'SREDNJI', 'NAPREDNI'];
  editingProgramId: number | null = null;
  selectedFile: File | null = null;
  programImageUrl: string | null = null;
  selectedProgram: any = null;
  facilities: any[] = [];
  rooms: any[] = [];
  email: string = '';
  mainOccurrences: any[] = [];
  allOccurrences: any[] = [];
  loggedInEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private programService: ProgramService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private facilityService: FacilityService,
    private http: HttpClient
  ) {
    this.programForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      description: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      price: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      programDuration: ['', Validators.required],
      programLevel: ['', Validators.required],
      image: [''],
      trainer: ['', Validators.required],
      facility: ['', Validators.required],
      room: [''],
      location: [''],
    });

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      description: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      price: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      programDuration: ['', Validators.required],
      programLevel: ['', Validators.required],
      image: [''],
      trainer: ['', Validators.required],
      facility: [''],
      room: [''],
      location: [''],
    });

    this.appointmentForm = this.fb.group({
      appointmentTime: ['', Validators.required],
      facility: [''],
      room: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmail();
    this.loadFacilities();
    this.loadTrainers().then(() => {
      this.loadPrograms();
    });
    console.log(this.trainers);
  }

  loadEmail(): void {
    this.userService.getUserByUsername(this.authService.getUsername()).subscribe(
      (data: any) => {
        this.loggedInEmail = data.email;
        console.log('Prijavljeni email:', this.loggedInEmail);
      },
      (error: any) => {
        console.error('Greška pri učitavanju podataka o korisniku:', error);
      }
    );
  }

  onFacilityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const facilityId = Number(selectElement.value);
    this.facilityService.getFacilitySpaces(facilityId).subscribe(
      (rooms: any[]) => {
        this.rooms = rooms;
      },
      (error: any) => {
        console.error('Greška pri učitavanju prostorija za objekat', error);
        this.rooms = [];
      }
    );
  }

  loadFacilities(): void {
    this.facilityService.getFacilities().subscribe(
      (data: any[]) => {
        this.facilities = data.map(facility => ({
          ...facility,
          fullAddress: `${facility.address}, ${facility.city}, ${facility.country}`
        }));
        this.facilities.forEach(facility => {
          this.facilityService.getFacilitySpaces(facility.id).subscribe(
            (rooms: any[]) => {
              facility.rooms = rooms;
              this.rooms = [...this.rooms, ...rooms];
              console.log('Objekti učitani', this.facilities);
              console.log('Prostorije učitane', this.rooms);
            },
            (error: any) => {
              console.error('Greška pri učitavanju prostorija za objekat', facility.id, error);
            }
          );
        });
      },
      (error: any) => {
        console.error('Greška pri učitavanju objekata', error);
      }
    );
  }

  loadTrainers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.findTrainers().subscribe(
        (data: any[]) => {
          this.trainers = data;
          console.log('Treneri učitani:', this.trainers);
          resolve();
        },
        (error: any) => {
          console.error('Greška pri učitavanju trenera', error);
          reject(error);
        }
      );
    });
  }

  loadPrograms(): void {
    this.programService.getPrograms().subscribe(
      (data: any[]) => {
        this.programs = data;
        console.log('Programi učitani:', this.programs);
        this.programs.forEach(program => {
          console.log('Obrada programa:', program);
          const matchingTrainer = this.trainers.find(trainer =>
            trainer.trainingPrograms.some((trainerProgram: any) => trainerProgram.id === program.id)
          );
          if (matchingTrainer) {
            program.trainer = matchingTrainer;
            console.log(`Dodeljen trener ${matchingTrainer.displayName} programu ${program.name}`);
          } else {
            console.warn(`Nije pronađen trener za program ${program.name}`);
          }
        });
        console.log('Programi sa trenerima, objektima i prostorijama:', this.programs);
      },
      (error: any) => {
        console.error('Greška pri učitavanju programa', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const storage = getStorage();
      const storageRef = ref(storage, `program-images/${file.name}`);
      if (this.selectedFile) {
        const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);
        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {
            console.error('Greška pri otpremanju datoteke:', error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              this.programImageUrl = downloadURL;
              this.programForm.patchValue({ image: downloadURL });
              if (this.editingProgramId) {
                this.updateForm.patchValue({ image: downloadURL });
              }
            });
          }
        );
      }
    }
  }

  onSubmit(): void {
    if (this.programForm.valid && this.programImageUrl) {
      console.log('Forma programa:', this.programForm);
      this.programForm.patchValue({ image: this.programImageUrl });
      const formData = {
        ...this.programForm.value,
        trainerId: this.programForm.value.trainer,
        facilityId: this.programForm.value.facility
      };
      console.log('Forma programa:', this.programForm);
      delete formData.trainer;
      this.programService.createProgram(formData).subscribe({
        next: () => {
          this.loadPrograms();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Greška pri kreiranju programa:', err);
        }
      });
    } else {
      console.warn('Forma nije validna ili slika nije otpremljena');
    }
  }

  createRecurringGoogleEvent(eventDetails: any): Promise<string> {
    return new Promise((resolve, reject) => {
      createGoogleEvent(eventDetails, (response: any) => {
        alert("Događaj uspešno kreiran.");
        if (response.error) {
          alert("Događaj nije uspešno kreiran.");
          reject(response.error);
        } else {
          resolve(response.htmlLink);
        }
      });
    });
  }

  openEventModal(program: any): void {
    this.selectedProgram = program;
    this.appointmentForm.reset();
    document.body.classList.add('modal-open');
    this.appointmentForm.patchValue({
      location: this.facilities.length > 0 ? this.facilities[0].fullAddress : ''
    });
  }

  closeModal(): void {
    this.selectedProgram = null;
    document.body.classList.remove('modal-open');
  }

  loadProgramEventsFromGoogleCalendar(program: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const calendarId = 'fitnesscenter.soh@gmail.com';
      const googleApiKey = 'AIzaSyDE7zXtaHeKKdIrxndVjfd05gk4FF7tRaQ';
      const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${googleApiKey}`;
      const params = {
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      };
      this.http.get(apiUrl, { params }).subscribe({
        next: (response: any) => {
          if (response.items) {
            const filteredEvents = response.items.filter((event: any) =>
              event.summary.includes(program.name) ||
              (event.description && event.description.includes(program.name))
            );
            if (filteredEvents.length > 0) {
              const mainOccurrencesMap = new Map();
              this.allOccurrences = [];
              filteredEvents.forEach((event: any) => {
                const baseId = event.id.split('_')[0];
                this.allOccurrences.push({
                  id: event.id,
                  summary: event.summary,
                  description: event.description,
                  location: event.location,
                  startTime: new Date(event.start.dateTime || event.start.date),
                  endTime: new Date(event.end.dateTime || event.end.date),
                  recurrence: event.recurrence,
                  htmlLink: event.htmlLink
                });
                if (!mainOccurrencesMap.has(baseId)) {
                  mainOccurrencesMap.set(baseId, {
                    id: event.id,
                    baseId: baseId,
                    summary: event.summary,
                    description: event.description,
                    location: event.location,
                    startTime: new Date(event.start.dateTime || event.start.date),
                    endTime: new Date(event.end.dateTime || event.end.date),
                    recurrence: event.recurrence,
                    htmlLink: event.htmlLink,
                    occurrences: []
                  });
                }
                mainOccurrencesMap.get(baseId).occurrences.push({
                  id: event.id,
                  startTime: new Date(event.start.dateTime || event.start.date),
                  endTime: new Date(event.end.dateTime || event.end.date),
                  location: event.location,
                  htmlLink: event.htmlLink
                });
              });
              this.mainOccurrences = Array.from(mainOccurrencesMap.values());
            } else {
              console.warn('Nema događaja za ovaj program.');
            }
          }
          console.log('Glavni događaji:', this.mainOccurrences);
          console.log('Svi događaji:', this.allOccurrences);
          resolve();
        },
        error: (err) => {
          console.error('Greška pri preuzimanju događaja:', err);
          reject(err);
        }
      });
    });
  }

  async scheduleMeeting(): Promise<void> {
    if (this.appointmentForm.valid && this.selectedProgram) {
      const appointmentTime = new Date(this.appointmentForm.value.appointmentTime);
      const startTime = appointmentTime.toISOString().slice(0, 18) + '-00:00';
      const endTime = this.getEndTime(appointmentTime).toISOString();
      const location = this.appointmentForm.value.location + ',' + this.appointmentForm.value.room;
      console.log('Zakazivanje događaja sa detaljima:', { startTime, endTime, location });
      try {
        await this.loadProgramEventsFromGoogleCalendar(this.selectedProgram);
        console.log('Učitani svi događaji:', this.allOccurrences);
        const conflictingEvent = this.allOccurrences.find((event: any) => {
          const eventStartTime = new Date(event.startTime).toISOString();
          const eventEndTime = new Date(event.endTime).toISOString();
          const eventLocation = event.location?.trim();
          console.log('Poređenje sa postojećim događajem:', {
            eventStartTime,
            eventEndTime,
            eventLocation
          });
          const isConflict = (
            eventLocation === location &&
            (
              (startTime >= eventStartTime && startTime < eventEndTime) ||
              (endTime > eventStartTime && endTime <= eventEndTime) ||
              (startTime <= eventStartTime && endTime >= eventEndTime)
            )
          );
          if (isConflict) {
            console.log('Konflikt sa događajem:', event);
          } else {
            console.log('Nema konflikta sa ovim događajem.');
          }
          return isConflict;
        });
        if (conflictingEvent) {
          alert(`Konflikt sa događajem: ${conflictingEvent.summary} u ${conflictingEvent.location}!`);
          console.log('Konflikt detektovan, događaj nije zakazan.');
          return;
        }
        console.log('Nema konflikta, zakazivanje događaja.');
        let recurrenceCount = 4;
        switch (this.selectedProgram.programDuration) {
          case 'ČETIRI_NEDELJE':
            recurrenceCount = 4;
            break;
          case 'OSAM_NEDELJA':
            recurrenceCount = 8;
            break;
          case 'DVANAEST_NEDELJA':
            recurrenceCount = 12;
            break;
          default:
            recurrenceCount = 4;
        }
        console.log('Pravilo ponavljanja postavljeno za', recurrenceCount, 'nedelja.');
        const eventDetails = {
          email: "fitnesscenter.soh@gmail.com",
          startTime: startTime,
          endTime: endTime,
          summary: this.selectedProgram.name,
          description: this.selectedProgram.description,
          location: location,
          recurrence: `FREQ=WEEKLY;COUNT=${recurrenceCount}`,
          attendees: [
            { email: this.loggedInEmail }
          ]
        };
        console.log('Detalji događaja za Google Kalendar:', eventDetails);
        createGoogleEvent(eventDetails);
        this.closeModal();
      } catch (error) {
        console.error('Greška tokom zakazivanja:', error);
      }
    } else {
      console.warn('Forma nije validna ili nijedan program nije izabran');
    }
  }

  getRecurrenceCount(programDuration: string): number {
    switch (programDuration) {
      case 'ČETIRI_NEDELJE':
        return 4;
      case 'OSAM_NEDELJA':
        return 8;
      case 'DVANAEST_NEDELJA':
        return 12;
      default:
        return 4;
    }
  }

  getEndTime(appointmentTime: Date): Date {
    const endTime = new Date(appointmentTime);
    endTime.setHours(endTime.getHours() + 1);
    return endTime;
  }

  editProgram(program: any): void {
    this.editingProgramId = program.id;
    console.log('ID programa za uređivanje:', this.editingProgramId);
    this.updateForm.patchValue({
      name: program.name,
      description: program.description,
      price: program.price,
      programDuration: program.programDuration,
      programLevel: program.programLevel,
      trainer: program.trainer?.id,
      facility: program.facility?.id,
      room: program.room?.id,
      image: program.image
    });
  }

  onUpdate(): void {
    if (this.updateForm.valid && this.editingProgramId) {
      const updatedProgram = {
        ...this.updateForm.value,
        trainerId: this.updateForm.value.trainer,
        facilityId: this.updateForm.value.facility,
        roomId: this.updateForm.value.room,
        id: this.editingProgramId
      };
      console.log('Ažuriranje programa sa ID-om:', this.editingProgramId);
      console.log('Podaci za ažurirani program:', updatedProgram);
      this.programService.updateProgram(updatedProgram, this.editingProgramId).subscribe({
        next: () => {
          this.loadPrograms();
          this.cancelEdit();
        },
        error: (error: any) => {
          console.error('Greška pri ažuriranju programa:', error);
        }
      });
    } else {
      console.warn('Forma nije validna ili nedostaje ID programa');
    }
  }

  deleteProgram(id: number): void {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj program?')) {
      this.programService.deleteProgram(id).subscribe(
        () => {
          this.loadPrograms();
        },
        (error) => {
          this.loadPrograms();
          console.error('Greška pri brisanju programa', error);
        }
      );
    }
  }

  cancelEdit(): void {
    this.editingProgramId = null;
    this.updateForm.reset();
  }

  resetForm(): void {
    this.programForm.reset();
    this.programImageUrl = null;
    this.selectedFile = null;
  }
}
