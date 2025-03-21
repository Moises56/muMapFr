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

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit {
  private map: any;
  locations: Location[] = [];
  private markers: any[] = [];
  private L: any;

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  constructor(
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initializeLeaflet(), 0);
    }
  }

  private async initializeLeaflet(): Promise<void> {
    const leafletModule = await import('leaflet');
    this.L = leafletModule.default || leafletModule;
    this.initializeMap();
    this.loadLocations();
  }

  private initializeMap(): void {
    if (!this.L || !this.mapElementRef || !this.mapElementRef.nativeElement)
      return;
    this.map = this.L.map(this.mapElementRef.nativeElement).setView(
      [51.505, -0.09],
      2
    );
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        if (isPlatformBrowser(this.platformId) && this.L) this.updateMarkers();
      },
      error: (err) => console.error('Error loading locations:', err),
    });
  }

  private updateMarkers(): void {
    if (!this.L || !this.map) return;

    // Define custom icon
    const customIcon = this.L.icon({
      iconUrl: '/icono/pin.png', // Path relative to the root (public folder)
      iconSize: [20, 20], // Adjust size as needed
      iconAnchor: [16, 20], // Anchor point (center bottom of the icon)
      popupAnchor: [0, -20], // Popup position relative to the icon
    });

    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = this.locations.map((location) =>
      this.L.marker([location.latitude, location.longitude], {
        icon: customIcon,
      })
        .addTo(this.map)
        .bindPopup(location.nameUser || 'Anonymous')
    );
  }

  centerMap(location: Location): void {
    if (isPlatformBrowser(this.platformId) && this.map) {
      this.map.setView([location.latitude, location.longitude], 13);
    }
  }
}
