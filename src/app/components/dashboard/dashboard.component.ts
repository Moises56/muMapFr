import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService, LocationResponse, Location } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { LogService } from '../../services/log.service';
import { SidebarComponent } from '../app/sidebar.component';
import { Observable, Subscription, catchError, of, take } from 'rxjs';
import { User } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
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
                    <h1 class="text-xl font-bold text-gray-900">
                      {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones' : 'Dashboard' }}
                    </h1>
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
              <!-- Stats Grid -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Total Users Card (solo para ADMIN y MODERATOR) -->
                <div *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'"
                     class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
                     (click)="navigateToUsers()">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">{{ totalUsers }}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total Locations Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones' : 'Total Ubicaciones' }}
                          </dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">{{ totalLocations }}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Today's Locations Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">Ubicaciones de Hoy</dt>
                          <dd class="flex items-baseline">
                            <div class="text-2xl font-semibold text-gray-900">{{ todayLocations }}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Last Location Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">Última Ubicación</dt>
                          <dd class="flex items-baseline">
                            <div class="text-sm text-gray-900">{{ lastLocation || 'Sin registros' }}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Locations Map -->
              <div class="mt-8">
                <div class="bg-white shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg leading-6 font-medium text-gray-900">
                        {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones Registradas' : 'Ubicaciones del Día' }}
                      </h3>
                      <div class="flex space-x-3">
                        <button
                          (click)="showTodayLocations()"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white"
                          [ngClass]="{'bg-blue-600 hover:bg-blue-700': !showingAllLocations, 'bg-gray-400': showingAllLocations}"
                        >
                          Hoy
                        </button>
                        <button
                          (click)="showAllLocations()"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white"
                          [ngClass]="{'bg-blue-600 hover:bg-blue-700': showingAllLocations, 'bg-gray-400': !showingAllLocations}"
                        >
                          Todas
                        </button>
                      </div>
                    </div>
                    <div class="mt-4" style="height: 400px;" #mapElement>
                      <!-- El mapa se renderizará aquí -->
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
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private userService = inject(UserService);
  private logService = inject(LogService);
  private router = inject(Router);

  @ViewChild('mapElement') mapElement!: ElementRef;

  currentUser$ = this.authService.currentUser$;
  totalUsers = 0;
  totalLocations = 0;
  todayLocations = 0;
  totalLogs = 0;
  lastLocation = '';
  private map: any;
  private markers: any[] = [];
  showingAllLocations = false;
  private L: any;
  private subscriptions: Subscription[] = [];
  private mapInitialized = false;

  ngOnInit() {
    const userSub = this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.loadStatistics(user);
        if (!this.mapInitialized) {
          this.initializeMap();
        }
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
    }
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  private async initializeMap() {
    try {
      this.L = await import('leaflet');
      await this.setupMap();
      this.showTodayLocations();
      this.mapInitialized = true;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async setupMap() {
    if (this.mapElement?.nativeElement && !this.map) {
      try {
        this.map = this.L.map(this.mapElement.nativeElement).setView([14.0723, -87.1921], 13);
        
        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
      } catch (error) {
        console.error('Error setting up map:', error);
      }
    }
  }

  private getEmptyLocationResponse(): LocationResponse {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  private loadStatistics(user: User) {
    // Cargar total de usuarios para admin y moderador
    if (user.rol !== 'OPERADOR') {
      const usersSub = this.userService.getUsers(1, 1).pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          return of({ data: [], meta: { total: 0 } });
        })
      ).subscribe(response => {
        this.totalUsers = response.meta?.total || 0;
      });
      this.subscriptions.push(usersSub);
    }

    if (user.rol === 'OPERADOR') {
      // Para operadores, usar el endpoint my-locations
      const locationsSub = this.locationService.getMyLocations().pipe(
        catchError(error => {
          console.error('Error loading locations:', error);
          return of(this.getEmptyLocationResponse());
        })
      ).subscribe(response => {
        this.totalLocations = response?.meta?.total || 0;
        
        if (response?.data?.length > 0) {
          const lastLoc = response.data[0];
          this.lastLocation = `${lastLoc.destinoAsignado} (${new Date(lastLoc.timestamp || '').toLocaleString()})`;
        }
      });
      this.subscriptions.push(locationsSub);

      // Obtener ubicaciones de hoy para el operador
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLocationsSub = this.locationService.getMyLocations({
        startDate: today.toISOString()
      }).pipe(
        catchError(error => {
          console.error('Error loading today locations:', error);
          return of(this.getEmptyLocationResponse());
        })
      ).subscribe(response => {
        this.todayLocations = response?.meta?.total || 0;
      });
      this.subscriptions.push(todayLocationsSub);
    } else {
      // Para admin y moderador, usar el endpoint general con filtros
      const locationsSub = this.locationService.getAllLocations({ limit: 1 }).pipe(
        catchError(error => {
          console.error('Error loading locations:', error);
          return of(this.getEmptyLocationResponse());
        })
      ).subscribe(response => {
        this.totalLocations = response?.meta?.total || 0;
        
        if (response?.data?.length > 0) {
          const lastLoc = response.data[0];
          this.lastLocation = `${lastLoc.destinoAsignado} - ${lastLoc.user?.nombreUsuario || 'N/A'} (${new Date(lastLoc.timestamp || '').toLocaleString()})`;
        }
      });
      this.subscriptions.push(locationsSub);

      // Obtener ubicaciones de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLocationsSub = this.locationService.getAllLocations({
        startDate: today.toISOString()
      }).pipe(
        catchError(error => {
          console.error('Error loading today locations:', error);
          return of(this.getEmptyLocationResponse());
        })
      ).subscribe(response => {
        this.todayLocations = response?.meta?.total || 0;
      });
      this.subscriptions.push(todayLocationsSub);
    }
  }

  private clearMarkers() {
    if (this.markers.length > 0) {
      this.markers.forEach(marker => {
        if (marker && this.map) {
          marker.remove();
        }
      });
      this.markers = [];
    }
  }

  showTodayLocations() {
    this.showingAllLocations = false;
    this.loadLocations(true);
  }

  showAllLocations() {
    this.showingAllLocations = true;
    this.loadLocations(false);
  }

  private loadLocations(onlyToday: boolean) {
    if (!this.map) return;

    this.clearMarkers();
    const userSub = this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) return;

      const params: any = {
        limit: 100
      };
      if (onlyToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.startDate = today.toISOString();
      }

      // Usar el endpoint correcto según el rol
      const locationObservable = user.rol === 'OPERADOR' ?
        this.locationService.getMyLocations(params) :
        this.locationService.getAllLocations(params);

      const locationSub = locationObservable.pipe(
        catchError(error => {
          console.error('Error loading locations for map:', error);
          return of(this.getEmptyLocationResponse());
        })
      ).subscribe(response => {
        if (!response?.data) return;

        response.data.forEach(location => {
          if (!location || !this.map) return;

          const popupContent = user.rol === 'OPERADOR' ?
            `
              <b>Destino:</b> ${location.destinoAsignado}<br>
              <b>Tiempo en destino:</b> ${Math.round(location.tiempoEnDestino / 60)} minutos<br>
              <b>Estado:</b> ${location.estado || 'N/A'}<br>
              <b>Fecha:</b> ${new Date(location.timestamp || '').toLocaleString()}
            ` :
            `
              <b>Operador:</b> ${location.user?.nombreUsuario || 'N/A'}<br>
              <b>Destino:</b> ${location.destinoAsignado}<br>
              <b>Tiempo en destino:</b> ${Math.round(location.tiempoEnDestino / 60)} minutos<br>
              <b>Estado:</b> ${location.estado || 'N/A'}<br>
              <b>Fecha:</b> ${new Date(location.timestamp || '').toLocaleString()}
            `;

          try {
            const marker = this.L.marker([location.latitud, location.longitud])
              .addTo(this.map)
              .bindPopup(popupContent);
            this.markers.push(marker);
          } catch (error) {
            console.error('Error adding marker:', error);
          }
        });

        if (this.markers.length > 0) {
          try {
            const group = this.L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        }
      });
      this.subscriptions.push(locationSub);
    });
    this.subscriptions.push(userSub);
  }
} 