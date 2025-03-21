import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { LocationService, Location } from '../../services/location.service';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-location-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-input.component.html',
  styleUrl: './location-input.component.css',
})
export class LocationInputComponent implements AfterViewInit {
  private map: any;
  private marker: any;
  nameUser: string = '';
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
    this.initMap();
  }

  private initMap(): void {
    if (!this.L || !this.mapElementRef) return;
    this.map = this.L.map(this.mapElementRef.nativeElement).setView(
      [51.505, -0.09],
      13
    );
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Define custom icon
    const customIcon = this.L.icon({
      iconUrl: '/icono/pin.png', // Path relative to the root (public folder)
      iconSize: [32, 32], // Adjust size as needed
      iconAnchor: [16, 32], // Anchor point (center bottom of the icon)
      popupAnchor: [0, -32], // Popup position relative to the icon
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
          this.marker = this.L.marker([latitude, longitude], {
            icon: customIcon,
          })
            .addTo(this.map)
            .bindPopup('Current Location');
        },
        (error) => console.error('Geolocation error:', error)
      );
    }

    this.map.on('click', (e: any) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = this.L.marker(e.latlng, { icon: customIcon }).addTo(
          this.map
        );
      }
    });
  }

  saveLocation(): void {
    if (isPlatformBrowser(this.platformId) && this.marker) {
      const latlng = this.marker.getLatLng();
      const location: Location = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        nameUser: this.nameUser || undefined,
      };
      this.locationService.createLocation(location).subscribe({
        next: () => {
          alert('Location saved successfully!');
          this.nameUser = '';
        },
        error: (err) => console.error('Error saving location:', err),
      });
    }
  }
}
