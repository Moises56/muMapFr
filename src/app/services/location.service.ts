// src/app/services/location.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id?: string;
  userId: string;
  latitud: number;
  longitud: number;
  destinoAsignado: string;
  tiempoEnDestino: number;
  estado?: string;
  timestamp?: string;
}

export interface LocationSave {
  // id?: string;
  // userId: string;
  latitud: number;
  longitud: number;
  destinoAsignado: string;
  tiempoEnDestino: number;
  // estado?: string;
  // timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly API_URL = 'http://localhost:3000/locations';
  private http = inject(HttpClient);

  createLocation(location: LocationSave): Observable<Location> {
    console.log(location);
    return this.http.post<Location>(this.API_URL, location);
  }

  getAllLocations(params?: { 
    page?: number; 
    limit?: number; 
    userId?: string;
    estado?: string;
    destinoAsignado?: string;
  }): Observable<{ data: Location[]; meta: any }> {
    return this.http.get<{ data: Location[]; meta: any }>(this.API_URL, { params });
  }

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.API_URL}/${id}`);
  }

  updateLocation(id: string, location: Partial<Location>): Observable<Location> {
    return this.http.patch<Location>(`${this.API_URL}/${id}`, location);
  }
}