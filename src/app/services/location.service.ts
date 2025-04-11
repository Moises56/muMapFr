// src/app/services/location.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LocationUser {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  rol?: string;
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
  precision?: number;
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

export interface LocationSummary {
  totalUbicaciones: number;
  ubicacionesHoy: number;
  ultimaUbicacion?: {
    id: string;
    latitud: number;
    longitud: number;
    timestamp: string;
    estado: string;
    destinoAsignado: string;
    user: {
      id: string;
      nombre: string;
      apellido: string;
      nombreUsuario: string;
    };
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly API_URL = `${environment.apiUrl}/locations`;
  private http = inject(HttpClient);

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

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
    endDate?: string;
  }): Observable<LocationResponse> {
    return this.http.get<Location[]>(this.API_URL, { params }).pipe(
      map(locations => ({
        data: locations,
        meta: {
          total: locations.length,
          page: params?.page || 1,
          limit: params?.limit || locations.length,
          totalPages: Math.ceil(locations.length / (params?.limit || locations.length)),
          hasNextPage: false,
          hasPreviousPage: false
        }
      })),
      catchError(this.handleError)
    );
  }

  getMyLocations(): Observable<LocationResponse> {
    return this.http.get<Location[]>(`${this.API_URL}/my-locations`).pipe(
      map(locations => ({
        data: locations,
        meta: {
          total: locations.length,
          page: 1,
          limit: locations.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      })),
      catchError(this.handleError)
    );
  }

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateLocation(id: string, location: { estado?: string; destinoAsignado?: string }): Observable<Location> {
    return this.http.patch<Location>(`${this.API_URL}/${id}`, location)
      .pipe(catchError(this.handleError));
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getLatestLocations(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.API_URL}/latest`)
      .pipe(catchError(this.handleError));
  }

  getSummary(): Observable<LocationSummary> {
    return this.http.get<LocationSummary>(`${this.API_URL}/summary`)
      .pipe(catchError(this.handleError));
  }
}