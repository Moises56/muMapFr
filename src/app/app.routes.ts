// src/app/routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LocationComponent } from './components/location/location.component';
import { LogsComponent } from './components/logs/logs.component';
import { UsersComponent } from './components/users/users.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'location', 
    component: LocationComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'logs', 
    component: LogsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
