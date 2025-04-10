import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../interfaces/auth.interface';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

interface UserResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
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
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';
  private readonly USER_API_URL = 'http://localhost:3000/users';
  private http: HttpClient;
  private router: Router;
  private isBrowser: boolean;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    http: HttpClient, 
    router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.http = http;
    this.router = router;
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.user);
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.access_token);
          }
        }),
        map(response => response.user)
      );
  }

  register(userData: Partial<User> & { contrasena: string }): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isBrowser ? !!this.getToken() : false;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getCurrentUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }

    return this.http.get<UserResponse>(`${environment.apiUrl}/users?nombreUsuario=${this.currentUserSubject.value?.nombreUsuario}`)
      .pipe(
        tap(response => {
          if (response.data && response.data.length > 0) {
            const user = response.data[0];
            this.currentUserSubject.next(user);
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
          }
        }),
        map(response => response.data && response.data.length > 0 ? response.data[0] : null)
      );
  }

  getUsers(params: {
    page?: number;
    limit?: number;
    nombre?: string;
    nombreUsuario?: string;
    telefono?: string;
    rol?: string;
    estado?: boolean;
  }): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${environment.apiUrl}/users`, { params: params as any });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<User> {
    return this.http.delete<User>(`${environment.apiUrl}/users/${id}`);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return roles.includes(user?.rol || '');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isModerator(): boolean {
    return this.hasRole('MODERATOR');
  }

  isOperador(): boolean {
    return this.hasRole('OPERADOR');
  }
} 