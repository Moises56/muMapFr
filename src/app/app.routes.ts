// src/app/routes.ts
import { Routes } from '@angular/router';
import { LocationInputComponent } from './components/location-input/location-input.component';
import { MapComponent } from './components/map/map.component';

export const routes: Routes = [
  {
    path: 'input', // URL: /input
    component: LocationInputComponent,
    title: 'Add Location', // Optional: Sets the page title
  },
  {
    path: 'dashboard', // URL: /dashboard
    component: MapComponent,
    title: 'Location Dashboard', // Optional: Sets the page title
  },
  {
    path: '', // Default route
    redirectTo: '/input', // Redirects to /input when accessing the root
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for 404
    redirectTo: '/input', // Could also point to a 404 component if you create one
  },
];
