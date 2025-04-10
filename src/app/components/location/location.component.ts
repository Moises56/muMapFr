import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { SidebarComponent } from '../app/sidebar.component';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Formulario de ubicación -->
                <div class="md:col-span-1 bg-white shadow rounded-lg p-6">
                  <h2 class="text-lg font-medium text-gray-900 mb-4">Nueva Ubicación</h2>
                  <form [formGroup]="locationForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Destino Asignado</label>
                      <input
                        type="text"
                        formControlName="destinoAsignado"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Tiempo en Destino (minutos)</label>
                      <input
                        type="number"
                        formControlName="tiempoEnDestino"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div class="text-sm text-gray-500">
                      <p>Latitud: {{ currentLat }}</p>
                      <p>Longitud: {{ currentLng }}</p>
                    </div>

                    <button
                      type="submit"
                      [disabled]="locationForm.invalid || !currentLat || !currentLng || isSaving"
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <span *ngIf="!isSaving">Guardar Ubicación</span>
                      <span *ngIf="isSaving" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    </button>
                  </form>

                  @if (errorMessage) {
                    <div class="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                      <span class="block sm:inline">{{ errorMessage }}</span>
                    </div>
                  }

                  @if (successMessage) {
                    <div class="mt-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                      <span class="block sm:inline">{{ successMessage }}</span>
                    </div>
                  }
                </div>

                <!-- Mapa -->
                <div class="md:col-span-2" *ngIf="isBrowser">
                  <div #map class="h-[600px] rounded-lg shadow"></div>
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
export class LocationComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('map') mapElementRef!: ElementRef;

  locationForm: FormGroup;
  currentLat: number | null = null;
  currentLng: number | null = null;
  private map: any;
  private marker: any = null;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  currentUser$ = this.authService.currentUser$;
  isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    this.locationForm = this.fb.group({
      destinoAsignado: ['', Validators.required],
      tiempoEnDestino: [60, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      import('leaflet').then(L => {
        this.initMap(L);
      });
    }
  }

  ngAfterViewInit() {
    // El mapa se inicializará en ngOnInit
  }

  private initMap(L: any): void {
    // Configurar el icono personalizado
    const customIcon = L.icon({
      iconUrl: '/icono/pin.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    this.map = L.map(this.mapElementRef.nativeElement).setView([14.0723, -87.1921], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Obtener la ubicación actual
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
          this.currentLat = latitude;
          this.currentLng = longitude;
          
          if (this.marker) {
            this.marker.setLatLng([latitude, longitude]);
          } else {
            this.marker = L.marker([latitude, longitude], { icon: customIcon })
              .addTo(this.map)
              .bindPopup('Tu ubicación actual');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          this.errorMessage = 'No se pudo obtener tu ubicación actual';
        }
      );
    }

    // Evento de clic en el mapa
    this.map.on('click', (e: any) => {
      this.currentLat = e.latlng.lat;
      this.currentLng = e.latlng.lng;
      
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng, { icon: customIcon })
          .addTo(this.map)
          .bindPopup('Ubicación seleccionada');
      }
    });
  }

  onSubmit(): void {
    if (this.locationForm.valid && this.currentLat && this.currentLng) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const user = this.authService.getCurrentUser();
      if (!user) {
        this.errorMessage = 'No se pudo obtener la información del usuario';
        this.isSaving = false;
        return;
      }

      const locationData = {
        latitud: this.currentLat,
        longitud: this.currentLng,
        destinoAsignado: this.locationForm.value.destinoAsignado,
        tiempoEnDestino: this.locationForm.value.tiempoEnDestino * 60, // Convertir minutos a segundos
      };
      
      this.locationService.createLocation(locationData).subscribe({
        next: () => {
          this.successMessage = 'Ubicación guardada correctamente';
          this.locationForm.reset({
            destinoAsignado: '',
            tiempoEnDestino: 60
          });
          this.isSaving = false;
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Error al guardar la ubicación';
          this.isSaving = false;
        }
      });
    }
  }
} 