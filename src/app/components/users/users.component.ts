import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth.interface';
import { ToastrService } from 'ngx-toastr';
import { UserService, UserResponse } from '../../services/user.service';
import { SidebarComponent } from '../app/sidebar.component';

@Component({
  selector: 'app-users',
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
                    <h1 class="text-xl font-bold text-gray-900">Gestionar Usuarios</h1>
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
              <!-- Header with title and add button -->
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-medium text-gray-900">Gestión de Usuarios</h2>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600 hidden md:inline">Vista:</span>
                  <button 
                    (click)="toggleView('table')" 
                    class="p-1.5 rounded-md transition-colors" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'table', 'text-gray-500 hover:bg-gray-100': viewMode !== 'table'}"
                    title="Vista de tabla"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    (click)="toggleView('card')" 
                    class="p-1.5 rounded-md transition-colors" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'card', 'text-gray-500 hover:bg-gray-100': viewMode !== 'card'}"
                    title="Vista de tarjetas"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    (click)="addUser()" 
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ml-2"
                  >
                    <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span class="hidden sm:inline">Agregar</span>
                  </button>
                </div>
              </div>

              <!-- Search Filters -->
              <div class="flex flex-col md:flex-row gap-3 mb-6">
                <div class="w-full md:w-1/2">
                  <div class="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre..." 
                      class="px-4 py-2 border border-gray-300 rounded-md w-full focus:ring-cyan-500 focus:border-cyan-500"
                      [(ngModel)]="searchName"
                      (keyup.enter)="searchUsers()"
                    />
                    <button 
                      class="absolute right-2 top-2 text-gray-400 hover:text-gray-600" 
                      (click)="searchUsers()"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="w-full md:w-1/2">
                  <div class="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar por email..." 
                      class="px-4 py-2 border border-gray-300 rounded-md w-full focus:ring-cyan-500 focus:border-cyan-500"
                      [(ngModel)]="searchEmail"
                      (keyup.enter)="searchUsers()"
                    />
                    <button 
                      class="absolute right-2 top-2 text-gray-400 hover:text-gray-600" 
                      (click)="searchUsers()"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Users Table -->
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <!-- Table View (Desktop) -->
                <div *ngIf="viewMode === 'table'" class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-200">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let user of users" class="hover:bg-gray-100 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ user.id | slice:0:10 }}...
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.nombre }} {{ user.apellido }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">{{ user.correo }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': user.rol === 'ADMIN',
                              'bg-green-100 text-green-800': user.rol === 'MODERATOR',
                              'bg-yellow-100 text-yellow-800': user.rol === 'OPERADOR'
                            }"
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ user.rol }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex space-x-3">
                            <button 
                              (click)="editUser(user)" 
                              class="text-yellow-500 hover:text-yellow-700"
                              title="Editar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              (click)="deleteUser(user)" 
                              class="text-red-500 hover:text-red-700"
                              title="Eliminar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button 
                              (click)="editPermissions(user)" 
                              class="text-green-500 hover:text-green-700"
                              title="Editar permisos"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr *ngIf="users.length === 0">
                        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                          No hay usuarios disponibles
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Card View (Mobile) -->
                <div *ngIf="viewMode === 'card'" class="border-t border-gray-200">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <div *ngFor="let user of users" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div class="px-4 py-5 sm:px-6 border-b border-gray-100 bg-gray-50">
                        <div class="flex justify-between items-center">
                          <div class="flex items-center space-x-3">
                            <div class="bg-cyan-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                              {{user.nombre.charAt(0)}}{{user.apellido.charAt(0)}}
                            </div>
                            <div class="flex flex-col">
                              <h3 class="text-sm font-medium text-gray-900 truncate">{{ user.nombre }} {{ user.apellido }}</h3>
                              <p class="text-xs text-gray-500">{{ user.correo }}</p>
                            </div>
                          </div>
                          <span class="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full" 
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': user.rol === 'ADMIN',
                              'bg-green-100 text-green-800': user.rol === 'MODERATOR',
                              'bg-yellow-100 text-yellow-800': user.rol === 'OPERADOR'
                            }">
                            {{ user.rol }}
                          </span>
                        </div>
                      </div>
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex flex-col space-y-2 text-xs">
                          <div class="flex justify-between">
                            <span class="text-gray-500">ID:</span>
                            <span class="font-medium text-gray-700">{{ user.id | slice:0:10 }}...</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500">Usuario:</span>
                            <span class="font-medium text-gray-700">{{ user.nombreUsuario }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500">Teléfono:</span>
                            <span class="font-medium text-gray-700">{{ user.telefono || 'No disponible' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500">Estado:</span>
                            <span class="font-medium" [ngClass]="{
                              'text-green-600': user.estado,
                              'text-red-600': !user.estado
                            }">{{ user.estado ? 'Activo' : 'Inactivo' }}</span>
                          </div>
                        </div>
                        <div class="mt-4 flex justify-end space-x-2">
                          <button 
                            (click)="editUser(user)" 
                            class="p-1.5 rounded-md bg-yellow-50 text-yellow-500 hover:bg-yellow-100"
                            title="Editar usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            (click)="deleteUser(user)" 
                            class="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                            title="Eliminar usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button 
                            (click)="editPermissions(user)" 
                            class="p-1.5 rounded-md bg-green-50 text-green-500 hover:bg-green-100"
                            title="Editar permisos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="users.length === 0" class="col-span-full p-6 text-center text-gray-500">
                      No hay usuarios disponibles
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div class="flex-1 flex justify-between items-center">
                    <button
                      (click)="previousPage()"
                      [disabled]="!meta?.hasPreviousPage"
                      [ngClass]="{'opacity-50 cursor-not-allowed': !meta?.hasPreviousPage}"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <div class="text-sm text-gray-700">
                      Página {{ meta?.page || 1 }} de {{ meta?.totalPages || 1 }}
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
    
    /* Custom styles for inputs */
    input:focus {
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.25);
    }
    
    /* Limitar texto en descripción */
    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class UsersComponent implements OnInit {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  users: User[] = [];
  meta: UserResponse['meta'] | null = null;
  currentPage = 1;
  limit = 10;
  currentUser$ = this.authService.currentUser$;
  searchName: string = '';
  searchEmail: string = '';
  sidebarOpen: boolean = false;
  viewMode = 'table'; // Default view mode
  screenWidth: number = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.setDefaultViewByScreenSize();
  }

  constructor() {}

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    this.setDefaultViewByScreenSize();
    this.loadUsers();
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

  loadUsers() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.rol === 'ADMIN') {
        // Usar un objeto para los filtros en lugar de parámetros separados
        const filters = {
          nombre: this.searchName || undefined,
          correo: this.searchEmail || undefined
        };
        
        this.userService.getUsers(this.currentPage, this.limit, filters).subscribe({
          next: (response) => {
            this.users = response.data.map(user => ({
              ...user,
              updatedAt: new Date(user.updatedAt || new Date()),
              createdAt: new Date(user.createdAt),
              rol: user.rol as 'ADMIN' | 'MODERATOR' | 'OPERADOR'
            }));
            this.meta = response.meta;
          },
          error: (error) => {
            console.error('Error loading users:', error);
            this.toastr.error('Error al cargar usuarios', 'Error');
          }
        });
      }
    });
  }

  searchUsers() {
    this.currentPage = 1;
    this.loadUsers();
  }

  nextPage() {
    if (this.meta?.hasNextPage) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.meta?.hasPreviousPage) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  addUser() {
    // Implementar lógica para agregar usuario
    console.log('Agregar usuario');
  }

  editUser(user: User) {
    // Implementar lógica de edición
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    // Implementar lógica de eliminación
    console.log('Delete user:', user);
    if (confirm(`¿Estás seguro que deseas eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
      // Lógica para eliminar usuario
    }
  }

  editPermissions(user: User) {
    // Implementar lógica para editar permisos
    console.log('Edit permissions for user:', user);
  }
}
