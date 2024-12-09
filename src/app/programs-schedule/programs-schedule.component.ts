import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { AuthService } from '../.service/auth.service'; 
import { UserService } from '../.service/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-programs-schedule',
  standalone: true,
  imports: [],
  templateUrl: './programs-schedule.component.html',
  styleUrl: './programs-schedule.component.css'
})
export class ProgramsScheduleComponent {
  calendarUrl: SafeResourceUrl = ''; 

  constructor(
    private authService: AuthService, 
    private http: HttpClient, 
    private userService: UserService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadUserCalendar();
  }

  loadUserCalendar(): void {

      const calendarId = 'fitnesscenter.soh@gmail.com';
      const calendarSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Europe/Belgrade`;
      this.calendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(calendarSrc);

  }
}
