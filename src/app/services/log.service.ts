import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Log {
  id: string;
  key: string | null;
  accion: string;
  userId: string;
  timestamp: string;
  ip: string;
  descripcion: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    rol: string;
  };
}

export interface LogResponse {
  data: Log[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) {}

  getLogs(page: number = 1, limit: number = 10, filters?: any): Observable<LogResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<LogResponse>(this.apiUrl, { params });
  }

  getUserLogs(userId: string, page: number = 1, limit: number = 10): Observable<LogResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<LogResponse>(`${this.apiUrl}/user`, { params });
  }
} 