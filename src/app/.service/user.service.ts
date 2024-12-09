import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl = this.config.users_url;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private http: HttpClient
  ) {}
  
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userUrl}getAll/`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.userUrl}${id}/`);
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.userUrl}username/${username}/`);
  }

  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.userUrl}register/`, user);
  }

  updateUser(user: any, username: string): Observable<any> {
    return this.http.put<any>(`${this.userUrl}${username}/`, user);
  }
  
  changePassword(newPassword: string, username: string): Observable<any> {
    return this.http.put<any>(`${this.userUrl}changePassword/${username}/`, newPassword);
  }


  verifyOldPassword(password: string, username: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.userUrl}oldPasswordVerification/${username}/`, password);
  }

  
  deleteUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.userUrl}${id}/`);
  }
  
  isTrainer(username: string): Observable<boolean> {
    const cachedTrainerStatus = localStorage.getItem(`isTrainer_${username}`);
    if (cachedTrainerStatus) {
      return of(cachedTrainerStatus === 'true');
    }

    return this.findTrainers().pipe(
      map((trainers: any[]) => trainers.some(trainer => trainer.username === username)),
      tap((isTrainer) => localStorage.setItem(`isTrainer_${username}`, isTrainer.toString())),
      catchError((err) => {
        console.error('Error fetching trainers:', err);
        return of(false);
      })
    );
  }

  findTrainers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userUrl}trainers/`);
  }

}



