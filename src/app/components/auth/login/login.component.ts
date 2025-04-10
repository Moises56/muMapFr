import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div
      class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        <!-- Logo -->
        <div class="flex justify-center">
          <img src="/logo/logo.png" alt="Logo" class="h-16 w-auto" />
        </div>

        <!-- Title -->
        <h2 class="text-center text-2xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label
              for="nombreUsuario"
              class="block text-sm font-medium text-gray-700"
            >
              Correo electrónico o nombre de usuario
            </label>
            <div class="mt-1">
              <input
                id="nombreUsuario"
                type="text"
                formControlName="nombreUsuario"
                class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ingresa tu usuario"
                [ngClass]="{ 'border-red-500': showError('nombreUsuario') }"
              />
              @if (showError('nombreUsuario')) {
              <p class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('nombreUsuario') }}
              </p>
              }
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label
              for="contrasena"
              class="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div class="mt-1 relative">
              <input
                id="contrasena"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="contrasena"
                class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ingresa tu contraseña"
                [ngClass]="{ 'border-red-500': showError('contrasena') }"
              />
              <button
                type="button"
                (click)="togglePassword()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  @if (showPassword) {
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                  } @else {
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
                  }
                </svg>
              </button>
              @if (showError('contrasena')) {
              <p class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('contrasena') }}
              </p>
              }
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="text-sm text-right">
            <a
              href="#"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              [ngClass]="{
                'bg-gray-400 cursor-not-allowed':
                  loginForm.invalid || isLoading,
                'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500':
                  !(loginForm.invalid || isLoading)
              }"
            >
              @if (isLoading) {
              <svg
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
              }
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>

        <!-- Register Link -->
        <div class="text-center text-sm">
          <span class="text-gray-600">¿No tienes cuenta? </span>
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
            Regístrate
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Add any additional styles if needed */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px white inset;
        box-shadow: 0 0 0px 1000px white inset;
        -webkit-text-fill-color: #000;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          // Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/), // At least one letter and one number
        ],
      ],
    });
  }

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return field === 'nombreUsuario'
        ? 'El nombre de usuario es requerido'
        : 'La contraseña es requerida';
    }
    if (control.errors['minlength']) {
      return field === 'nombreUsuario'
        ? 'El nombre de usuario debe tener al menos 3 caracteres'
        : 'La contraseña debe tener al menos 6 caracteres';
    }
    // if (control.errors['pattern']) {
    //   return 'La contraseña debe contener al menos una letra y un número';
    // }
    return 'Error desconocido';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.toastr.success('¡Inicio de sesión exitoso!', 'Bienvenido');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMsg = error.error.message || 'Error al iniciar sesión';
          this.toastr.error(errorMsg, 'Error');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastr.warning(
        'Por favor, corrige los errores en el formulario',
        'Advertencia'
      );
    }
  }
}
