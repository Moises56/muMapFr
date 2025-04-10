import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../app/sidebar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="flex flex-col md:flex-row">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Main Content -->
        <div class="flex-1 transition-all duration-300 ease-in-out">
          <!-- Top Navigation -->
          <nav class="bg-white shadow-sm">
            <div class="mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-sm md:text-base text-gray-700">
                        {{ (currentUser$ | async)?.nombre }}
                        {{ (currentUser$ | async)?.apellido }}
                      </span>
                      <span
                        [ngClass]="{
                          'bg-green-100 text-green-800': (currentUser$ | async)?.rol === 'ADMIN',
                          'bg-blue-100 text-blue-800': (currentUser$ | async)?.rol === 'MODERATOR',
                          'bg-yellow-100 text-yellow-800': (currentUser$ | async)?.rol === 'OPERADOR'
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
            <div class="mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Stats Grid -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Stat Card 1 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Total Usuarios
                          </dt>
                          <dd class="text-lg font-medium text-gray-900">
                            12
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stat Card 2 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Ubicaciones Registradas
                          </dt>
                          <dd class="text-lg font-medium text-gray-900">
                            24
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stat Card 3 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Actividad Reciente
                          </dt>
                          <dd class="text-lg font-medium text-gray-900">
                            5 logs
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stat Card 4 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Estado del Sistema
                          </dt>
                          <dd class="text-lg font-medium text-green-600">
                            Activo
                          </dd>
                        </dl>
                      </div>
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
  styles: []
})
export class DashboardComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;
} 