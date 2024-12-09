import { Routes } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component'; 
import { HomeComponent } from './home/home.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { AdminGuard } from './admin.guard';
import { FacilityCardComponent } from './facility-card/facility-card.component';
import { FacilitySpacesComponent } from './facility-spaces/facility-spaces.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FacilityDetailComponent } from './facility-detail/facility-detail.component';
import { ProgramsComponent } from './programs/programs.component';
import { ProgramPageComponent } from './program-page/program-page.component';
import { FooterComponent } from './footer/footer.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ProgramsScheduleComponent } from './programs-schedule/programs-schedule.component';
import { TrainersComponent } from './trainers/trainers.component';

export const routes: Routes = [
    
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'facilities', component: FacilitiesComponent, canActivate: [AdminGuard] },
    { path: 'facility/:id/spaces', component: FacilitySpacesComponent, canActivate: [AdminGuard] },
    { path: 'profile-page/:username',component :UserProfileComponent },
    { path: 'facility/:id', component: FacilityDetailComponent },
    { path: 'programs', component: ProgramsComponent, canActivate: [AdminGuard] },
    { path: 'programs-page', component: ProgramPageComponent},
    { path: 'schedule', component: ScheduleComponent},
    { path: 'programs-schedule', component: ProgramsScheduleComponent},
    { path: 'trainers', component: TrainersComponent, canActivate: [AdminGuard]}
];







