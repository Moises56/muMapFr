import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService, LocationResponse } from '../../services/location.service';
import { SidebarComponent } from '../app/sidebar.component';
import { Observable, Subscription, take } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-locations',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, RouterModule],
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
                    <h1 class="text-xl font-bold text-gray-900">Mi Historial de Ubicaciones</h1>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-gray-700">
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
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Mapa -->
              <div class="bg-white shadow rounded-lg p-6 mb-6">
                <div #map class="h-[600px] rounded-lg shadow" *ngIf="isBrowser"></div>
              </div>

              <!-- Tabla de Ubicaciones -->
              <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Mis Ubicaciones Registradas</h2>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo en Destino</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let location of locations">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ location.destinoAsignado }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ location.estado }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ roundTime(location.tiempoEnDestino) }} minutos</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ location.timestamp | date:'medium' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ location.latitud.toFixed(6) }}, {{ location.longitud.toFixed(6) }}
                        </td>
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
  styles: []
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

  ngOnInit() {
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

  private initMap(L: any): void {
    if (!this.mapElementRef?.nativeElement) return;

    // Configuración inicial del mapa
    this.map = L.map(this.mapElementRef.nativeElement, {
      center: [14.0723, -87.1921], // Centro en Tegucigalpa
      zoom: 13,
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
      position: 'bottomright'
    }).addTo(this.map);

    // Añadir capa de mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 8
    }).addTo(this.map);

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
      this.map.invalidateSize();
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