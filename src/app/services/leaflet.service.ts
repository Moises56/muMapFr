import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LeafletService {
  private L: any = null;
  private isBrowser: boolean;
  private fullscreenLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Carga Leaflet dinámicamente solo en el navegador.
   * @returns Instancia de Leaflet o null si no se puede cargar o no es navegador.
   */
  async getLeaflet(): Promise<any> {
    if (!this.isBrowser) {
      return null; // No cargar en el servidor
    }

    if (!this.L) {
      try {
        // Use dynamic import to load Leaflet only in browser context
        const leafletModule = await import(/* webpackChunkName: "leaflet" */ 'leaflet');
        this.L = leafletModule.default;

        // Configurar iconos por defecto
        if (this.L) {
          delete (this.L.Icon.Default.prototype as any)._getIconUrl;
          this.L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/assets/images/marker-icon-2x.png',
            iconUrl: '/assets/images/marker-icon.png',
            shadowUrl: '/assets/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
        }
      } catch (error) {
        console.error('Error al cargar Leaflet:', error);
        throw new Error('No se pudo cargar Leaflet.');
      }
    }
    return this.L;
  }

  /**
   * Carga el plugin fullscreen de Leaflet
   * @returns Promise que resuelve cuando el plugin está cargado
   */
  async loadFullscreenPlugin(): Promise<void> {
    if (!this.isBrowser || this.fullscreenLoaded) {
      return;
    }

    try {
      // Cargar el CSS manualmente
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet-fullscreen@1.0.2/dist/leaflet.fullscreen.css';
      document.head.appendChild(link);

      // Cargar el plugin
      await import('leaflet-fullscreen');
      this.fullscreenLoaded = true;
    } catch (error) {
      console.error('Error cargando plugin fullscreen:', error);
    }
  }

  /**
   * Verifica si el entorno es un navegador.
   */
  isPlatformBrowser(): boolean {
    return this.isBrowser;
  }

  /**
   * Inicializa un mapa Leaflet.
   */
  async initializeMap(element: HTMLElement, options: any = {}): Promise<any> {
    const L = await this.getLeaflet();
    if (!L || !element) return null;

    const defaultOptions = {
      center: [14.0723, -87.1921], // Tegucigalpa por defecto
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
    };

    const map = L.map(element, { ...defaultOptions, ...options });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 8,
    }).addTo(map);

    // Intentar cargar el control fullscreen
    if (options.fullscreen !== false) {
      await this.loadFullscreenPlugin();
      if (this.fullscreenLoaded && L.control.fullscreen) {
        L.control.fullscreen({
          position: 'topright',
          title: {
            'false': 'Ver en pantalla completa',
            'true': 'Salir de pantalla completa'
          }
        }).addTo(map);
      }
    }

    return map;
  }

  /**
   * Crea un marcador.
   */
  async createMarker(
    latlng: [number, number],
    options: any = {}
  ): Promise<any> {
    const L = await this.getLeaflet();
    if (!L) return null;

    return L.marker(latlng, options);
  }

  /**
   * Crea un icono personalizado.
   */
  async createCustomIcon(
    html: string,
    size: [number, number] = [24, 24],
    anchor: [number, number] = [12, 12]
  ): Promise<any> {
    const L = await this.getLeaflet();
    if (!L) return null;

    return L.divIcon({
      className: 'custom-marker',
      html,
      iconSize: size,
      iconAnchor: anchor,
    });
  }

  /**
   * Crea límites para ajustar el mapa.
   */
  async createBounds(
    locations: { latitud: number; longitud: number }[]
  ): Promise<any> {
    const L = await this.getLeaflet();
    if (!L || !locations.length) return null;

    const bounds = L.latLngBounds([]);
    locations.forEach((location) => {
      if (location.latitud && location.longitud) {
        bounds.extend([location.latitud, location.longitud]);
      }
    });
    return bounds.isValid() ? bounds : null;
  }
}
