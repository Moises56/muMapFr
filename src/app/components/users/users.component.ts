import { Component, inject, OnInit } from '@angular/core';
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
      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Top Navigation -->
          <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex">
                  <div class="flex-shrink-0 flex items-center">
                    <h1 class="text-xl font-bold text-gray-900">muMap</h1>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-gray-700">
                        {{ (currentUser$ | async)?.nombre }}
                        {{ (currentUser$ | async)?.apellido }}
                      </span>
                      <span
                        [ngClass]="{
                          'bg-green-100 text-green-800':
                            (currentUser$ | async)?.rol === 'ADMIN',
                          'bg-blue-100 text-blue-800':
                            (currentUser$ | async)?.rol === 'MODERATOR',
                          'bg-yellow-100 text-yellow-800':
                            (currentUser$ | async)?.rol === 'OPERADOR'
                        }"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
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
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                  <h2 class="text-lg font-medium text-gray-900">
                    Gestión de Usuarios
                  </h2>
                </div>
                <div class="border-t border-gray-200">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Usuario
                          </th>
                          <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Contacto
                          </th>
                          <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Rol
                          </th>
                          <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Estado
                          </th>
                          <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let user of users" class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">
                                  {{ user.nombre }} {{ user.apellido }}
                                </div>
                                <div class="text-sm text-gray-500">
                                  {{ user.nombreUsuario }}
                                </div>
                                <div class="text-sm text-gray-500">
                                  {{ user.identidad }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">
                              {{ user.correo }}
                            </div>
                            <div class="text-sm text-gray-500">
                              {{ user.telefono }}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span
                              [ngClass]="{
                                'bg-green-100 text-green-800':
                                  user.rol === 'ADMIN',
                                'bg-blue-100 text-blue-800':
                                  user.rol === 'MODERATOR',
                                'bg-yellow-100 text-yellow-800':
                                  user.rol === 'OPERADOR'
                              }"
                              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            >
                              {{ user.rol }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span
                              [ngClass]="{
                                'bg-green-100 text-green-800': user.estado,
                                'bg-red-100 text-red-800': !user.estado
                              }"
                              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            >
                              {{ user.estado ? 'Activo' : 'Inactivo' }}
                            </span>
                          </td>
                          <td
                            class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          >
                            <button
                              (click)="editUser(user)"
                              class="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              (click)="toggleUserStatus(user)"
                              [ngClass]="{
                                'text-red-600 hover:text-red-900': user.estado,
                                'text-green-600 hover:text-green-900':
                                  !user.estado
                              }"
                            >
                              {{ user.estado ? 'Desactivar' : 'Activar' }}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <!-- Pagination -->
                <div
                  class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                >
                  <div class="flex-1 flex justify-between sm:hidden">
                    <button
                      (click)="previousPage()"
                      [disabled]="!meta?.hasPreviousPage"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <button
                      (click)="nextPage()"
                      [disabled]="!meta?.hasNextPage"
                      class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div
                    class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
                  >
                    <div>
                      <p class="text-sm text-gray-700">
                        Mostrando
                        <span class="font-medium">{{
                          meta ? (meta.page - 1) * meta.limit + 1 : 0
                        }}</span>
                        a
                        <span class="font-medium">{{
                          meta
                            ? window.Math.min(
                                meta.page * meta.limit,
                                meta.total
                              )
                            : 0
                        }}</span>
                        de
                        <span class="font-medium">{{ meta?.total || 0 }}</span>
                        resultados
                      </p>
                    </div>
                    <div>
                      <nav
                        class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          (click)="previousPage()"
                          [disabled]="!meta?.hasPreviousPage"
                          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span class="sr-only">Anterior</span>
                          <svg
                            class="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          (click)="nextPage()"
                          [disabled]="!meta?.hasNextPage"
                          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span class="sr-only">Siguiente</span>
                          <svg
                            class="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [],
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
  window = window;

  constructor() {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.rol === 'ADMIN') {
        this.userService.getUsers(this.currentPage, this.limit).subscribe({
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
          }
        });
      }
    });
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

  editUser(user: User) {
    // Implementar lógica de edición
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: User) {
    const newStatus = !user.estado;
    this.userService.updateUser(user.id, { estado: newStatus }).subscribe({
      next: () => {
        user.estado = newStatus;
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      },
    });
  }
}
