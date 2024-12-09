import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../.service/user.service';
import { AuthService } from '../.service/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../.model/userRegister.model';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  username: string = '';
  profileImageUrl: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {

    this.userForm = this.fb.group({
      username:  ['',  [Validators.pattern(/^[^';"\\]+$/)] ],
      email:  ['',  Validators.pattern(/^[^';"\\]+$/) ],
      name:  ['',  Validators.pattern(/^[^';"\\]+$/) ],
      surname:  ['',  Validators.pattern(/^[^';"\\]+$/) ],
      dateOfBirth: ['', [this.minimumAgeValidator(13),Validators.pattern(/^[^';"\\]+$/)]],
      displayName:  ['',  Validators.pattern(/^[^';"\\]+$/) ],
      description: ['',  Validators.pattern(/^[^';"\\]+$/) ],
      role: [{ value: '', disabled: true }],
    });

    
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/)
      ]],
      repeatNewPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    
    if (this.username!=null) {
      console.log(this.username)
      this.loadUserProfile();
    } else {
      console.error('Username is not defined. Please log in again.');
      this.router.navigate(['/login']);
    }
  }

  
  minimumAgeValidator(minAge: number) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const ageMonthDifference = today.getMonth() - birthDate.getMonth();
      const ageDayDifference = today.getDate() - birthDate.getDate();

      if (
        age < minAge || 
        (age === minAge && ageMonthDifference < 0) ||
        (age === minAge && ageMonthDifference === 0 && ageDayDifference < 0)
      ) {
        return { 'tooYoung': true };
      }
      return null;
    };
  }

  loadUserProfile(): void {
    
    this.userService.getUserByUsername(this.username).subscribe(
      (user: any) => {
        this.user = user;
        this.userForm.patchValue({
          
          username: user.username,
          email: user.email,
          name: user.name,
          surname: user.surname,
          dateOfBirth: new Date(user.dateOfBirth).toISOString().split('T')[0],
          displayName: user.displayName,
          description: user.description,
          role: user.role,
        });

        if (user.profileImage) {
          this.profileImageUrl = user.profileImage;
        } else {
          this.profileImageUrl = '';
        }
      },
      (error) => {
        console.error("Greška pri učitavanju korisničkog profila:", error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${this.username}`);

      if (this.selectedFile) {
        const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            
          },
          (error) => {
            console.error("Greška pri otpremanju datoteke:", error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              this.profileImageUrl = downloadURL;

              if (this.user) {
                const updatedUser: User = {
                  ...this.user,
                  profileImage: downloadURL,
                };

                this.userService.updateUser(updatedUser, this.username).subscribe(
                  () => {
                    alert("Profilna slika uspešno ažurirana.");
                  },
                  (error) => {
                    console.error("Greška pri ažuriranju URL-a profilne slike:", error);
                  }
                );
              }
            });
          }
        );
      }
    }
  }

  
  saveUserProfile(): void {
    if (this.userForm.valid && this.user) {
      const updatedUser: User = {
        ...this.user,
        ...this.userForm.getRawValue(),
      };

      this.userService.updateUser(updatedUser, this.username).subscribe(
        () => {
          alert("Profil uspešno ažuriran.");
        },
        (error) => {
          console.error("Greška pri ažuriranju profila:", error);
        }
      );
    }
  }

  
  changePassword(): void {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword, repeatNewPassword } = this.passwordForm.value;

      if (newPassword !== repeatNewPassword) {
        alert("Nove lozinke se ne poklapaju.");
        return;
      }
      if(oldPassword == newPassword){
        alert("Lozinka mora biti različita od stare.");
        return;
      }

      this.userService.verifyOldPassword(oldPassword, this.username).subscribe(
        (isValidOldPassword: boolean) => {
          if (isValidOldPassword) {
            this.userService.changePassword(newPassword, this.username).subscribe(
              () => {
                alert("Lozinka uspešno ažurirana.");
                this.passwordForm.reset();
              },
              (error) => {
                console.error("Greška pri ažuriranju lozinke:", error);
              }
            );
          } else {
            alert("Stara lozinka nije tačna.");
          }
        },
        (error) => {
          console.error("Greška pri proveri stare lozinke:", error);
        }
      );
    }
  }
}
