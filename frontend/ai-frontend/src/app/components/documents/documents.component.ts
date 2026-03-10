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

    console.log('Uploading document...', { title: this.title() });

    this.api.postForm<any>('documents/upload', formData)
      .subscribe({
        next: (res) => {
          console.log('Upload success:', res);
          this.loading.set(false);
          this.message.set(res.message || "Document uploaded successfully.");
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
}
