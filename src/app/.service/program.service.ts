import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service'; // Ensure the path is correct

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private programsUrl: string;

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private config: ConfigService
  ) {
    this.programsUrl = this.config.program_url;
  }

  getPrograms(): Observable<any[]> {
    return this.http.get<any[]>(this.programsUrl);
  }
  getProgramById(id: number): Observable<any> {
    return this.http.get<any>(`${this.programsUrl}${id}/`);
  }

  getProgramsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.programsUrl}user/id/${userId}/`);
  }

  getProgramsByUsername(username: String): Observable<any[]> {
    return this.http.get<any[]>(`${this.programsUrl}user/username/${username}/`);
  }

  createProgram(program: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.getToken(),
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.programsUrl, program, { headers });
  }

  addParticipant(programId: number, username: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.programsUrl}${programId}/user/${username}/`;
    return this.http.post(url, {}, { headers }); 
  }

 
  updateProgram(program: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.getToken(),
      'Content-Type': 'application/json'
    });
  
    return this.http.put<any>(`${this.programsUrl}update/${id}/`, program, { headers });
  }
  


  deleteProgram(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.delete<any>(`${this.programsUrl}${id}/`, { headers });
  }

 
  private createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.getToken(),
      'Content-Type': 'application/json'
    });
  }
}
