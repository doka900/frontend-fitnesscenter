import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private facilitiesUrl = this.config.facility_url;
  private facilitySpacesUrl = this.config.facility_spaces_url;
  someStringValue: boolean = true; 
  constructor(private http: HttpClient, private authService: AuthService, private config: ConfigService) {}


  getFacilities(): Observable<any[]> {
    return this.http.get<any[]>(this.facilitiesUrl);
  }


  createFacility(facility: any): Observable<any> {
    const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.authService.getToken(), 
        'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(this.facilitiesUrl, facility, { headers });
}

  updateFacility(id: number, facility: any): Observable<any> {
    const headers = this.createAuthorizationHeader(); 
    return this.http.put<any>(`${this.facilitiesUrl}update/${id}/`, facility, { headers });
  }


  deleteFacility(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader(); 
    return this.http.delete<any>(`${this.facilitiesUrl}${id}/`, { headers });
  }


  private createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.getToken(),
      'Content-Type': 'application/json'
    });
  }

  getFacilityTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.facilitiesUrl}types/`);
  }
  getFacilitySpaceTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.facilitySpacesUrl}types/`);
  }



  getFacilityById(facilityId: number): Observable<any> {
    return this.http.get(`${this.facilitiesUrl}${facilityId}/`);
  }

  getFacilitySpaces(facilityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.facilitySpacesUrl}${facilityId}/`);
  }
  addRoom(roomData: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.facilitySpacesUrl}`, roomData, {headers});
  }

  updateRoom(roomId: number, roomData: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.facilitySpacesUrl}update/${roomId}/`, roomData, {headers});
  }

  deleteRoom(roomId: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.facilitySpacesUrl}${roomId}/`, {headers});
  }



}
