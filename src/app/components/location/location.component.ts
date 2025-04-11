import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { LeafletService } from '../../services/leaflet.service';
import { SidebarComponent } from '../app/sidebar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1">
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
                        {{ (currentUser$ | async)?.nombre }}
                        {{ (currentUser$ | async)?.apellido }}
                      </span>
                      <span
                        [ngClass]="{
                          'bg-green-100 text-green-800':
                            (currentUser$ | async)?.rol === 'ADMIN',
                          'bg-blue-100 text-blue-800':
                            (currentUser$ | async)?.rol === 'MODERATOR',
                          'bg-yellow-100 text-yellow-800':
                            (currentUser$ | async)?.rol === 'OPERADOR'
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
          <main class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 bg-white shadow rounded-lg p-6">
                  <h2 class="text-lg font-medium text-gray-900 mb-4">
                    Nueva Ubicación
                  </h2>
                  <form
                    [formGroup]="locationForm"
                    (ngSubmit)="onSubmit()"
                    class="space-y-4"
                  >
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Destino Asignado</label
                      >
                      <input
                        type="text"
                        formControlName="destinoAsignado"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Tiempo en Destino (minutos)</label
                      >
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
                      [disabled]="
                        locationForm.invalid ||
                        !currentLat ||
                        !currentLng ||
                        isSaving
                      "
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <span *ngIf="!isSaving">Guardar Ubicación</span>
                      <span *ngIf="isSaving" class="flex items-center">
                        <svg
                          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Guardando...
                      </span>
                    </button>
                  </form>
                  @if (errorMessage) {
                  <div
                    class="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <span class="block sm:inline">{{ errorMessage }}</span>
                  </div>
                  } @if (successMessage) {
                  <div
                    class="mt-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <span class="block sm:inline">{{ successMessage }}</span>
                  </div>
                  }
                </div>
                <div
                  class="md:col-span-2"
                  *ngIf="leafletService.isPlatformBrowser()"
                >
                  <div #map class="h-[600px] rounded-lg shadow"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LocationComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  public leafletService = inject(LeafletService); // Cambiado a public

  @ViewChild('map') mapElementRef!: ElementRef;

  locationForm: FormGroup;
  currentLat: number | null = null;
  currentLng: number | null = null;
  private map: any = null;
  private marker: any = null;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  currentUser$ = this.authService.currentUser$;
  private subscriptions: Subscription[] = [];

  constructor() {
    // Initialize the form in constructor to avoid SSR issues
    this.locationForm = this.fb.group({
      destinoAsignado: ['', Validators.required],
      tiempoEnDestino: [60, [Validators.required, Validators.min(1)]],
      latitud: [null],
      longitud: [null],
    });
  }

  ngOnInit() {
    // Initialize anything that doesn't require browser APIs here
  }

  async ngAfterViewInit() {
    if (
      this.leafletService.isPlatformBrowser() &&
      this.mapElementRef?.nativeElement
    ) {
      try {
        this.map = await this.leafletService.initializeMap(
          this.mapElementRef.nativeElement
        );
        if (this.map) {
          this.getLocation();
          this.map.on('click', (e: any) => this.onMapClick(e));
        }
      } catch (error) {
        this.errorMessage = 'Error al inicializar el mapa.';
        console.error(error);
      }
    }
  }

  private async onMapClick(e: any) {
    this.currentLat = e.latlng.lat;
    this.currentLng = e.latlng.lng;

    try {
      if (this.currentLat === null || this.currentLng === null) return;

      if (this.marker) {
        this.marker.setLatLng([this.currentLat, this.currentLng]);
      } else {
        const iconHtml = `
          <div class="bg-blue-600 rounded-full w-4 h-4 border-2 border-white"></div>
        `;
        const icon = await this.leafletService.createCustomIcon(
          iconHtml,
          [16, 16],
          [8, 8]
        );
        this.marker = await this.leafletService.createMarker(
          [this.currentLat, this.currentLng],
          {
            icon,
            popupContent: 'Ubicación seleccionada',
          }
        );
        this.marker.addTo(this.map);
      }

      this.locationForm.patchValue({
        latitud: this.currentLat,
        longitud: this.currentLng,
      });
    } catch (error) {
      this.errorMessage = 'Error al crear el marcador.';
      console.error(error);
    }
  }

  private getLocation(): void {
    if (!this.leafletService.isPlatformBrowser() || !navigator.geolocation) {
      this.errorMessage = 'La geolocalización no está disponible.';
      return;
    }

    this.errorMessage = 'Por favor, permite el acceso a tu ubicación.';
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.currentLat = position.coords.latitude;
        this.currentLng = position.coords.longitude;
        this.errorMessage = '';
        await this.updateMap();
      },
      (error) => {
        this.errorMessage = this.getGeolocationErrorMessage(error);
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  private async updateMap(): Promise<void> {
    if (!this.map || this.currentLat === null || this.currentLng === null)
      return;

    try {
      this.map.setView([this.currentLat, this.currentLng], 15);
      if (this.marker) {
        this.marker.remove();
      }

      const iconHtml = `
        <div class="bg-blue-600 rounded-full w-4 h-4 border-2 border-white"></div>
      `;
      const icon = await this.leafletService.createCustomIcon(
        iconHtml,
        [16, 16],
        [8, 8]
      );
      this.marker = await this.leafletService.createMarker(
        [this.currentLat, this.currentLng],
        { icon }
      );
      this.marker.addTo(this.map);

      this.locationForm.patchValue({
        latitud: this.currentLat,
        longitud: this.currentLng,
      });
    } catch (error) {
      this.errorMessage = 'Error al actualizar el mapa.';
      console.error(error);
    }
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Se ha denegado el acceso a tu ubicación.';
      case error.POSITION_UNAVAILABLE:
        return 'La información de ubicación no está disponible.';
      case error.TIMEOUT:
        return 'Se agotó el tiempo para obtener tu ubicación.';
      default:
        return 'Error al obtener tu ubicación.';
    }
  }

  onSubmit(): void {
    if (this.locationForm.valid && this.currentLat && this.currentLng) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const locationData = {
        latitud: this.currentLat,
        longitud: this.currentLng,
        destinoAsignado: this.locationForm.value.destinoAsignado,
        tiempoEnDestino: this.locationForm.value.tiempoEnDestino * 60,
      };

      const sub = this.locationService.createLocation(locationData).subscribe({
        next: () => {
          this.successMessage = 'Ubicación guardada correctamente';
          this.locationForm.reset({
            destinoAsignado: '',
            tiempoEnDestino: 60,
            latitud: null,
            longitud: null,
          });
          this.isSaving = false;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Error al guardar la ubicación';
          this.isSaving = false;
        },
      });
      this.subscriptions.push(sub);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
