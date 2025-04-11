import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
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
      <!-- Botón del sidebar mejorado - Ahora con animación y mejor posicionado -->
      <button
        (click)="toggleSidebar()"
        [ngClass]="{
          'translate-x-64': isOpen && !isMobile,
          'rotate-180': isOpen && isMobile
        }"
        class="p-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg transition-all duration-300 ease-in-out fixed top-5 left-5 z-50 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 transition-transform duration-300"
          [ngClass]="{'rotate-180': isOpen && !isMobile}"
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
      </button>

      <!-- Sidebar mejorado -->
      <aside
        [class.translate-x-0]="isOpen"
        [class.-translate-x-full]="!isOpen"
        class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl"
      >
        <div class="h-full flex flex-col">
          <!-- Logo y Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-700">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-cyan-600 rounded-lg shadow-lg">
                <span class="text-xl font-bold text-white tracking-wider">muMap</span>
              </div>
            </div>
            <!-- Botón de cierre solo visible en móvil -->
            <button 
              (click)="toggleSidebar()" 
              class="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-700 lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Perfil de usuario -->
          <div class="px-5 py-4">
            <div *ngIf="(currentUser$ | async) as user" class="flex items-center space-x-3 p-4 rounded-lg bg-gray-800 border border-gray-700 shadow-inner">
              <div class="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-md">
                {{user.nombre.charAt(0)}}{{user.apellido.charAt(0)}}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-white">{{user.nombre}} {{user.apellido}}</span>
                <span 
                  [ngClass]="{
                    'text-cyan-300': user.rol === 'ADMIN',
                    'text-green-300': user.rol === 'MODERATOR',
                    'text-amber-300': user.rol === 'OPERADOR'
                  }"
                  class="text-xs font-medium">
                  {{user.rol}}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Navegación - Scroll independiente -->
          <nav class="flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            <a [routerLink]="['/dashboard']" 
               class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
               [ngClass]="{
                 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/dashboard'),
                 'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/dashboard')
               }">
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </a>

            <!-- Mi Historial (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async) as user">
              <a *ngIf="user.rol === 'OPERADOR'" [routerLink]="['/my-locations']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/my-locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/my-locations')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Mi Historial</span>
              </a>
            </ng-container>

            <!-- Historial de Ubicaciones (solo para admin/moderator) -->
            <ng-container *ngIf="(currentUser$ | async) as user">
              <a *ngIf="user.rol !== 'OPERADOR'" [routerLink]="['/locations']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/locations'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/locations')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Historial de Ubicaciones</span>
              </a>
            </ng-container>

            <!-- Enviar Ubicación (solo para operadores) -->
            <ng-container *ngIf="(currentUser$ | async) as user">
              <a *ngIf="user.rol === 'OPERADOR'" [routerLink]="['/location']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/location'),
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
            <ng-container *ngIf="(currentUser$ | async) as user">
              <a *ngIf="user.rol === 'ADMIN'" [routerLink]="['/users']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/users'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/users')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Usuarios</span>
              </a>
            </ng-container>

            <!-- Logs (solo para admin) -->
            <ng-container *ngIf="(currentUser$ | async) as user">
              <a *ngIf="user.rol === 'ADMIN'" [routerLink]="['/logs']" 
                 class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group"
                 [ngClass]="{
                   'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md': isActive('/logs'),
                   'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive('/logs')
                 }">
                <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Logs</span>
              </a>
            </ng-container>
          </nav>
          
          <!-- Footer con botón de cerrar sesión -->
          <div class="px-3 py-4 border-t border-gray-700 mt-auto">
            <button
              (click)="logout()"
              class="flex w-full items-center px-4 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 shadow-md transition-colors duration-200"
            >
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
            <div class="text-center mt-4 text-xs text-gray-400">
              © 2025 muMap - v1.0
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay mejorado con animación -->
      <div
        *ngIf="isOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Estilos para scrollbar personalizado */
    .scrollbar-thin::-webkit-scrollbar {
      width: 5px;
    }
    
    .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
      background: #4B5563;
      border-radius: 5px;
    }
    
    .scrollbar-track-gray-800::-webkit-scrollbar-track {
      background: #1F2937;
    }

    @media (min-width: 1024px) {
      .main-content {
        margin-left: 16rem;
        transition: margin-left 0.3s ease-in-out;
      }
      
      /* Cuando el sidebar está cerrado */
      .sidebar-collapsed .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isOpen = false;
  isMobile = false;
  currentUser$: Observable<User | null>;
  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      // Detectar si estamos en móvil
      this.isMobile = window.innerWidth < 1024;
      
      // Establecer estado inicial del sidebar (cerrado en móvil, abierto en escritorio)
      this.isOpen = !this.isMobile;
      this.sidebarToggled.emit(this.isOpen);

      // Escuchar cambios de tamaño de ventana
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  handleResize() {
    const isMobileNow = window.innerWidth < 1024;
    
    // Solo actualizamos si el estado de "isMobile" cambió
    if (this.isMobile !== isMobileNow) {
      this.isMobile = isMobileNow;
      
      // En móvil, siempre cerramos el sidebar al cambiar a vista móvil
      if (this.isMobile && this.isOpen) {
        this.isOpen = false;
        this.sidebarToggled.emit(false);
      }
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.sidebarToggled.emit(this.isOpen);
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