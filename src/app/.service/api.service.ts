import { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpParams, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  private baseUrl: string = 'localhost:8080';

  constructor(private http: HttpClient) {}

  get(path: string, args?: any): Observable<any> {
    const options: { headers: HttpHeaders; params?: HttpParams } = {
      headers: this.headers,
    };
    if (args) {
      options.params = this.serialize(args);
    }
    return this.http.get(path, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  post(path: string, body: any, customHeaders?: HttpHeaders): Observable<any> {
    const headers = customHeaders || this.headers;
    return this.http.post(path, body, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put(path: string, body: any): Observable<any> {
    return this.request(path, body, RequestMethod.Put);
  }

  delete(path: string, body?: any): Observable<any> {
    return this.request(path, body, RequestMethod.Delete);
  }

  private request(
    path: string,
    body: any,
    method: RequestMethod = RequestMethod.Post,
    customHeaders?: HttpHeaders
  ): Observable<any> {
    const req = new HttpRequest(method, this.baseUrl + path, body, {
      headers: customHeaders || this.headers,
    });

    return this.http.request<HttpEvent<any>>(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          return event.body;
        }
        return null; 
      }),
      catchError(this.checkError.bind(this))
    );
  }

  private checkError(error: any): Observable<never> {
    console.error('API Error:', error);

    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    alert(errorMessage); 

    return throwError(error);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  private serialize(obj: any): HttpParams {
    let params = new HttpParams();

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !this.looseInvalid(obj[key])) {
        params = params.set(key, obj[key]);
      }
    }

    return params;
  }

  private looseInvalid(a: string | number): boolean {
    return a === '' || a === null || a === undefined;
  }
}
