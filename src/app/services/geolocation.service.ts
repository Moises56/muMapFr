import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}

  getCurrentPosition(): Observable<GeolocationPosition | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return of(null);
    }

    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position),
          error => {
            console.warn('Geolocation error:', this.getGeolocationErrorMessage(error));
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      })
    ).pipe(
      catchError(error => {
        console.warn('Error getting location:', this.getGeolocationErrorMessage(error));
        return of(null);
      })
    );
  }

  watchPosition(): Observable<GeolocationPosition | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return of(null);
    }

    return new Observable<GeolocationPosition | null>(observer => {
      const watchId = navigator.geolocation.watchPosition(
        position => observer.next(position),
        error => {
          console.warn('Error watching position:', this.getGeolocationErrorMessage(error));
          observer.next(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'El usuario ha denegado el permiso de geolocalización. Por favor, habilita la geolocalización en la configuración de tu navegador.';
      case error.POSITION_UNAVAILABLE:
        return 'La información de ubicación no está disponible. Por favor, verifica que tu GPS esté activado.';
      case error.TIMEOUT:
        return 'Se ha agotado el tiempo de espera para obtener tu ubicación. Por favor, intenta nuevamente.';
      default:
        return 'Ha ocurrido un error al obtener tu ubicación. Por favor, intenta nuevamente.';
    }
  }
} 