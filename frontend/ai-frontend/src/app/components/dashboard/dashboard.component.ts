import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthGuard } from '../../features/auth/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  public authGuard = inject(AuthGuard);
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  stats = signal({
    totalDocuments: 0,
    recentUploads: 0,
    aiInteractions: 0
  });

  constructor() {
    this.loadStats();
  }

  loadStats() {
    this.api.get<any>('stats/dashboard').subscribe({
      next: (res) => this.stats.set(res),
      error: (err) => console.error('Error loading dashboard stats:', err)
    });
  }

  logout() {
    this.auth.logout();
  }
}
