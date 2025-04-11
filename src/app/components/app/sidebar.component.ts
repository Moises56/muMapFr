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
      <!-- Toggle Button - Fixed position for mobile -->
      <button
        (click)="toggleSidebar()"
        class="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg lg:hidden transition-all duration-300 ease-in-out"
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
        class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl lg:translate-x-0"
      >
        <div class="h-full px-3 py-4 overflow-y-auto">
          <div class="flex items-center justify-center mb-8 mt-6">
            <div class="p-2 bg-blue-600 rounded-lg shadow-lg">
              <span class="text-xl font-bold text-white tracking-wider">muMap</span>
            </div>
          </div>
          
          <div class="px-4 py-2 mb-4">
            <div *ngIf="(currentUser$ | async) as user" class="flex items-center space-x-3 mb-4 bg-gray-700 bg-opacity-40 p-3 rounded-lg">
              <div class="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                {{user.nombre?.charAt(0)}}{{user.apellido?.charAt(0)}}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-white">{{user.nombre}} {{user.apellido}}</span>
                <span class="text-xs text-gray-300">{{user.rol}}</span>
              </div>
            </div>
          </div>
          
          <nav class="space-y-2 px-2">
            <a [routerLink]="['/dashboard']" 
               class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
               [ngClass]="{
                 'bg-blue-600 text-white shadow-md': isActive('/dashboard'),
                 'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/dashboard')
               }">
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </a>

            <!-- Mi Historial (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'OPERADOR'">
              <a [routerLink]="['/my-locations']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-blue-600 text-white shadow-md': isActive('/my-locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/my-locations')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Mi Historial</span>
              </a>
            </ng-container>

            <!-- Historial de Ubicaciones (solo para admin/moderator) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
              <a [routerLink]="['/locations']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-blue-600 text-white shadow-md': isActive('/locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/locations')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Historial de Ubicaciones</span>
              </a>
            </ng-container>

            <!-- Enviar Ubicación (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'OPERADOR'">
              <a [routerLink]="['/location']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-blue-600 text-white shadow-md': isActive('/location'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/location')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Enviar Ubicación</span>
              </a>
            </ng-container>

            <!-- Usuarios (solo para admin) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'ADMIN'">
              <a [routerLink]="['/users']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-blue-600 text-white shadow-md': isActive('/users'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/users')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Usuarios</span>
              </a>
            </ng-container>

            <!-- Logs (solo para admin) -->
            <ng-container *ngIf="(currentUser$ | async)?.rol === 'ADMIN'">
              <a [routerLink]="['/logs']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-blue-600 text-white shadow-md': isActive('/logs'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/logs')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Logs</span>
              </a>
            </ng-container>
          </nav>
          
          <div class="px-2 mt-8 pt-4 border-t border-gray-700">
            <button
              (click)="logout()"
              class="flex w-full items-center px-4 py-3 text-base font-medium rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay - Only visible on mobile when sidebar is open -->
      <div
        *ngIf="isOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
      ></div>
    </div>
  `,
  styles: [`
    @media (min-width: 1024px) {
      .main-content {
        margin-left: 16rem; /* 64px for sidebar */
      }
    }
  `]
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
    // En dispositivos móviles, el sidebar comienza cerrado
    if (typeof window !== 'undefined') {
      this.isOpen = window.innerWidth >= 1024;

      // Escuchar cambios de tamaño de ventana para ajustar el sidebar
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
          this.isOpen = true;
        } else {
          this.isOpen = false;
        }
      });
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.authService.logout();
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}