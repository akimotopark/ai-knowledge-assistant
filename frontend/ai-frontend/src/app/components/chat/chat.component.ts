import { Component, signal, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent {
  private api = inject(ApiService);

  question = signal('');
  loading = signal(false);
  messages = signal<Message[]>([]);

  async sendQuestion() {
    const q = this.question().trim();
    if (!q) return;

    this.messages.update(m => [...m, { role: 'user', content: q }]);
    this.question.set('');
    this.loading.set(true);

    this.api.post<any>('rag/ask', { question: q }).subscribe({
      next: (res) => {
        console.log('Chat success:', res);
        this.loading.set(false);
        this.messages.update(m => [...m, { role: 'assistant', content: res?.answer || 'No answer' }]);
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.loading.set(false);
        this.messages.update(m => [...m, { role: 'assistant', content: 'Error: ' + err }]);
      }
    })

  }

}
