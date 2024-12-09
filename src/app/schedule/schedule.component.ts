import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../.service/auth.service'; 
import { UserService } from '../.service/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class ScheduleComponent implements OnInit {
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
    const username = this.authService.getUsername();
    this.userService.getUserByUsername(username).subscribe(user => {
      const calendarId = user.email;
      const calendarSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Europe/Belgrade`;
      this.calendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(calendarSrc);
    });
  }
}
