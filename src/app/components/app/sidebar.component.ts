import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
          
          <ul class="space-y-2 font-medium">
            <li>
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-gray-700"
                class="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 group"
              >
                <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                </svg>
                <span class="ml-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/location"
                routerLinkActive="bg-gray-700"
                class="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 group"
              >
                <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                  <path d="M8 0a7.992 7.992 0 0 0-6.583 12.535 1 1 0 0 0 .12.183l.12.146c.112.145.227.285.326.4l5.245 6.374a1 1 0 0 0 1.545-.003l5.092-6.205c.206-.222.4-.455.578-.7l.127-.155a.934.934 0 0 0 .122-.192A8.001 8.001 0 0 0 8 0Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                </svg>
                <span class="ml-3">Ubicación</span>
              </a>
            </li>
            <li *ngIf="(currentUser$ | async)?.rol === 'ADMIN'">
              <a
                routerLink="/users"
                routerLinkActive="bg-gray-700"
                class="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 group"
              >
                <svg class="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                </svg>
                <span class="ml-3">Usuarios</span>
              </a>
            </li>
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
          </ul>
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
  isOpen = false;
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
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
} 