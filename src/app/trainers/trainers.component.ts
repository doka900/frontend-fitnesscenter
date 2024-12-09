import { Component, OnInit } from '@angular/core';
import { UserService } from '../.service/user.service'; 
import { AuthService } from '../.service/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../.service/program.service';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class TrainersComponent implements OnInit {
  users: any[] = []; 
  trainers: any[] = []; 
  isPromoteDropdownOpen = false;
  isDemoteDropdownOpen = false;

  constructor(private userService: UserService, private authService: AuthService, private programService: ProgramService) {}

  ngOnInit(): void {
    this.loadTrainers();
 
  }

 
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((data: any) => {
      this.users = data.filter((user: any) => {
        console.log(this.users)
        const isTrainerInList = this.trainers.some((trainer: any) => trainer.username === user.username);
        return user.role !== 'ADMIN' && user.type !== 'Trainer' && !isTrainerInList;
      });
      
      
    });
  }

  loadTrainers(): void {
    this.userService.findTrainers().subscribe(
      (data: any[]) => {
        this.trainers = data
        console.log(this.trainers);
        this.loadUsers();
      },
      (error: any) => {
        console.error('Greška pri učitavanju trenera:', error);
      }
    );
  }

  togglePromoteDropdown(): void {
    this.isPromoteDropdownOpen = !this.isPromoteDropdownOpen;
  }

  toggleDemoteDropdown(): void {
    this.isDemoteDropdownOpen = !this.isDemoteDropdownOpen;
  }


  promoteToTrainer(username: string): void {
    const userDTO = { type: 'Trainer' };
    this.userService.updateUser(userDTO, username).subscribe(() => {
      alert(`${username} je uspešno pretvoren u trenera.`);
      this.isPromoteDropdownOpen = false;
      this.isDemoteDropdownOpen = false;
      this.loadUsers(); 
      this.loadTrainers();

    });
  }

demoteToUser(username: string): void {
  this.programService.getProgramsByUsername(username).subscribe(
    (programs: any[]) => {
      if (programs.length > 0) {
        alert(`${username} ne može biti pretvoren u korisnika jer dodeljen programima.`);
      } else {
       
        const userDTO = { type: 'User' }; 
        this.userService.updateUser(userDTO, username).subscribe(() => {
          alert(`${username} je uspešno pretvoren u korisnika.`);
          this.isPromoteDropdownOpen = false;
          this.isDemoteDropdownOpen = false;
          this.loadUsers(); 
          this.loadTrainers();
        });
      }
    },
    (error: any) => {
      console.error('Greška pri proveri programa trenera:', error);
      alert('Došlo je do greške prilikom provere programa trenera.');
    }
  );
}

}
