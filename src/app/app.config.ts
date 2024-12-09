import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService } from './.service';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { firebaseConfig } from  '../firebase.config';
import { SafePipe } from './safe.pipe'
export const appConfig: ApplicationConfig = {
  providers: [
   provideRouter(routes),provideHttpClient(),
    AuthService,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
    SafePipe
  ]
};
