import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, OnDestroy, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService, LocationResponse, Location, LocationSummary } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { LogService } from '../../services/log.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SidebarComponent } from '../app/sidebar.component';
import { Observable, Subscription, catchError, of, take, map } from 'rxjs';
import { User } from '../../interfaces/auth.interface';
import { FormsModule } from '@angular/forms';
import { LeafletService } from '../../services/leaflet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="flex flex-col lg:flex-row">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Main Content -->
        <div class="flex-1 lg:ml-64 transition-all duration-300 ease-in-out">
          <!-- Top Navigation -->
          <nav class="bg-white shadow-md sticky top-0 z-10">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <div class="flex-shrink-0 flex items-center ml-10 lg:ml-0">
                    <h1 class="text-xl font-bold text-gray-900">
                      {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones' : 'Dashboard' }}
                    </h1>
                  </div>
                  <div class="hidden md:ml-6 md:flex md:items-center md:space-x-4" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                    <a [routerLink]="['/locations']" class="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                      Ver Todas las Ubicaciones
                    </a>
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
              <!-- Estadísticas -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                <!-- Total Usuarios -->
                <div class="bg-white shadow rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1"
                     (click)="navigateToUsers()" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 p-3 bg-indigo-100 rounded-lg">
                      <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-lg font-medium text-gray-900">Total Usuarios</h3>
                      <p class="text-3xl font-bold text-indigo-600">{{ totalUsers }}</p>
                    </div>
                  </div>
                </div>

                <!-- Total Ubicaciones -->
                <div class="bg-white shadow rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1"
                     (click)="navigateToLocations()">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                      <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-lg font-medium text-gray-900">Total Ubicaciones</h3>
                      <p class="text-3xl font-bold text-blue-600">{{ totalLocations }}</p>
                    </div>
                  </div>
                </div>

                <!-- Ubicaciones Hoy -->
                <div class="bg-white shadow rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1"
                     (click)="navigateToLocations('today')">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                      <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-lg font-medium text-gray-900">Ubicaciones Hoy</h3>
                      <p class="text-3xl font-bold text-green-600">{{ todayLocations }}</p>
                    </div>
                  </div>
                </div>

                <!-- Total Logs -->
                <div class="bg-white shadow rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1"
                     *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                      <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-lg font-medium text-gray-900">Total Logs</h3>
                      <p class="text-3xl font-bold text-yellow-600">{{ totalLogs }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mapa y Filtros -->
              <div class="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 class="text-lg font-medium text-gray-900">
                    {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mi Ubicación Actual' : 'Ubicaciones Registradas' }}
                  </h2>
                  
                  <!-- Filtros de fecha responsivos -->
                  <div class="flex flex-wrap items-center gap-2 sm:space-x-4 w-full sm:w-auto" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                    <button
                      (click)="filterLocations('today')"
                      class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                      [ngClass]="{'bg-blue-600 text-white': currentFilter === 'today', 'bg-gray-200 text-gray-700 hover:bg-gray-300': currentFilter !== 'today'}"
                    >
                      Hoy
                    </button>
                    <button
                      (click)="filterLocations('all')"
                      class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                      [ngClass]="{'bg-blue-600 text-white': currentFilter === 'all', 'bg-gray-200 text-gray-700 hover:bg-gray-300': currentFilter !== 'all'}"
                    >
                      Todas
                    </button>
                    <div class="flex items-center space-x-2">
                      <input
                        type="date"
                        [(ngModel)]="selectedDate"
                        (change)="filterLocations('custom')"
                        class="px-2 py-1 border rounded-md text-sm"
                      >
                    </div>
                  </div>
                </div>
                
                <div #map [style.height]="getMapHeight()" class="rounded-lg shadow-md border border-gray-200" *ngIf="isBrowser"></div>
              </div>

              <!-- Últimos Logs -->
              <div class="bg-white shadow rounded-xl p-4 sm:p-6" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Últimos Registros</h2>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let log of recentLogs" class="hover:bg-gray-50 transition-colors duration-150">
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ log.user?.nombreUsuario }}</td>
                        <td class="px-4 sm:px-6 py-4 text-sm text-gray-500">{{ log.accion }}</td>
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{{ log.createdAt | date:'medium' }}</td>
                      </tr>
                      <tr *ngIf="recentLogs.length === 0">
                        <td colspan="3" class="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">No hay registros disponibles</td>
                      </tr>
                    </tbody>
                  </table>
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
    
    @media (max-width: 640px) {
      .main-content {
        margin-left: 0;
      }
    }
    
    @media (min-width: 1024px) {
      .main-content {
        margin-left: 16rem; /* 64px para el sidebar */
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private userService = inject(UserService);
  private logService = inject(LogService);
  private geolocationService = inject(GeolocationService);
  private leafletService = inject(LeafletService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('map') mapElementRef!: ElementRef;

  currentUser$ = this.authService.currentUser$;
  isBrowser = isPlatformBrowser(this.platformId);
  totalLocations: number = 0;
  todayLocations: number = 0;
  totalUsers: number = 0;
  totalLogs: number = 0;
  recentLogs: any[] = [];
  private map: any = null;
  private markers: any[] = [];
  private subscriptions: Subscription[] = [];
  currentFilter: 'today' | 'all' | 'custom' = 'today';
  selectedDate: string = new Date().toISOString().split('T')[0];
  locations: Location[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  private bounds: L.LatLngBounds | null = null;
  screenWidth: number = 0;
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
    }
    
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.rol === 'OPERADOR') {
        // Solo cargar estadísticas de ubicaciones para operadores
        this.loadOperatorStatistics();
      } else {
        // Cargar todas las estadísticas para admin/moderator
        this.loadStatistics();
        this.loadRecentLogs();
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser && this.mapElementRef?.nativeElement) {
      this.leafletService.getLeaflet().then(L => {
        if (L) {
          this.initMap(L);
        }
      }).catch(error => {
        console.error('Error loading Leaflet:', error);
      });
    }
  }

  // Método para determinar la altura del mapa en función del dispositivo
  getMapHeight(): string {
    if (this.screenWidth < 640) {
      return '400px'; // Altura más pequeña para móviles
    } else if (this.screenWidth < 1024) {
      return '500px'; // Altura media para tablets
    } else {
      return '600px'; // Altura completa para escritorio
    }
  }

  private initMap(L: any): void {
    if (!this.mapElementRef?.nativeElement) return;

    try {
      // Configuración inicial del mapa con opciones responsivas
      this.map = L.map(this.mapElementRef.nativeElement, {
        center: [14.0723, -87.1921], // Centro en Tegucigalpa
        zoom: this.screenWidth < 640 ? 11 : 13, // Zoom más amplio en móviles
        zoomControl: false, // Desactivamos el control de zoom predeterminado
        scrollWheelZoom: true,
        doubleClickZoom: true
      });

      // Añadir controles de zoom en una posición más accesible (esquina superior derecha)
      L.control.zoom({
        position: 'topright'
      }).addTo(this.map);

      // Añadir escala (más pequeña en móviles)
      L.control.scale({
        imperial: false,
        metric: true,
        position: 'bottomright',
        maxWidth: this.screenWidth < 640 ? 80 : 150
      }).addTo(this.map);

      // Añadir capa de mapa con mejor detalle
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 8
      }).addTo(this.map);

      // Manejar el redimensionamiento de la ventana
      if (this.isBrowser && typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
          setTimeout(() => {
            this.map.invalidateSize();
          }, 300);
        });
      }

      // Cargar ubicaciones según el rol del usuario
      this.currentUser$.pipe(take(1)).subscribe(user => {
        if (user?.rol === 'OPERADOR') {
          // Para operadores, usar loadOperatorLocation que usa el endpoint my-locations
          this.loadOperatorLocation(L);
        } else {
          // Para admin/moderator, usar loadAllLocations con el endpoint locations
          this.loadAllLocations(L, { limit: 100 });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private loadOperatorLocation(L: any): void {
    // Primero cargar las ubicaciones del operador
    const locationsSub = this.locationService.getMyLocations().subscribe({
      next: (response) => {
        if (response?.data) {
          // Limpiar marcadores anteriores
          this.clearMarkers();
          const bounds = L.latLngBounds([]);

          // Crear marcadores para cada ubicación
          response.data.forEach(location => {
            if (!location) return;

            const popupContent = `
              <div class="p-3">
                <h3 class="font-semibold text-lg mb-2">${location.destinoAsignado}</h3>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><span class="font-medium">Tiempo en destino:</span> ${Math.round(location.tiempoEnDestino / 60)} minutos</p>
                  <p><span class="font-medium">Estado:</span> ${location.estado || 'N/A'}</p>
                  <p><span class="font-medium">Fecha:</span> ${new Date(location.timestamp || '').toLocaleString()}</p>
                  <p class="mt-2">
                    <span class="font-medium">Coordenadas:</span><br>
                    Lat: ${location.latitud.toFixed(6)}<br>
                    Lng: ${location.longitud.toFixed(6)}
                  </p>
                </div>
              </div>
            `;

            const marker = L.marker([location.latitud, location.longitud], {
              icon: L.divIcon({
                className: 'custom-marker-operator',
                html: `
                  <div class="relative">
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    <div class="bg-blue-600 rounded-full w-6 h-6 border-2 border-white flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                      </svg>
                    </div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            })
            .addTo(this.map)
            .bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });

            this.markers.push(marker);
            bounds.extend([location.latitud, location.longitud]);
          });

          // Ajustar el mapa para mostrar todos los marcadores con animación
          if (this.markers.length > 0) {
            this.map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15,
              animate: true,
              duration: 1
            });
          }
        }
      },
      error: (error) => {
        console.error('Error loading operator locations:', error);
        if (error.status === 403 || error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
    this.subscriptions.push(locationsSub);
  }

  private loadAllLocations(L: any, params: any = { limit: 100 }): void {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      let locations$: Observable<LocationResponse>;
      
      if (user?.rol === 'OPERADOR') {
        // Para operadores, usar el endpoint de my-locations sin parámetros adicionales
        locations$ = this.locationService.getMyLocations();
      } else {
        // Para admin/moderator, usar el endpoint de locations con los parámetros de filtro
        locations$ = this.locationService.getAllLocations(params);
      }

      const sub = locations$.subscribe({
        next: (response) => {
          if (response?.data) {
            // Limpiar marcadores anteriores
            this.clearMarkers();
            const bounds = L.latLngBounds([]);

            // Crear marcadores para cada ubicación
            response.data.forEach(location => {
              if (!location) return;

              const popupContent = `
                <div class="p-3">
                  <h3 class="font-semibold text-lg mb-2">${location.destinoAsignado}</h3>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p><span class="font-medium">Operador:</span> ${location.user?.nombreUsuario || 'N/A'}</p>
                    <p><span class="font-medium">Tiempo en destino:</span> ${Math.round(location.tiempoEnDestino / 60)} minutos</p>
                    <p><span class="font-medium">Estado:</span> ${location.estado || 'N/A'}</p>
                    <p><span class="font-medium">Fecha:</span> ${new Date(location.timestamp || '').toLocaleString()}</p>
                    <p class="mt-2">
                      <span class="font-medium">Coordenadas:</span><br>
                      Lat: ${location.latitud.toFixed(6)}<br>
                      Lng: ${location.longitud.toFixed(6)}
                    </p>
                  </div>
                </div>
              `;

              const marker = L.marker([location.latitud, location.longitud], {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: `
                    <div class="bg-blue-600 rounded-full w-4 h-4 border-2 border-white shadow-lg"></div>
                  `,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })
              })
              .addTo(this.map)
              .bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
              });

              this.markers.push(marker);
              bounds.extend([location.latitud, location.longitud]);
            });

            // Ajustar el mapa para mostrar todos los marcadores con animación
            if (this.markers.length > 0) {
              this.map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15,
                animate: true,
                duration: 1
              });
            }
          }
        },
        error: (error) => {
          console.error('Error loading locations:', error);
          // Si hay un error de autenticación, redirigir al login
          if (error.status === 403 || error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
      this.subscriptions.push(sub);
    });
  }

  private loadOperatorStatistics(): void {
    // Cargar solo las estadísticas relevantes para operadores
    const summarySub = this.locationService.getSummary().subscribe({
      next: (summary) => {
        this.totalLocations = summary.totalUbicaciones;
        this.todayLocations = summary.ubicacionesHoy;
        // Si hay una última ubicación, centrar el mapa en ella
        if (summary.ultimaUbicacion && this.map) {
          const { latitud, longitud } = summary.ultimaUbicacion;
          this.map.setView([latitud, longitud], 15, {
            animate: true,
            duration: 1
          });
        }
      },
      error: (error) => {
        console.error('Error loading location summary:', error);
      }
    });
    this.subscriptions.push(summarySub);
  }

  private loadStatistics(): void {
    // Cargar estadísticas usando el endpoint de resumen
    const summarySub = this.locationService.getSummary().subscribe({
      next: (summary) => {
        this.totalLocations = summary.totalUbicaciones;
        this.todayLocations = summary.ubicacionesHoy;
        // Si hay una última ubicación, centrar el mapa en ella
        if (summary.ultimaUbicacion && this.map) {
          const { latitud, longitud } = summary.ultimaUbicacion;
          this.map.setView([latitud, longitud], 15, {
            animate: true,
            duration: 1
          });
        }
      },
      error: (error) => {
        console.error('Error loading location summary:', error);
      }
    });
    this.subscriptions.push(summarySub);

    // Cargar total de usuarios solo si es admin
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.rol === 'ADMIN') {
        const usersSub = this.userService.getUsers(1, 10).subscribe(response => {
          this.totalUsers = response?.meta?.total || 0;
        });
        this.subscriptions.push(usersSub);

        // Cargar total de logs solo si es admin
        const logsSub = this.logService.getLogs(1, 1).subscribe(response => {
          this.totalLogs = response?.meta?.total || 0;
        });
        this.subscriptions.push(logsSub);
      }
    });
  }

  private loadRecentLogs(): void {
    const sub = this.logService.getLogs(1, 5).subscribe(response => {
      this.recentLogs = response?.data || [];
    });
    this.subscriptions.push(sub);
  }

  filterLocations(filter: 'today' | 'all' | 'custom'): void {
    this.currentFilter = filter;
    
    if (this.map && this.isBrowser) {
      this.leafletService.getLeaflet().then(L => {
        if (!L) return;
        
        let params: any = { limit: 100 };
        
        // Solo aplicar filtros de fecha para admin/moderator
        this.currentUser$.pipe(take(1)).subscribe(user => {
          if (user?.rol !== 'OPERADOR') {
            if (filter === 'today') {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              params.startDate = today.toISOString();
            } else if (filter === 'custom' && this.selectedDate) {
              const date = new Date(this.selectedDate);
              date.setHours(0, 0, 0, 0);
              params.startDate = date.toISOString();
              const endDate = new Date(date);
              endDate.setHours(23, 59, 59, 999);
              params.endDate = endDate.toISOString();
            }
          }
          this.loadLocations();
        });
      });
    }
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToLocations(filter: 'all' | 'today' = 'all') {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.rol === 'OPERADOR') {
        // Para operadores, redirigir a my-locations
        this.router.navigate(['/my-locations']);
      } else {
        // Para admin/moderator, usar la lógica existente
        if (filter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          this.router.navigate(['/locations'], {
            queryParams: {
              filter: 'custom',
              startDate: today.toISOString()
            }
          });
        } else {
          this.router.navigate(['/locations']);
        }
      }
    });
  }

  navigateToSendLocation() {
    this.router.navigate(['/location']);
  }

  private loadLocations(): void {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      let locations$: Observable<LocationResponse>;
      
      if (user?.rol === 'OPERADOR') {
        locations$ = this.locationService.getMyLocations();
      } else {
        const params = {
          startDate: this.startDate?.toISOString(),
          endDate: this.endDate?.toISOString()
        };
        locations$ = this.locationService.getAllLocations(params);
      }

      const sub = locations$.subscribe({
        next: (response: LocationResponse) => {
          if (response.data) {
            this.locations = response.data;
            this.updateMap();
          }
        },
        error: (error) => {
          console.error('Error loading locations:', error);
          if (error.status === 403 || error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
      this.subscriptions.push(sub);
    });
  }

  private updateMap(): void {
    if (!this.map || !this.isBrowser) return;

    this.leafletService.getLeaflet().then(L => {
      if (!L) return;
      
      // Clear existing markers
      this.markers.forEach(marker => marker.remove());
      this.markers = [];
      this.bounds = null;

      // Add new markers
      this.locations.forEach((location: Location) => {
        if (location.latitud && location.longitud) {
          const marker = L.marker([location.latitud, location.longitud], {
            icon: this.getMarkerIcon(L, location.user?.rol)
          });

          const timestamp = location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A';
          const popupContent = `
            <div class="location-popup">
              <h3>${location.user?.nombreUsuario || 'Unknown User'}</h3>
              <p><strong>Role:</strong> ${location.user?.rol || 'Unknown'}</p>
              <p><strong>Time:</strong> ${timestamp}</p>
              <p><strong>Accuracy:</strong> ${location.precision?.toFixed(2) || 'N/A'}m</p>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.addTo(this.map);
          this.markers.push(marker);

          // Update bounds
          if (!this.bounds) {
            this.bounds = L.latLngBounds([[location.latitud, location.longitud]]); // Initialize with proper LatLngBoundsLiteral
          } else {
            this.bounds.extend(L.latLng(location.latitud, location.longitud)); // Use L.latLng() to create proper LatLng object
          }
        }
      });

      // Fit map to bounds if we have markers
      if (this.bounds && this.markers.length > 0) {
        this.map.fitBounds(this.bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
      }
    });
  }

  private getMarkerIcon(L: any, role: string | undefined): any {
    return L.icon({
      iconUrl: '/assets/images/marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }
}