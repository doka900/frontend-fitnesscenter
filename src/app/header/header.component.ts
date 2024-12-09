import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../.service/user.service';
import { User } from '../.model/userRegister.model';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  username: string;
  isDropdownOpen = false;
  isUserTrainer = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.username = this.authService.getUsername();
  }
  ngOnInit() {
    this.checkIfTrainer();
    console.log( this.checkIfTrainer())
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  checkIfTrainer(): void {
    const username = this.authService.getUsername();
    this.userService.isTrainer(username).subscribe({
      next: (isTrainer) => {
        this.isUserTrainer = isTrainer;
        
      },
      error: (err) => console.error('Greška prilikom provere statusa trenera.', err),
    });
    console.log()
  }
  
  
  isLoggedIn(): boolean {
    return this.authService.tokenIsPresent();
  }

  logout(): void {
    this.authService.logout();
  }

  openProfile(username: string) {
    this.router.navigate(['/profile-page', username]);
  }




}
