import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Search and Add Button -->
      <div class="flex justify-between items-center">
        <div class="flex space-x-4">
          <div>
            <input
              type="text"
              [(ngModel)]="searchName"
              (ngModelChange)="filterUsers()"
              placeholder="Buscar por nombre..."
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              [(ngModel)]="searchEmail"
              (ngModelChange)="filterUsers()"
              placeholder="Buscar por email..."
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          (click)="addUser()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            class="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Agregar
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (user of filteredUsers; track user.id) {
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.rol }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  (click)="editUser(user)"
                  class="text-yellow-600 hover:text-yellow-800 mr-3"
                  title="Editar"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  (click)="deleteUser(user)"
                  class="text-red-600 hover:text-red-800 mr-3"
                  title="Eliminar"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                    ></path>
                  </svg>
                </button>
                <button
                  (click)="viewUser(user)"
                  class="text-green-600 hover:text-green-800"
                  title="Ver"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <button
          (click)="previousPage()"
          [disabled]="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-700">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button
          (click)="nextPage()"
          [disabled]="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class UsersComponent {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  users: User[] = [
    {
      id: '1772eac2-fd14-42b3-8767-030b6...',
      nombre: 'Marco Murillo',
      email: 'marco.murillo@amdc.hn',
      rol: 'USER',
    },
    {
      id: '2d3dC7fa-722c-4944-90bd-b916f...',
      nombre: 'Suscripciones',
      email: 'suscripcion@amdc.hn',
      rol: 'USER',
    },
    {
      id: '55fb678e-edab-43af-9954-5aba...',
      nombre: 'Moisés Avilés',
      email: 'moises.aviles@amdc.hn',
      rol: 'USER',
    },
    {
      id: '597cd8a6-5d0b-4fb6-ae85-4fcae...',
      nombre: 'Fransua Amaya',
      email: 'afgarciaa@eupn.fmed.hn',
      rol: 'USER',
    },
    {
      id: '6c/b64d7-c395-8fe0-b3d0-5cf0a...',
      nombre: 'Esterly Lagos',
      email: 'esterly.lagos@amdc.hn',
      rol: 'USER',
    },
    {
      id: '213500d5-8708-4150-509f-6fad...',
      nombre: 'Moisés',
      email: 'admin@amdc.hn',
      rol: 'ADMIN',
    },
  ];

  filteredUsers: User[] = [];
  searchName: string = '';
  searchEmail: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor() {
    this.filteredUsers = [...this.users];
    this.updatePagination();
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(this.searchName.toLowerCase()) &&
        user.email.toLowerCase().includes(this.searchEmail.toLowerCase())
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUsers = this.filteredUsers.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterUsers();
    }
  }

  addUser(): void {
    this.toastr.info(
      'Funcionalidad para agregar usuario aún no implementada',
      'Información'
    );
  }

  editUser(user: User): void {
    this.toastr.info(`Editar usuario: ${user.nombre}`, 'Información');
  }

  deleteUser(user: User): void {
    this.toastr.warning(`Eliminar usuario: ${user.nombre}`, 'Advertencia');
  }

  viewUser(user: User): void {
    this.toastr.info(`Ver usuario: ${user.nombre}`, 'Información');
  }
}
