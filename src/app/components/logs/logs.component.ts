import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService, Log, LogResponse } from '../../services/log.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../app/sidebar.component';
import { User } from '../../interfaces/auth.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="flex flex-col lg:flex-row">
        <!-- Sidebar -->
        <app-sidebar (sidebarToggled)="onSidebarToggle($event)"></app-sidebar>

        <!-- Main Content -->
        <div class="flex-1 transition-all duration-300 ease-in-out" 
            [ngClass]="{
              'lg:ml-64': sidebarOpen,
              'lg:ml-0': !sidebarOpen
            }">
          <!-- Top Navigation -->
          <nav class="bg-white shadow-md sticky top-0 z-10">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <div class="flex-shrink-0 flex items-center ml-10 lg:ml-0">
                    <h1 class="text-xl font-bold text-gray-900">Registro de Actividades</h1>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-gray-700 hidden sm:inline">
                        {{ (currentUser$ | async)?.nombre }} {{ (currentUser$ | async)?.apellido }}
                      </span>
                      <span [ngClass]="{
                        'bg-green-100 text-green-800': (currentUser$ | async)?.rol === 'ADMIN',
                        'bg-blue-100 text-blue-800': (currentUser$ | async)?.rol === 'MODERATOR',
                        'bg-yellow-100 text-yellow-800': (currentUser$ | async)?.rol === 'OPERADOR'
                      }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ (currentUser$ | async)?.rol }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <!-- Page Content -->
          <main class="py-6">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white shadow rounded-xl overflow-hidden">
                <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h2 class="text-lg font-medium text-gray-900">Registro de Actividades</h2>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-600">Vista:</span>
                    <button 
                      (click)="toggleView('table')" 
                      class="p-1.5 rounded-md transition-colors" 
                      [ngClass]="{'bg-blue-100 text-blue-800': viewMode === 'table', 'text-gray-500 hover:bg-gray-100': viewMode !== 'table'}"
                      title="Vista de tabla"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      (click)="toggleView('card')" 
                      class="p-1.5 rounded-md transition-colors" 
                      [ngClass]="{'bg-blue-100 text-blue-800': viewMode === 'card', 'text-gray-500 hover:bg-gray-100': viewMode !== 'card'}"
                      title="Vista de tarjetas"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Table View (Desktop) -->
                <div *ngIf="viewMode === 'table'" class="border-t border-gray-200">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">IP</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let log of logs" class="hover:bg-gray-50 transition-colors">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div>
                                <div class="text-sm font-medium text-gray-900">
                                  {{ log.user.nombre }} {{ log.user.apellido }}
                                </div>
                                <div class="text-xs text-gray-500">
                                  {{ log.user.nombreUsuario }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                              [ngClass]="{
                                'bg-green-100 text-green-800': log.accion === 'login' || log.accion === 'registro',
                                'bg-yellow-100 text-yellow-800': log.accion === 'actualización' || log.accion === 'ubicación',
                                'bg-red-100 text-red-800': log.accion === 'eliminación' || log.accion === 'error',
                                'bg-blue-100 text-blue-800': true
                              }">
                              {{ log.accion }}
                            </span>
                          </td>
                          <td class="px-6 py-4 hidden md:table-cell">
                            <div class="text-sm text-gray-900 line-clamp-2">{{ log.descripcion }}</div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {{ log.ip }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ log.timestamp | date:'medium' }}
                          </td>
                        </tr>
                        <tr *ngIf="logs.length === 0">
                          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                            No hay registros de actividad disponibles
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <!-- Card View (Mobile) -->
                <div *ngIf="viewMode === 'card'" class="border-t border-gray-200">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <div *ngFor="let log of logs" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div class="px-4 py-5 sm:px-6 border-b border-gray-100 bg-gray-50">
                        <div class="flex justify-between items-center">
                          <div class="flex flex-col">
                            <h3 class="text-sm font-medium text-gray-900 truncate">{{ log.user.nombre }} {{ log.user.apellido }}</h3>
                            <p class="text-xs text-gray-500">{{ log.user.nombreUsuario }}</p>
                          </div>
                          <span class="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full" 
                            [ngClass]="{
                              'bg-green-100 text-green-800': log.accion === 'login' || log.accion === 'registro',
                              'bg-yellow-100 text-yellow-800': log.accion === 'actualización' || log.accion === 'ubicación',
                              'bg-red-100 text-red-800': log.accion === 'eliminación' || log.accion === 'error',
                              'bg-blue-100 text-blue-800': true
                            }">
                            {{ log.accion }}
                          </span>
                        </div>
                      </div>
                      <div class="px-4 py-4 sm:px-6">
                        <div class="text-sm text-gray-700 mb-4 line-clamp-3">{{ log.descripcion }}</div>
                        <div class="flex flex-col space-y-2 text-xs">
                          <div class="flex justify-between">
                            <span class="text-gray-500">IP:</span>
                            <span class="font-medium text-gray-700">{{ log.ip }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500">Fecha:</span>
                            <span class="font-medium text-gray-700">{{ log.timestamp | date:'medium' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="logs.length === 0" class="col-span-full p-6 text-center text-gray-500">
                      No hay registros de actividad disponibles
                    </div>
                  </div>
                </div>
                
                <!-- Pagination -->
                <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div class="flex-1 flex justify-between">
                    <button
                      (click)="previousPage()"
                      [disabled]="!meta?.hasPreviousPage"
                      [ngClass]="{'opacity-50 cursor-not-allowed': !meta?.hasPreviousPage}"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <div class="hidden sm:block">
                      <p class="text-sm text-gray-700">
                        Mostrando
                        <span class="font-medium">{{ meta ? (meta.page - 1) * meta.limit + 1 : 0 }}</span>
                        a
                        <span class="font-medium">{{ meta ? window.Math.min(meta.page * meta.limit, meta.total) : 0 }}</span>
                        de
                        <span class="font-medium">{{ meta?.total || 0 }}</span>
                        resultados
                      </p>
                    </div>
                    <button
                      (click)="nextPage()"
                      [disabled]="!meta?.hasNextPage"
                      [ngClass]="{'opacity-50 cursor-not-allowed': !meta?.hasNextPage}"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Transition for the main content when sidebar opens/closes */
    .main-content {
      transition: margin-left 0.3s ease-in-out;
    }
    
    /* Tabla responsiva */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Cards con altura fija */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    /* Limitar texto en descripción */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
  meta: LogResponse['meta'] | null = null;
  currentPage = 1;
  limit = 10;
  currentUser$: Observable<User | null>;
  window = window;
  viewMode = 'table'; // Default view mode
  screenWidth: number = 0;
  sidebarOpen: boolean = false; // Estado del sidebar

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.setDefaultViewByScreenSize();
  }

  constructor(
    private logService: LogService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    this.setDefaultViewByScreenSize();
    this.loadLogs();
  }

  onSidebarToggle(isOpen: boolean) {
    this.sidebarOpen = isOpen;
  }

  setDefaultViewByScreenSize() {
    // Automáticamente usar cards en móvil y tabla en escritorio
    this.viewMode = this.screenWidth < 768 ? 'card' : 'table';
  }

  toggleView(mode: 'table' | 'card') {
    this.viewMode = mode;
  }

  loadLogs() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.rol === 'ADMIN') {
        this.logService.getLogs(this.currentPage, this.limit).subscribe({
          next: (response) => {
            this.logs = response.data;
            this.meta = response.meta;
          },
          error: (error) => {
            console.error('Error loading logs:', error);
          }
        });
      } else if (user) {
        this.logService.getUserLogs(user.id, this.currentPage, this.limit).subscribe({
          next: (response) => {
            this.logs = response.data;
            this.meta = response.meta;
          },
          error: (error) => {
            console.error('Error loading user logs:', error);
          }
        });
      }
    });
  }

  nextPage() {
    if (this.meta?.hasNextPage) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  previousPage() {
    if (this.meta?.hasPreviousPage) {
      this.currentPage--;
      this.loadLogs();
    }
  }
}