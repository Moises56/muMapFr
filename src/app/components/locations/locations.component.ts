import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Location, LocationUser, LocationResponse } from '../../services/location.service';
import { FormsModule } from '@angular/forms';
import { LeafletService } from '../../services/leaflet.service';
import { SidebarComponent } from '../app/sidebar.component';

// Create types declaration for leaflet-fullscreen
declare module 'leaflet-fullscreen';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="flex flex-col lg:flex-row">
        <!-- Sidebar -->
        <app-sidebar (sidebarToggled)="onSidebarToggle($event)"></app-sidebar>

        <!-- Main Content -->
        <div class="flex-1 transition-all duration-300 ease-in-out" 
            [ngClass]="{
              'lg:ml-64': sidebarOpen,
              'lg:ml-0': !sidebarOpen
            }">
          <!-- Top Navigation -->
          <nav class="bg-white shadow-md sticky top-0 z-10">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <div class="flex-shrink-0 flex items-center ml-10 lg:ml-0">
                    <h1 class="text-xl font-bold text-gray-900">
                      {{ (currentUser$ | async)?.rol === 'OPERADOR' ? 'Mis Ubicaciones' : 'Todas las Ubicaciones' }}
                    </h1>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="ml-3 relative">
                    <div class="flex items-center space-x-4">
                      <span class="text-gray-700 hidden sm:inline">
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
          <main class="flex-1 py-6">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">

              <!-- Controles y filtros -->
              <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <!-- Selector de vista (solo visible en tablets/desktop) -->
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600 hidden md:inline">Vista:</span>
                  <button 
                    (click)="toggleView('table')" 
                    class="p-1.5 rounded-md transition-colors" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'table', 'text-gray-500 hover:bg-gray-100': viewMode !== 'table'}"
                    title="Vista de tabla"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    (click)="toggleView('card')" 
                    class="p-1.5 rounded-md transition-colors" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'card', 'text-gray-500 hover:bg-gray-100': viewMode !== 'card'}"
                    title="Vista de tarjetas"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    (click)="toggleView('map')" 
                    class="p-1.5 rounded-md transition-colors" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'map', 'text-gray-500 hover:bg-gray-100': viewMode !== 'map'}"
                    title="Vista de mapa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                  <button 
                    (click)="toggleView('split')" 
                    class="p-1.5 rounded-md transition-colors hidden md:block" 
                    [ngClass]="{'bg-cyan-100 text-cyan-800': viewMode === 'split', 'text-gray-500 hover:bg-gray-100': viewMode !== 'split'}"
                    title="Vista dividida"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                </div>

                <!-- Filtros -->
                <div class="flex flex-wrap items-center gap-2" *ngIf="(currentUser$ | async)?.rol !== 'OPERADOR'">
                  <button
                    (click)="filterLocations('today')"
                    class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    [ngClass]="{'bg-cyan-600 text-white': currentFilter === 'today', 'bg-gray-200 text-gray-700 hover:bg-gray-300': currentFilter !== 'today'}"
                  >
                    Hoy
                  </button>
                  <button
                    (click)="filterLocations('all')"
                    class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    [ngClass]="{'bg-cyan-600 text-white': currentFilter === 'all', 'bg-gray-200 text-gray-700 hover:bg-gray-300': currentFilter !== 'all'}"
                  >
                    Todas
                  </button>
                  <div class="flex items-center space-x-2">
                    <input
                      type="date"
                      [(ngModel)]="selectedDate"
                      (change)="filterLocations('custom')"
                      class="px-2 py-1 border rounded-md text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    >
                  </div>
                </div>
              </div>

              <!-- Contenedor flexible para vista dividida -->
              <div class="flex flex-col md:flex-row gap-6 mb-6" [ngClass]="{'md:flex-row': viewMode === 'split', 'flex-col': viewMode !== 'split'}">
                <!-- Mapa (visible en vista de mapa o vista dividida) -->
                <div class="w-full" 
                     [ngClass]="{'hidden': viewMode !== 'map' && viewMode !== 'split', 'md:w-1/2': viewMode === 'split'}"
                     [class.h-full]="viewMode === 'map'">
                  <div class="bg-white shadow rounded-lg p-4">
                    <div #map class="h-[400px] md:h-[500px] rounded-lg shadow-inner" *ngIf="leafletService.isPlatformBrowser()"></div>
                  </div>
                </div>

                <!-- Tabla o Cards (dependiendo de la vista) -->
                <div class="w-full" 
                     [ngClass]="{'hidden': viewMode === 'map', 'md:w-1/2': viewMode === 'split'}">
                  
                  <!-- Vista de tabla (para desktop) -->
                  <div *ngIf="viewMode === 'table' || (viewMode === 'split' && !isMobile)" class="bg-white shadow rounded-lg overflow-hidden">
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr *ngFor="let location of locations" 
                              class="hover:bg-gray-50 transition-colors"
                              (click)="focusOnLocation(location)">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {{ location.user?.nombreUsuario || 'N/A' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {{ location.destinoAsignado || 'N/A' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    [ngClass]="{
                                      'bg-green-100 text-green-800': location.estado === 'Finalizado',
                                      'bg-yellow-100 text-yellow-800': location.estado === 'En Progreso',
                                      'bg-blue-100 text-blue-800': location.estado === 'Iniciado',
                                      'bg-gray-100 text-gray-800': !location.estado
                                    }">
                                {{ location.estado || 'N/A' }}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {{ calculateMinutes(location.tiempoEnDestino) }} min
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {{ location.timestamp | date:'short' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ location.latitud.toFixed(6) }}, {{ location.longitud.toFixed(6) }}
                            </td>
                          </tr>

                          <tr *ngIf="locations.length === 0">
                            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                              No hay ubicaciones disponibles con los filtros seleccionados
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Vista de cards (para móvil) -->
                  <div *ngIf="viewMode === 'card' || (viewMode === 'split' && isMobile)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div *ngFor="let location of locations" 
                         class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                         (click)="focusOnLocation(location)">
                      <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center"
                           [ngClass]="{
                            'bg-green-50': location.estado === 'Finalizado',
                            'bg-yellow-50': location.estado === 'En Progreso',
                            'bg-blue-50': location.estado === 'Iniciado',
                            'bg-gray-50': !location.estado
                           }">
                        <div class="flex items-center">
                          <div class="rounded-full w-10 h-10 flex items-center justify-center text-white"
                              [ngClass]="{
                                'bg-green-600': location.estado === 'Finalizado',
                                'bg-yellow-500': location.estado === 'En Progreso',
                                'bg-blue-600': location.estado === 'Iniciado',
                                'bg-gray-500': !location.estado
                              }">
                            {{ (location.user?.nombreUsuario || 'NA').charAt(0) }}
                          </div>
                          <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">
                              {{ location.user?.nombreUsuario || 'N/A' }}
                            </div>
                            <div class="text-xs text-gray-500">
                              {{ location.timestamp | date:'short' }}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                [ngClass]="{
                                  'bg-green-100 text-green-800': location.estado === 'Finalizado',
                                  'bg-yellow-100 text-yellow-800': location.estado === 'En Progreso',
                                  'bg-blue-100 text-blue-800': location.estado === 'Iniciado',
                                  'bg-gray-100 text-gray-800': !location.estado
                                }">
                            {{ location.estado || 'N/A' }}
                          </span>
                        </div>
                      </div>
                      <div class="px-4 py-3">
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div class="flex flex-col">
                            <span class="text-gray-500">Destino</span>
                            <span class="font-medium">{{ location.destinoAsignado || 'N/A' }}</span>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-gray-500">Tiempo</span>
                            <span class="font-medium">{{ calculateMinutes(location.tiempoEnDestino) }} min</span>
                          </div>
                          <div class="flex flex-col col-span-2">
                            <span class="text-gray-500">Coordenadas</span>
                            <span class="font-medium text-gray-700">{{ location.latitud.toFixed(6) }}, {{ location.longitud.toFixed(6) }}</span>
                          </div>
                        </div>
                        <div class="mt-2 pt-2 border-t border-gray-100 text-right">
                          <button
                            (click)="$event.stopPropagation(); focusOnLocation(location)"
                            class="text-xs text-cyan-600 hover:text-cyan-800"
                          >
                            Ver en mapa
                          </button>
                        </div>
                      </div>
                    </div>

                    <div *ngIf="locations.length === 0" class="col-span-full p-6 text-center text-gray-500 bg-white rounded-lg shadow">
                      No hay ubicaciones disponibles con los filtros seleccionados
                    </div>
                  </div>
                </div>
              </div>

              <!-- Paginación -->
              <div class="mt-5 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
                <div class="flex flex-1 justify-between sm:hidden">
                  <button 
                    (click)="previousPage()"
                    [disabled]="currentPage <= 1"
                    class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    [ngClass]="{'opacity-50 cursor-not-allowed': currentPage <= 1}"
                  >
                    Anterior
                  </button>
                  <button
                    (click)="nextPage()"
                    [disabled]="currentPage >= totalPages"
                    class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    [ngClass]="{'opacity-50 cursor-not-allowed': currentPage >= totalPages}"
                  >
                    Siguiente
                  </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Mostrando
                      <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                      a
                      <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
                      de
                      <span class="font-medium">{{ totalItems }}</span>
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        (click)="previousPage()"
                        [disabled]="currentPage <= 1"
                        class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        [ngClass]="{'opacity-50 cursor-not-allowed': currentPage <= 1}"
                      >
                        <span class="sr-only">Anterior</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <!-- Páginas -->
                      <ng-container *ngFor="let page of getPaginationArray(); let i = index">
                        <button
                          *ngIf="page !== '...'"
                          (click)="goToPage(+page)"
                          [ngClass]="{
                            'bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600': currentPage === +page,
                            'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0': currentPage !== +page
                          }"
                          class="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
                          aria-current="page"
                        >
                          {{ page }}
                        </button>
                        <span
                          *ngIf="page === '...'"
                          class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                        >
                          ...
                        </span>
                      </ng-container>
                      <button
                        (click)="nextPage()"
                        [disabled]="currentPage >= totalPages"
                        class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        [ngClass]="{'opacity-50 cursor-not-allowed': currentPage >= totalPages}"
                      >
                        <span class="sr-only">Siguiente</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .location-popup h3 {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .location-popup p {
      margin: 2px 0;
    }
    
    .custom-marker {
      background: none;
    }
    
    .marker-content {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #3B82F6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    /* Transition para efecto glass del overlay */
    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  `]
})
export class LocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public leafletService = inject(LeafletService);

  @ViewChild('map') mapElementRef!: ElementRef;

  Math = Math; // Para usar Math en el template
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
  sidebarOpen = false;
  viewMode: 'table' | 'card' | 'map' | 'split' = 'table';
  isMobile = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.route.queryParams.subscribe((params: { [key: string]: string }) => {
      if (params['filter'] === 'today') {
        this.currentFilter = 'today';
      } else if (params['startDate']) {
        this.currentFilter = 'custom';
        this.selectedDate = params['startDate'].split('T')[0];
      }
      
      // Asegurarse de cargar los datos
      this.loadLocations();
    });
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // Si estamos en móvil, cambiar a vista de tarjetas por defecto
    if (this.isMobile && this.viewMode === 'table') {
      this.viewMode = 'card';
    }
  }

  onSidebarToggle(isOpen: boolean) {
    this.sidebarOpen = isOpen;
    // Ajustar el mapa cuando el sidebar cambie
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  toggleView(view: 'table' | 'card' | 'map' | 'split') {
    this.viewMode = view;
    // Ajustar el mapa después de cambiar de vista
    setTimeout(() => {
      if ((view === 'map' || view === 'split') && this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  async ngAfterViewInit() {
    if (this.leafletService.isPlatformBrowser() && this.mapElementRef?.nativeElement) {
      const L = await this.leafletService.getLeaflet();
      
      // Importar los plugins de Leaflet necesarios
      try {
        // Cargar el CSS manualmente en vez de importarlo
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet-fullscreen@1.0.2/dist/leaflet.fullscreen.css';
        document.head.appendChild(link);
        
        // Importar el módulo
        await import('leaflet-fullscreen');
        this.initializeMap(L);
      } catch (error) {
        console.error('Error cargando plugins de Leaflet:', error);
        // Inicializar el mapa sin los plugins
        this.initializeMap(L);
      }
    }
  }

  private initializeMap(L: any): void {
    this.map = L.map(this.mapElementRef.nativeElement).setView([19.4326, -99.1332], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Añadir escala
    L.control.scale().addTo(this.map);

    // Cargar ubicaciones cuando el mapa esté listo
    this.loadLocations();

    // Ajustar el mapa al cambiar el tamaño de la ventana
    this.map.on('resize', () => {
      setTimeout(() => {
        if (this.bounds && this.markers.length > 0) {
          this.map.fitBounds(this.bounds);
        }
      }, 200);
    });
    
    // Intentar cargar el plugin fullscreen de manera segura
    this.tryAddFullscreenControl(L);
  }
  
  private async tryAddFullscreenControl(L: any): Promise<void> {
    try {
      if (L.control.fullscreen && typeof L.control.fullscreen === 'function') {
        L.control.fullscreen({
          position: 'topright',
          title: {
            'false': 'Ver en pantalla completa',
            'true': 'Salir de pantalla completa'
          }
        }).addTo(this.map);
      }
    } catch (error) {
      console.warn('Fullscreen control no disponible:', error);
    }
  }

  loadLocations(): void {
    const params: { [key: string]: any } = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Aplicar filtros
    if (this.selectedEstado) {
      params['estado'] = this.selectedEstado;
    }
    if (this.selectedDestino) {
      params['destinoAsignado'] = this.selectedDestino;
    }

    // Aplicar filtros de fechas
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
        if (this.leafletService.isPlatformBrowser() && this.map) {
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

    // Limpiar marcadores existentes
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.bounds = null;

    // Añadir nuevos marcadores
    this.locations.forEach(location => {
      if (location.latitud && location.longitud) {
        const marker = L.marker([location.latitud, location.longitud], {
          icon: this.getMarkerIcon(L, location.user?.nombreUsuario || 'NA')
        });

        const timestamp = location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A';
        const popupContent = `
          <div class="location-popup">
            <h3>${location.user?.nombreUsuario || 'Desconocido'}</h3>
            <p><strong>Destino:</strong> ${location.destinoAsignado || 'N/A'}</p>
            <p><strong>Estado:</strong> ${location.estado || 'N/A'}</p>
            <p><strong>Hora:</strong> ${timestamp}</p>
            <p><strong>Tiempo en destino:</strong> ${this.calculateMinutes(location.tiempoEnDestino)} minutos</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        if (this.map) {
          marker.addTo(this.map);
        }
        this.markers.push(marker);

        // Actualizar límites
        const latLng = [location.latitud, location.longitud];
        if (!this.bounds) {
          this.bounds = L.latLngBounds([latLng, latLng]);
        } else {
          this.bounds.extend(latLng);
        }
      }
    });

    // Ajustar el mapa a los límites si hay marcadores
    if (this.bounds && this.markers.length > 0) {
      this.map.fitBounds(this.bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }

  filterLocations(filter: 'today' | 'all' | 'custom'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Resetear a la primera página al cambiar filtro
    this.loadLocations();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLocations();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLocations();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLocations();
    }
  }

  getPaginationArray(): (number | string)[] {
    const result: (number | string)[] = [];
    
    if (this.totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        result.push(i);
      }
    } else {
      // Siempre incluir la primera página
      result.push(1);
      
      // Si la página actual está cerca del inicio
      if (this.currentPage <= 4) {
        result.push(2, 3, 4, 5);
        result.push('...');
        result.push(this.totalPages);
      } 
      // Si la página actual está cerca del final
      else if (this.currentPage >= this.totalPages - 3) {
        result.push('...');
        result.push(this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1);
        result.push(this.totalPages);
      } 
      // Si la página actual está en el medio
      else {
        result.push('...');
        result.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
        result.push('...');
        result.push(this.totalPages);
      }
    }
    
    return result;
  }

  focusOnLocation(location: Location): void {
    // Cambiar a vista de mapa si estamos en vista de tarjetas/tabla
    if (this.viewMode !== 'map' && this.viewMode !== 'split') {
      this.toggleView(this.isMobile ? 'map' : 'split');
    }
    
    // Centrar el mapa en la ubicación
    setTimeout(async () => {
      if (this.map && location.latitud && location.longitud) {
        // Centrar en la ubicación
        this.map.setView([location.latitud, location.longitud], 16);
        
        // Encontrar y abrir el popup del marcador
        const marker = this.markers.find(m => {
          const latLng = m.getLatLng();
          return latLng.lat === location.latitud && latLng.lng === location.longitud;
        });
        
        if (marker) {
          marker.openPopup();
        }
      }
    }, 300);
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

  private getMarkerIcon(L: any, username: string): any {
    // Crear un icono personalizado para el marcador
    const firstLetter = username.charAt(0).toUpperCase();
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-content">${firstLetter}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }
}