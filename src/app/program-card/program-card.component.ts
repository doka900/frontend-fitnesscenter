import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../.service';
import { ProgramService } from '../.service/program.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../.service/user.service';

declare const gapi: any;
declare var tokenClient: any;

@Component({
  selector: 'app-program-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.css']
})
export class ProgramCardComponent implements OnInit {
  @Input() program!: any;
  defaultImage: string = 'assets/default-image.jpg';
  isUserEnrolled = false;
  availableEvents: any[] = [];
  selectedEvents: any[] = [];
  isModalOpen: boolean = false;
  selectedProgram: any = false;
  token: any;
  showAllOccurrences = false;
  mainOccurrences: any[] = []; 
  allOccurrences: any[] = [];
  isLoading: boolean = false;
  trainers: any[] = [];
  constructor(
    private authService: AuthService,
    private programService: ProgramService,
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrainers();
    this.checkEnrollment();
  }
  
  loadTrainers(): void {
    this.userService.findTrainers().subscribe({
      next: (data: any[]) => {
        this.trainers = data;
        this.assignTrainerToProgram();
      },
      error: (err) => {
        console.error('Greška pri preuzimanju trenera:', err);
      }
    });
  }

  assignTrainerToProgram(): void {
    const trainer = this.trainers.find(t => t.trainingPrograms.some((p: any) => p.id === this.program.id));
    if (trainer) {
      this.program.trainer = trainer;
    }
  }
  
  checkEnrollment(): void {
    const username = this.authService.getUsername();
    this.programService.getProgramsByUsername(username).subscribe({
      next: (response) => {
        this.isUserEnrolled = response.some((p: any) => p.id === this.program.id);
        console.log('Status prijave:', this.isUserEnrolled);
      },
      error: (err) => {
        console.error('Greška pri proveri prijave:', err);
      }
    });
  }

  startProgramAndSchedule(): void {
    const username = this.authService.getUsername();
    if (this.isUserEnrolled) {
      alert('Uspešno ste započeli ste odabrani program!');
      this.isModalOpen = true;
      this.loadProgramEventsFromGoogleCalendar(this.program);
    } else {
      this.programService.addParticipant(this.program.id, username).subscribe({
        next: () => {
          alert('Uspešno ste započeli ste odabrani program!');
          this.isUserEnrolled = true;
          this.loadProgramEventsFromGoogleCalendar(this.program);
          this.isModalOpen = true;
        },
        error: (err) => {
          if (err.status === 409) {
            alert('Uspešno ste započeli ste odabrani program!');
            this.loadProgramEventsFromGoogleCalendar(this.program);
            this.isModalOpen = true; 
          }
          if (err.status === 403) {
            alert('Prijavite se prvo.');
            this.isModalOpen = false; 
            this.router.navigate(['/login']);
          } else {
            console.error('Neočekivana greška prilikom dodavanja učesnika:', err);
          }
        }
      });
    }
  }
  
  loadProgramEventsFromGoogleCalendar(program: any): void {
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
        },
        error: (err) => {
            console.error('Greška pri preuzimanju događaja:', err);
        }
    });
}

toggleModal(): void {
  this.isModalOpen = !this.isModalOpen;
  if (this.isModalOpen) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
}

toggleEventSelection(mainOccurrence: any): void {
  console.log(`Izmena selekcije za glavni događaj: ${mainOccurrence.id}`);
  mainOccurrence.selected = !mainOccurrence.selected;

  if (mainOccurrence.selected) {
    console.log(`Dodavanje povezanih događaja za: ${mainOccurrence.id}`);
    mainOccurrence.occurrences.forEach((occurrence: any) => {
      const alreadyExists = this.selectedEvents.some(e => e.id === occurrence.id);
      if (!alreadyExists) {
        console.log(`Dodavanje događaja: ${occurrence.id}`);
        this.selectedEvents.push(occurrence);
      } else {
        console.log(`Događaj već dodan: ${occurrence.id}`);
      }
    });
  } else {
    console.log(`Uklanjanje povezanih događaja za: ${mainOccurrence.id}`);
    mainOccurrence.occurrences.forEach((occurrence: any) => {
      console.log(`Uklanjanje događaja: ${occurrence.id}`);
      this.selectedEvents = this.selectedEvents.filter(e => e.id !== occurrence.id);
    });
  }
  console.log('Konačni izabrani događaji:', this.selectedEvents.map(e => e.id));
}

sendInvitesForSelectedEvents(): void {
  const username = this.authService.getUsername();
  if (this.selectedEvents.length === 0) {
    alert('Nema izabranih događaja.');
    return;
  }

  this.isLoading = true;
  console.log(username);
  this.userService.getUserByUsername(username).subscribe(user => {
    const userEmail = user.email;

    const invitePromises = this.selectedEvents.map(event => {
      if (!event.isMainEvent) {
        const eventDetails = {
          id: event.id,
          startTime: this.getEndTime(event.startTime).toISOString(),
          endTime: this.getEndTime(event.endTime).toISOString(),
          summary: event.summary,
          description: event.description,
          location: event.location,
          recurrence: event.recurrence,
          inviteLink: event.htmlLink
        };
        console.log("Slanje poziva za događaj:", eventDetails);
        console.log("E-mail za poziv:", userEmail);
        return this.addParticipantToEvent(eventDetails, userEmail);
      }
    });

    Promise.all(invitePromises)
      .then(() => {
        this.isLoading = false;
        alert('Pozivi su uspešno poslati');
        this.toggleModal();
      })
      .catch((error) => {
        console.error('Greška pri slanju poziva:', error);
        this.isLoading = false;
        alert('Neuspelo slanje nekih poziva. Pokušajte ponovo.');
      });
  }, error => {
    console.error('Greška pri preuzimanju e-maila korisnika:', error);
    alert('Neuspešno slanje poziva zbog greške u preuzimanju e-maila.');
    this.isLoading = false;
  });
}

getWeeks(programDuration: string): number {
  switch (programDuration) {
    case 'DVE_NEDELJE':
      return 4;
    case 'ČETIRI_NEDELJE':
      return 8;
    case 'DVANAEST_NEDELJA':
      return 12;
    default:
      return 0;
  }
}


getEndTime(appointmentTime: Date): Date {
  const endTime = new Date(appointmentTime);
  endTime.setHours(endTime.getHours() + 1);
  return endTime;
}

addParticipantToEvent(eventDetails: any, userEmail: string): void {
  const calendarId = 'fitnesscenter.soh@gmail.com';
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventDetails.id}`;

  const token = gapi.client.getToken();
  if (!token) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  }

  const accessToken = token.access_token;
  console.log("Token za pristup:", accessToken);

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  });

  this.http.get(apiUrl, { headers }).subscribe({
    next: (response: any) => {
      const updatedAttendees = response.attendees || [];
      updatedAttendees.push({ email: userEmail });

      const updatedEvent = {
        ...response,
        attendees: updatedAttendees
      };

      this.http.put(apiUrl, updatedEvent, { headers }).subscribe({
        next: (updateResponse) => {
          console.log('Događaj je uspešno ažuriran:', updateResponse);
        },
        error: (updateErr) => {
          console.error('Greška pri ažuriranju događaja:', updateErr);
        }
      });
    },
    error: (fetchErr) => {
      console.error('Greška pri preuzimanju događaja:', fetchErr);
    }
  });
}

requestToken() {
  return tokenClient.requestAccessToken({ prompt: "consent" });
}

toggleShowAllOccurrences(): void {
  this.showAllOccurrences = !this.showAllOccurrences;
}
}
