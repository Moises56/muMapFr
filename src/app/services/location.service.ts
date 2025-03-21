// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id?: string;
  nameUser?: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/location'; // Adjust URL based on your NestJS backend

  constructor(private http: HttpClient) {}

  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, location);
  }

  getAllLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }
}