import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private api = inject(ApiService);
  documents = signal<any[]>([]);
  loading = signal(false);

  constructor() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    this.api.get('admin/documents').subscribe({
      next: (res: any) => {
        this.documents.set(res);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
