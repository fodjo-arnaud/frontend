import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { AssignmentsComponent } from './components/assignments/assignments';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  { path: '', component: LoginComponent },

  {
    path: 'assignments',
    component: AssignmentsComponent,
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

  {
    path: 'assignment/:id',
    component: AssignmentDetailComponent,
    canActivate: [authGuard]
  }

];
