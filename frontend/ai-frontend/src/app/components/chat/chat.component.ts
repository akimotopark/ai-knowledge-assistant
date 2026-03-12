import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked, SecurityContext } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
export class ChatComponent implements AfterViewChecked {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  question = signal('');
  loading = signal(false);
  messages = signal<Message[]>([]);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  async sendQuestion() {
    const q = this.question().trim();
    if (!q || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', content: q }]);
    this.question.set('');
    this.loading.set(true);

    this.api.post<any>('rag/ask', { question: q }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.messages.update(m => [...m, { role: 'assistant', content: res?.answer || 'I couldn\'t find any information on that.' }]);
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.loading.set(false);
        this.messages.update(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    });
  }
  parseMarkdown(content: string): SafeHtml {
    const rawHtml = marked.parse(content) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
