import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ConfirmModal],
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private api = inject(ApiService);
  documents = signal<any[]>([]);
  loading = signal(false);

  // Modal State
  isDeleteModalOpen = signal(false);
  documentToDelete = signal<{id: string, title: string} | null>(null);

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

  openDeleteModal(id: string, title: string) {
    this.documentToDelete.set({ id, title });
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.documentToDelete.set(null);
  }

  confirmDelete() {
    const doc = this.documentToDelete();
    if (!doc) return;

    this.loading.set(true);
    this.closeDeleteModal();
    
    this.api.delete(`admin/documents/${doc.id}`).subscribe({
      next: () => {
        this.loadDocuments();
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
