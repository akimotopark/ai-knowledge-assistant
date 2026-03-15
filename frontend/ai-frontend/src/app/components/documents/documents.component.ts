import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class DocumentsComponent {
  private api = inject(ApiService);

  title = signal('');
  description = signal('');
  selectedFile: File | null = null;
  message = signal('');
  loading = signal(false);
  
  // Processing state
  isProcessing = signal(false);
  processingProgress = signal(0);
  processingStatus = signal<'pending' | 'processing' | 'processed' | 'error'>('pending');
  currentDocId = signal<number | null>(null);

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile || !this.title()) {
      this.message.set("Title and file are required.");
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title());
    formData.append('description', this.description());
    formData.append('file', this.selectedFile);

    this.loading.set(true);
    this.message.set('');
    this.isProcessing.set(false);
    this.processingProgress.set(0);

    this.api.postForm<any>('documents/upload', formData)
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.currentDocId.set(res.metadata.id);
          this.startPolling(res.metadata.id);
          
          this.title.set('');
          this.description.set('');
          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.loading.set(false);
          this.message.set("Upload failed. Please try again.");
        }
      });
  }

  startPolling(docId: number) {
    this.isProcessing.set(true);
    this.processingStatus.set('pending');
    this.processingProgress.set(10);
    
    const interval = setInterval(() => {
      this.api.get<any>(`admin/documents`).subscribe({
        next: (docs: any[]) => {
          const doc = docs.find(d => d.id === docId);
          if (doc) {
            this.processingStatus.set(doc.status);
            
            if (doc.status === 'processed') {
              this.processingProgress.set(100);
              this.message.set("Success! Document processed and indexed.");
              setTimeout(() => this.isProcessing.set(false), 3000);
              clearInterval(interval);
            } else if (doc.status === 'error') {
              this.message.set("Processing failed after upload. Check server logs.");
              clearInterval(interval);
            } else {
              // Simulate smooth progress while pending/processing
              const current = this.processingProgress();
              if (current < 90) this.processingProgress.set(current + 5);
            }
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
          clearInterval(interval);
          this.isProcessing.set(false);
          this.message.set("Lost connection while tracking processing.");
        }
      });
    }, 2000);
  }
}
