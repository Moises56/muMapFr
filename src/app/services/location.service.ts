// src/app/services/location.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocationUser {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
}

export interface Location {
  id?: string;
  userId: string;
  latitud: number;
  longitud: number;
  destinoAsignado: string;
  tiempoEnDestino: number;
  estado?: string;
  timestamp?: string;
  user?: LocationUser;
}

export interface LocationResponse {
  data: Location[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LocationSave {
  latitud: number;
  longitud: number;
  destinoAsignado: string;
  tiempoEnDestino: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly API_URL = 'http://localhost:3000/locations';
  private http = inject(HttpClient);

  createLocation(location: LocationSave): Observable<Location> {
    return this.http.post<Location>(this.API_URL, location);
  }

  getAllLocations(params?: { 
    page?: number; 
    limit?: number; 
    userId?: string;
    estado?: string;
    destinoAsignado?: string;
    startDate?: string;
  }): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(this.API_URL, { params });
  }

  getMyLocations(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    destinoAsignado?: string;
    startDate?: string;
  }): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.API_URL}/my-locations`, { params });
  }

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.API_URL}/${id}`);
  }

  updateLocation(id: string, location: Partial<Location>): Observable<Location> {
    return this.http.patch<Location>(`${this.API_URL}/${id}`, location);
  }

  getLatestLocations(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.API_URL}/latest`);
  }
}