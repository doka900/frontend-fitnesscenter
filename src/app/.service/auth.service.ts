import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ConfigService } from './config.service';

interface UserResponse {
  accessToken?: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isTrainer(): boolean {
    throw new Error('Method not implemented.');
  }
  private access_token: string | undefined;

  constructor(
    private apiService: ApiService,
    private config: ConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

login(user: { username: string; password: string }): Observable<UserResponse | null> {
  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  return this.apiService.post(`${this.config.login_url}`, user, headers).pipe(
    map((data: UserResponse) => {
      if (data && data.accessToken) {
        localStorage.setItem('jwt', data.accessToken);
        this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl'] || '/home');
        return data;
      } else {
        throw new Error('Pristupni token nije primljen');
      }
    }),
    catchError((error) => {
      console.error('Puna greška:', error);

      let errorMessage = 'Prijava nije uspela. Molimo pokušajte ponovo.';

      if (error instanceof HttpErrorResponse) {
        console.error('Status greške:', error.status);
        console.error('Telo greške:', error.error);

        switch (error.status) {
          case 401:
            errorMessage = 'Molimo potvrdite svoj email pre prijave.';
            break;
          case 403:
            errorMessage = 'Pogrešni podaci. Pokušajte ponovo.';
            break;
          default:
            errorMessage = error.error?.message || 'Došlo je do nepoznate greške.';
        }
      } else {
        console.error('Neočekivana struktura greške:', error);
        errorMessage = error.message || 'Došlo je do neočekivane greške.';
      }

      return throwError(() => new Error(errorMessage));
    })
  );
}

  signup(user: any): Observable<any> {
    const signupHeaders = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });

    return this.apiService.post(this.config.signup_url, user, signupHeaders).pipe(
      map((response) => {
        console.log('Uspešna registracija:', response);
        this.router.navigate(['login']);
        alert("Registracija je uspešna. Molimo potvrdite vašu email adresu");
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Registracija nije uspela:', error);
        return throwError(() => new Error(error.error?.message || 'Korisničko ime ili email su već u upotrebi.'));
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigateByUrl('/home');
  }

  tokenIsPresent(): boolean {
    let token = this.getToken();
    return token != null;
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  getUsername(): string {
    let token = this.parseToken();

    if (token) {
      return token['sub'] || '';
    }
    return '';
  }

  private parseToken() {
    let jwt = localStorage.getItem('jwt');
    if (jwt !== null) {
      let jwtData = jwt.split('.')[1];
      let decodedJwtJsonData = atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      return decodedJwtData;
    }
    return null;
  }

  getUserRole(): string {
    const token = this.getToken();
    if (token) {
        const decodedToken = this.parseToken();
        return decodedToken?.role || '';
    }
    return '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  validateUsernameNotTaken(username: string): Observable<any> {
    return this.apiService.get(`/api/users/checkUsername/?username=${username}`).pipe(
      map(isTaken => isTaken ? { usernameTaken: true } : null)
    );
  }

  validateEmailNotTaken(email: string): Observable<any> {
    return this.apiService.get(`/api/users/checkEmail/?email=${email}`).pipe(
      map(isTaken => isTaken ? { emailTaken: true } : null)
    );
  }
}
