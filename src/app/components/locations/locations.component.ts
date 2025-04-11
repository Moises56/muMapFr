import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Location, LocationUser, LocationResponse } from '../../services/location.service';
import { FormsModule } from '@angular/forms';
import { LeafletService } from '../../services/leaflet.service';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones' : 'Todas las Ubicaciones' }}
          </h1>
          
          <!-- Filtros -->
          <div class="flex items-center space-x-4" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
            <button
              (click)="filterLocations('today')"
              class="px-3 py-1 rounded-md text-sm font-medium"
              [ngClass]="{'bg-blue-600 text-white': currentFilter === 'today', 'bg-gray-200 text-gray-700': currentFilter !== 'today'}"
            >
              Hoy
            </button>
            <button
              (click)="filterLocations('all')"
              class="px-3 py-1 rounded-md text-sm font-medium"
              [ngClass]="{'bg-blue-600 text-white': currentFilter === 'all', 'bg-gray-200 text-gray-700': currentFilter !== 'all'}"
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

        <!-- Mapa -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div #map class="h-[500px] rounded-lg shadow" *ngIf="leafletService.isPlatformBrowser()"></div>
        </div>

        <!-- Tabla de Ubicaciones -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo en Destino</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let location of locations" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ location.user?.nombreUsuario || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ location.destinoAsignado || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ location.estado || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ this.calculateMinutes(location.tiempoEnDestino) }} minutos
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ location.timestamp | date:'medium' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ location.latitud.toFixed(6) }}, {{ location.longitud.toFixed(6) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public leafletService = inject(LeafletService);

  @ViewChild('map') mapElementRef!: ElementRef;

  locations: Location[] = [];
  private map: any = null;
  private markers: any[] = [];
  private bounds: any = null;
  currentUser$ = this.authService.currentUser$;
  subscriptions: Subscription[] = [];
  currentFilter: 'all' | 'today' | 'custom' = 'all';
  selectedDate: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  selectedEstado: string | null = null;
  selectedDestino: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params: { [key: string]: string }) => {
      if (params['filter'] === 'today') {
        this.currentFilter = 'today';
      } else if (params['startDate']) {
        this.currentFilter = 'custom';
        this.selectedDate = params['startDate'].split('T')[0];
      }
    });
  }

  async ngAfterViewInit() {
    if (this.leafletService.isPlatformBrowser() && this.mapElementRef?.nativeElement) {
      const L = await this.leafletService.getLeaflet();
      this.initializeMap(L);
    }
  }

  private initializeMap(L: any): void {
    this.map = L.map(this.mapElementRef.nativeElement).setView([19.4326, -99.1332], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add scale control
    L.control.scale().addTo(this.map);

    // Add fullscreen control
    (L.control as any).fullscreen({
      position: 'topright',
      title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
      }
    }).addTo(this.map);

    // Add geolocation control
    (L.control as any).locate({
      position: 'topright',
      strings: {
        title: 'Show me where I am'
      }
    }).addTo(this.map);

    // Update map when locations change
    this.updateMap(L);
  }

  private async loadLocations(): Promise<void> {
    const params: { [key: string]: any } = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Apply filters if they exist
    if (this.selectedEstado) {
      params['estado'] = this.selectedEstado;
    }
    if (this.selectedDestino) {
      params['destinoAsignado'] = this.selectedDestino;
    }

    // Apply date filters
    if (this.currentFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      params['startDate'] = today.toISOString();
      params['endDate'] = new Date().toISOString();
    } else if (this.currentFilter === 'custom' && this.selectedDate) {
      const startDate = new Date(this.selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.selectedDate);
      endDate.setHours(23, 59, 59, 999);
      params['startDate'] = startDate.toISOString();
      params['endDate'] = endDate.toISOString();
    }

    const sub = this.locationService.getAllLocations(params).subscribe({
      next: async (response: LocationResponse) => {
        this.locations = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.totalPages;
        if (this.leafletService.isPlatformBrowser()) {
          const L = await this.leafletService.getLeaflet();
          this.updateMap(L);
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
  }

  private updateMap(L: any): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.bounds = null;

    // Add new markers
    this.locations.forEach(location => {
      if (location.latitud && location.longitud) {
        const marker = L.marker([location.latitud, location.longitud], {
          icon: this.getMarkerIcon(L, location.user?.nombreUsuario)
        });

        const timestamp = location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A';
        const popupContent = `
          <div class="location-popup">
            <h3>${location.user?.nombreUsuario || 'Unknown User'}</h3>
            <p><strong>Role:</strong> ${location.user?.nombreUsuario || 'Unknown'}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Accuracy:</strong> ${location.tiempoEnDestino?.toFixed(2) || 'N/A'}m</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        if (this.map) {
          marker.addTo(this.map);
        }
        this.markers.push(marker);

        // Update bounds
        const latLng = [location.latitud, location.longitud];
        if (!this.bounds) {
          this.bounds = L.latLngBounds([latLng, latLng]);
        } else {
          this.bounds.extend(latLng);
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
  }

  filterLocations(filter: 'today' | 'all' | 'custom'): void {
    this.currentFilter = filter;
    this.loadLocations();
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  calculateMinutes(seconds: number): number {
    return Math.round(seconds / 60);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private getMarkerIcon(L: any, role: string | undefined): any {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-content">${role || 'Unknown'}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  }
} 