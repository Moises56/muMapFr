import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { SidebarComponent } from '../app/sidebar.component';
import { Observable, Subscription, take } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-locations',
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
                    <h1 class="text-xl font-bold text-gray-900">Mi Historial de Ubicaciones</h1>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-gray-700 hidden sm:inline">
                        {{ (currentUser$ | async)?.nombre }} {{ (currentUser$ | async)?.apellido }}
                      </span>
                      <span class="bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
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
              <!-- Mapa -->
              <div class="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Mapa de Mis Ubicaciones</h2>
                <div #map [style.height]="getMapHeight()" class="rounded-lg shadow-md border border-gray-200" *ngIf="isBrowser"></div>
              </div>

              <!-- Tabla de Ubicaciones -->
              <div class="bg-white shadow rounded-xl p-4 sm:p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Mis Ubicaciones Registradas</h2>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tiempo en Destino</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Coordenadas</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let location of locations" class="hover:bg-gray-50 transition-colors duration-150">
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ location.destinoAsignado }}</td>
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                [ngClass]="{'bg-green-100 text-green-800': location.estado === 'activo', 
                                           'bg-red-100 text-red-800': location.estado === 'inactivo',
                                           'bg-gray-100 text-gray-800': !location.estado}">
                            {{ location.estado || 'N/A' }}
                          </span>
                        </td>
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{{ roundTime(location.tiempoEnDestino) }} minutos</td>
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{{ location.timestamp | date:'medium' }}</td>
                        <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {{ location.latitud.toFixed(6) }}, {{ location.longitud.toFixed(6) }}
                        </td>
                      </tr>
                      <tr *ngIf="locations.length === 0">
                        <td colspan="5" class="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">No hay ubicaciones registradas</td>
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
export class MyLocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('map') mapElementRef!: ElementRef;

  currentUser$ = this.authService.currentUser$;
  isBrowser = isPlatformBrowser(this.platformId);
  locations: any[] = [];
  private map: any = null;
  private markers: any[] = [];
  private subscriptions: Subscription[] = [];
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
    
    // Verificar que el usuario sea operador
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.rol !== 'OPERADOR') {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      import('leaflet').then(leaflet => {
        this.initMap(leaflet.default);
      });
    }
  }

  // Método para determinar la altura del mapa en función del dispositivo
  getMapHeight(): string {
    if (this.screenWidth < 640) {
      return '350px'; // Altura más pequeña para móviles
    } else if (this.screenWidth < 1024) {
      return '450px'; // Altura media para tablets
    } else {
      return '550px'; // Altura completa para escritorio
    }
  }

  private initMap(L: any): void {
    if (!this.mapElementRef?.nativeElement) return;

    // Configuración inicial del mapa con opciones responsivas
    this.map = L.map(this.mapElementRef.nativeElement, {
      center: [14.0723, -87.1921], // Centro en Tegucigalpa
      zoom: this.screenWidth < 640 ? 11 : 13, // Zoom más amplio en móviles
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true
    });

    // Añadir controles de zoom
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Añadir escala
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomright',
      maxWidth: this.screenWidth < 640 ? 80 : 150
    }).addTo(this.map);

    // Añadir capa de mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 8
    }).addTo(this.map);

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
    });

    // Cargar ubicaciones del operador
    this.loadMyLocations(L);
  }

  // Método para redondear el tiempo en destino a minutos
  roundTime(minutes: number): number {
    return Math.round(minutes / 60);
  }

  private loadMyLocations(L: any): void {
    const locationsSub = this.locationService.getMyLocations().subscribe({
      next: (response) => {
        console.log('Obteniendo ubicaciones del operador...', response);
        // Check if response has a data property (API structure)
        const locations = response.data ? response.data : response;
        
        if (locations && Array.isArray(locations)) {
          this.locations = locations;
          this.clearMarkers();
          const bounds = L.latLngBounds([]);

          // Crear marcadores para cada ubicación
          locations.forEach(location => {
            if (!location) return;

            const popupContent = `
              <div class="p-3">
                <h3 class="font-semibold text-lg mb-2">${location.destinoAsignado}</h3>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><span class="font-medium">Tiempo en destino:</span> ${this.roundTime(location.tiempoEnDestino)} minutos</p>
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
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                    <div class="bg-blue-600 rounded-full w-6 h-6 border-2 border-white flex items-center justify-center shadow-md">
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

          // Ajustar el mapa para mostrar todos los marcadores
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
        console.error('Error loading my locations:', error);
        if (error.status === 403 || error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
    this.subscriptions.push(locationsSub);
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
}