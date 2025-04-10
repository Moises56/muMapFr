import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { LocationService, Location } from '../../services/location.service';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  locations: Location[] = [];
  private markers: L.Marker[] = [];

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  constructor(
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  private initializeMap(): void {
    if (!this.mapElementRef) return;

    // Configurar el icono por defecto de Leaflet
    const iconRetinaUrl = '/public/images/marker-icon-2x.png';
    const iconUrl = '/public/images/marker-icon.png';
    const shadowUrl = '/public/images/marker-shadow.png';
    
    // Configurar el icono por defecto
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
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

    this.loadLocations();
  }

  private loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (response) => {
        this.locations = response.data;
        if (isPlatformBrowser(this.platformId)) this.updateMarkers();
      },
      error: (err) => console.error('Error loading locations:', err),
    });
  }

  private updateMarkers(): void {
    // Limpiar marcadores existentes
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Agregar nuevos marcadores
    this.locations.forEach(location => {
      const marker = L.marker([location.latitud, location.longitud])
        .addTo(this.map)
        .bindPopup(location.destinoAsignado);
      this.markers.push(marker);
    });
  }

  centerMap(location: Location): void {
    if (isPlatformBrowser(this.platformId) && this.map) {
      this.map.setView([location.latitud, location.longitud], 13);
    }
  }
}
