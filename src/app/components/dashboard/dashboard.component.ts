import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../app/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, AsyncPipe],
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
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <router-outlet></router-outlet>
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