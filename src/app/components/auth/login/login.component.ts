import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="nombreUsuario" class="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <div class="mt-1">
                <input
                  id="nombreUsuario"
                  type="text"
                  formControlName="nombreUsuario"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [ngClass]="{'border-red-500': showError('nombreUsuario')}"
                />
                @if (showError('nombreUsuario')) {
                  <p class="mt-2 text-sm text-red-600">El nombre de usuario es requerido</p>
                }
              </div>
            </div>

            <div>
              <label for="contrasena" class="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div class="mt-1">
                <input
                  id="contrasena"
                  type="password"
                  formControlName="contrasena"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [ngClass]="{'border-red-500': showError('contrasena')}"
                />
                @if (showError('contrasena')) {
                  <p class="mt-2 text-sm text-red-600">La contraseña es requerida</p>
                }
              </div>
            </div>

            @if (errorMessage) {
              <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">{{ errorMessage }}</span>
              </div>
            }

            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                @if (isLoading) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]]
    });
  }

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error.message || 'Error al iniciar sesión';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
} 