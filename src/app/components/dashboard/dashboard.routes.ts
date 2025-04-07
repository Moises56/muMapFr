import { Routes } from '@angular/router';
import { adminGuard } from '../../guards/admin.guard';
import { moderatorGuard } from '../../guards/moderator.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'location',
    pathMatch: 'full'
  },
  {
    path: 'location',
    loadComponent: () => import('../location/location.component').then(m => m.LocationComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('../logs/logs.component').then(m => m.LogsComponent),
    canActivate: [moderatorGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('../users/users.component').then(m => m.UsersComponent),
    canActivate: [adminGuard]
  }
]; 