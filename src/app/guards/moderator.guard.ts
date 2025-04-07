import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const moderatorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (user?.rol === 'ADMIN' || user?.rol === 'MODERATOR') {
    return true;
  }

  router.navigate(['/dashboard/location']);
  return false;
}; 