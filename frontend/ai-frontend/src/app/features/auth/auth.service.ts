import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  getRole(): string {
    const token = this.auth.getToken();
    if (!token) return '';
    const decodedToken = jwtDecode<any>(token);
    return decodedToken.role || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
}