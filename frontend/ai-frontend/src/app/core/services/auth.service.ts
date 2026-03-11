import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private api = inject(ApiService);
    private router = inject(Router);

    private platformId = inject(PLATFORM_ID);

    // ✅ Modern: Signals allow the UI to react instantly to login status
    currentUserToken = signal<string | null>(isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null);

    register(data: any) {
        return this.api.post('auth/register', data);
    }

    login(data: any) {
        return this.api.post<{ token: string }>('auth/login', data);
    }

    saveToken(token: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
        }
        this.currentUserToken.set(token);
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }
        return null;
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
        }
        this.currentUserToken.set(null);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserToken();
    }
}