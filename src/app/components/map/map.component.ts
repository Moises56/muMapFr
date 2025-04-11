import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { LocationService, Location, LocationResponse } from '../../services/location.service';
import { CommonModule } from '@angular/common';
import { LeafletService } from '../../services/leaflet.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: any;
  locations: Location[] = [];
  private markers: any[] = [];
  
  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  constructor(
    private locationService: LocationService,
    public leafletService: LeafletService // Changed to public for template access
  ) {}

  ngOnInit(): void {
    // Safe operations that don't require browser APIs
    this.loadLocations();
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.leafletService.isPlatformBrowser() && this.mapElementRef?.nativeElement) {
      try {
        const L = await this.leafletService.getLeaflet();
        if (L) {
          this.initializeMap(L);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }

  private initializeMap(L: any): void {
    if (!this.mapElementRef?.nativeElement) return;

    try {
      this.map = L.map(this.mapElementRef.nativeElement).setView(
        [14.0723, -87.1921],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      this.updateMarkers(L);
    } catch (error) {
      console.error('Error in map initialization:', error);
    }
  }

  private loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: async (response: LocationResponse) => {
        this.locations = response.data;
        if (this.leafletService.isPlatformBrowser() && this.map) {
          const L = await this.leafletService.getLeaflet();
          if (L) {
            this.updateMarkers(L);
          }
        }
      },
      error: (err) => console.error('Error loading locations:', err)
    });
  }

  private updateMarkers(L: any): void {
    if (!L || !this.map) return;
    
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
    if (this.leafletService.isPlatformBrowser() && this.map) {
      this.map.setView([location.latitud, location.longitud], 13);
    }
  }

  ngOnDestroy(): void {
    if (this.leafletService.isPlatformBrowser() && this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
