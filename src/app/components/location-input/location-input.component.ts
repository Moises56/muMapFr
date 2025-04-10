import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { LocationService, Location, LocationSave } from '../../services/location.service';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import * as L from 'leaflet';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-location-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-input.component.html',
  styleUrl: './location-input.component.css',
})
export class LocationInputComponent implements AfterViewInit {
  private map!: L.Map;
  marker: L.Marker | null = null;
  currentAddress: string = '';
  tiempoEnDestino: number = 60;
  isLoading: boolean = false;

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  constructor(
    private locationService: LocationService,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  private getAddressFromCoordinates(lat: number, lng: number): void {
    this.isLoading = true;
    this.currentAddress = '';
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response && response.display_name) {
          this.currentAddress = response.display_name;
        } else {
          this.currentAddress = '';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener la dirección:', error);
        this.currentAddress = '';
        this.isLoading = false;
      }
    });
  }

  private initializeMap(): void {
    if (!this.mapElementRef) return;

    // Configurar el icono por defecto de Leaflet
    const iconRetinaUrl = '/public/images/marker-icon-2x.png';
    const iconUrl = '/public/images/marker-icon.png';
    const shadowUrl = '/public/images/marker-shadow.png';
    
    // Configurar el icono por defecto
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl: '/public/images/marker-icon-2x.png',
      iconUrl: '/public/images/marker-icon.png',
      shadowUrl: '/public/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    this.map = L.map(this.mapElementRef.nativeElement).setView(
      [14.0723, -87.1921],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng)
          .addTo(this.map)
          .bindPopup('Ubicación seleccionada');
      }
      this.getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
          
          if (this.marker) {
            this.marker.setLatLng([latitude, longitude]);
          } else {
            this.marker = L.marker([latitude, longitude])
              .addTo(this.map)
              .bindPopup('Tu ubicación actual');
          }
          this.getAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          this.currentAddress = '';
        }
      );
    }
  }

  saveLocation(): void {
    if (isPlatformBrowser(this.platformId) && this.marker) {
      if (!this.currentAddress) {
        alert('Por favor, selecciona una ubicación válida en el mapa');
        return;
      }

      const user = this.authService.getCurrentUser();
      if (!user) {
        alert('No se pudo obtener la información del usuario');
        return;
      }

      const latlng = this.marker.getLatLng();
      const location: LocationSave = {
        // userId: user.id,
        latitud: latlng.lat,
        longitud: latlng.lng,
        destinoAsignado: this.currentAddress,
        tiempoEnDestino: this.tiempoEnDestino * 60,
        // estado: 'activo'
      };
      console.log(location);

      this.locationService.createLocation(location).subscribe({
        next: () => {
          // console.log('Ubicación guardada correctamente', location);
          alert('¡Ubicación guardada correctamente!');
          this.currentAddress = '';
          this.tiempoEnDestino = 60;
          if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
          }
        },
        error: (err) => {
          console.error('Error al guardar la ubicación:', err);
          alert('Error al guardar la ubicación. Por favor, intenta nuevamente.');
        },
      });
    }
  }
}
