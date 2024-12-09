import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../.service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserResponse } from '../.model/userLogin.model';
import { UserService } from '../.service/user.service';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
      password: ['', [Validators.required, Validators.pattern(/^[^';"\\]+$/)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    this.errorMessage = '';
    this.isSubmitting = true;
  
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (result) => {
          if (result) {
            console.log('Prijava uspešna');
            this.router.navigate(['/home']);
          }
        },
        error: (error: { message: string }) => {
          if (error.message === 'Http failure response for http://localhost:4200/api/user/login/: 401 Unauthorized') {
            this.errorMessage = "Molimo proverite vaš email.";
          } else {
            this.errorMessage = "Pogrešni podaci.";
          }
          console.error('Greška prilikom prijave:', error.message);
        },
      });
    } else {
      this.errorMessage = 'Molimo popunite sva obavezna polja ispravno.';
    }
  }
}


