import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: any): boolean {
    const requiredRoles = route.data['roles'] as string[];
    let hasAccess = false;

    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth/login']);
        hasAccess = false;
        return;
      }

      if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
        this.router.navigate(['/dashboard']);
        hasAccess = false;
        return;
      }

      hasAccess = true;
    });

    return hasAccess;
  }
} 