import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../interfaces/auth.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <img class="mx-auto h-20 w-auto" src="/logo/logo.png" alt="Logo" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Username Field -->
            <div>
              <label for="nombreUsuario" class="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div class="mt-1 relative">
                <input
                  id="nombreUsuario"
                  type="text"
                  formControlName="nombreUsuario"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  [ngClass]="{'border-red-300': isFieldInvalid('nombreUsuario'), 'border-gray-300': !isFieldInvalid('nombreUsuario')}"
                />
                <div *ngIf="isFieldInvalid('nombreUsuario')" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p *ngIf="isFieldInvalid('nombreUsuario')" class="mt-2 text-sm text-red-600">
                Por favor ingrese su nombre de usuario
              </p>
            </div>

            <!-- Password Field -->
            <div>
              <label for="contrasena" class="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div class="mt-1 relative">
                <input
                  id="contrasena"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="contrasena"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  [ngClass]="{'border-red-300': isFieldInvalid('contrasena'), 'border-gray-300': !isFieldInvalid('contrasena')}"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    *ngIf="!showPassword"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    *ngIf="showPassword"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
              <p *ngIf="isFieldInvalid('contrasena')" class="mt-2 text-sm text-red-600">
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember_me" class="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  *ngIf="isLoading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    {{ errorMessage }}
                  </h3>
                </div>
              </div>
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
  showPassword = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.loginForm.get(field);
    return formControl ? formControl.invalid && (formControl.dirty || formControl.touched) : false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else {
            this.errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
          }
          // Marcar los campos como tocados para mostrar los errores
          this.loginForm.get('nombreUsuario')?.markAsTouched();
          this.loginForm.get('contrasena')?.markAsTouched();
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
