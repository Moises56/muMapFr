import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Toggle Button -->
      <button
        (click)="toggleSidebar()"
        class="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <svg
          *ngIf="!isOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          *ngIf="isOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Sidebar -->
      <aside
        [class.translate-x-0]="isOpen"
        [class.-translate-x-full]="!isOpen"
        class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out bg-gray-800"
      >
        <div class="h-full px-3 py-4 overflow-y-auto">
          <div class="mb-5 mt-10">
            <span class="text-xl font-semibold text-white">muMap</span>
          </div>
          
          <nav class="mt-5 flex-1 px-2 space-y-1">
            <a [routerLink]="['/dashboard']" 
               class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
               [ngClass]="{
                 'bg-gray-900 text-white': isActive('/dashboard'),
                 'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/dashboard')
               }">
              <svg class="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>

            <!-- Mi Historial (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'OPERADOR'">
              <a [routerLink]="['/my-locations']" 
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
                 [ngClass]="{
                   'bg-gray-900 text-white': isActive('/my-locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/my-locations')
                 }">
                <svg class="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Mi Historial
              </a>
            </ng-container>

            <!-- Historial de Ubicaciones (solo para admin/moderator) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
              <a [routerLink]="['/locations']" 
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
                 [ngClass]="{
                   'bg-gray-900 text-white': isActive('/locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/locations')
                 }">
                <svg class="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Historial de Ubicaciones
              </a>
            </ng-container>

            <!-- Enviar Ubicación (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'OPERADOR'">
              <a [routerLink]="['/location']" 
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
                 [ngClass]="{
                   'bg-gray-900 text-white': isActive('/location'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/location')
                 }">
                <svg class="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Enviar Ubicación
              </a>
            </ng-container>

            <!-- Usuarios (solo para admin) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'ADMIN'">
              <a [routerLink]="['/users']" 
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
                 [ngClass]="{
                   'bg-gray-900 text-white': isActive('/users'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/users')
                 }">
                <svg class="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios
              </a>
            </ng-container>
          </nav>

          <li *ngIf="(currentUser$ | async)?.rol === 'ADMIN'">
            <a
              routerLink="/logs"
              routerLinkActive="bg-gray-700"
              class="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 group"
            >
              <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"/>
                <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"/>
              </svg>
              <span class="ml-3">Logs</span>
            </a>
          </li>
          <li>
            <button
              (click)="logout()"
              class="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 group w-full"
            >
              <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h11m0 0-4-4m4 4-4 4m-5 3H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h3"/>
              </svg>
              <span class="ml-3">Cerrar Sesión</span>
            </button>
          </li>
        </div>
      </aside>

      <!-- Overlay -->
      <div
        *ngIf="isOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
      ></div>
    </div>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isOpen = false;
  currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // En móvil, el sidebar comienza cerrado
    if (window.innerWidth < 768) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.authService.logout();
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, true);
  }
} 