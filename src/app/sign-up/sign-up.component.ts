import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AuthService } from '../.service';

interface DisplayMessage {
  msgType: string;
  msgBody: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  returnUrl: string;
  submitted = false;
  notification: DisplayMessage | undefined;
  errorMessage: string = '';
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.pattern(/^[^';"\\]+$/), Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^';"\\]+$/)]],
      dateOfBirth: ['', [Validators.required, this.minimumAgeValidator(13)]],
      name: ['', [Validators.pattern(/^[^';"\\]+$/), Validators.required]],
      surname: ['', [Validators.pattern(/^[^';"\\]+$/), Validators.required]],
      display_name: ['', [Validators.pattern(/^[^';"\\]+$/), Validators.required]],
    });
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  ngOnInit() {}

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;
    if (this.signUpForm.valid) {
      this.authService.signup(this.signUpForm.value).subscribe({
        next: (result) => {
          if (result) {
            console.log('Registracija uspešna', result);
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          console.error('Greška prilikom registracije:', error.message);
        },
      });
    } else {
      this.errorMessage = 'Molimo popunite sva obavezna polja ispravno.';
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

  usernameValidator(control: AbstractControl) {
    return this.authService.validateUsernameNotTaken(control.value).pipe(
      debounceTime(300),
      distinctUntilChanged()
    );
  }

  emailValidator(control: AbstractControl) {
    return this.authService.validateEmailNotTaken(control.value).pipe(
      debounceTime(300),
      distinctUntilChanged()
    );
  }
}
