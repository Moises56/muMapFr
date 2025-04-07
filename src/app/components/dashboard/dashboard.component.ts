import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navbar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <span class="text-2xl font-bold text-indigo-600">GeoLocation</span>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <!-- Siempre visible - Location -->
                <a 
                  routerLink="/dashboard/location" 
                  routerLinkActive="border-indigo-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Location
                </a>

                <!-- Solo para ADMIN y MODERADOR -->
                @if (canAccessAdvancedFeatures()) {
                  <a 
                    routerLink="/dashboard/logs" 
                    routerLinkActive="border-indigo-500 text-gray-900"
                    class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Logs
                  </a>
                }

                <!-- Solo para ADMIN -->
                @if (isAdmin()) {
                  <a 
                    routerLink="/dashboard/users" 
                    routerLinkActive="border-indigo-500 text-gray-900"
                    class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Usuarios
                  </a>
                }
              </div>
            </div>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-sm text-gray-500 mr-4">{{ getCurrentUserName() }}</span>
                <button
                  (click)="logout()"
                  class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal -->
      <main>
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  private authService = inject(AuthService);

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.nombre} ${user.apellido} (${user.rol})` : '';
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'ADMIN';
  }

  canAccessAdvancedFeatures(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'ADMIN' || user?.rol === 'MODERATOR';
  }

  logout(): void {
    this.authService.logout();
  }
} 