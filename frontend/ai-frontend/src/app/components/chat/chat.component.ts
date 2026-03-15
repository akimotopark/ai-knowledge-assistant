import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked, SecurityContext } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  updated_at: string;
}

import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements AfterViewChecked {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  sessions = signal<ChatSession[]>([]);
  activeSessionId = signal<number | null>(null);
  
  // Modal State
  isDeleteModalOpen = signal(false);
  sessionToDeleteId = signal<number | null>(null);

  question = signal('');
  loading = signal(false);
  messages = signal<Message[]>([]);

  constructor() {
    this.loadSessions();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  loadSessions() {
    this.api.get<ChatSession[]>('chat/sessions').subscribe({
      next: (res) => {
        this.sessions.set(res);
        if (res.length > 0 && this.activeSessionId() === null) {
          this.selectSession(res[0].id);
        } else if (res.length === 0) {
          this.createNewSession();
        }
      },
      error: (err) => console.error('Error loading sessions:', err)
    });
  }

  createNewSession() {
    this.loading.set(true);
    this.api.post<ChatSession>('chat/sessions', { title: 'New Chat' }).subscribe({
      next: (session) => {
        this.sessions.update(s => [session, ...s]);
        this.selectSession(session.id);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error creating session:', err);
        this.loading.set(false);
      }
    });
  }

  selectSession(id: number) {
    if (this.activeSessionId() === id) return;
    
    this.activeSessionId.set(id);
    this.loading.set(true);
    this.messages.set([]); // clear while loading
    
    this.api.get<Message[]>(`chat/sessions/${id}/messages`).subscribe({
      next: (res) => {
        this.messages.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.loading.set(false);
      }
    });
  }

  deleteSession(e: Event, id: number) {
    e.stopPropagation();
    this.sessionToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.sessionToDeleteId.set(null);
  }

  confirmDeleteSession() {
    const id = this.sessionToDeleteId();
    if (id === null) return;

    this.api.delete(`chat/sessions/${id}`).subscribe({
      next: () => {
        const filtered = this.sessions().filter(s => s.id !== id);
        this.sessions.set(filtered);
        
        if (this.activeSessionId() === id) {
          this.activeSessionId.set(null);
          if (filtered.length > 0) {
            this.selectSession(filtered[0].id);
          } else {
            this.messages.set([]);
          }
        }
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        this.closeDeleteModal();
      }
    });
  }

  async sendQuestion() {
    const q = this.question().trim();
    const sessionId = this.activeSessionId();
    if (!q || this.loading() || !sessionId) return;

    // Optimistically add user msg
    this.messages.update(m => [...m, { role: 'user', content: q }]);
    this.question.set('');
    this.loading.set(true);

    this.api.post<any>(`chat/sessions/${sessionId}/messages`, { content: q }).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Replace optimistic msg with real msgs or just add assistant
        // res contains { userMessage, assistantMessage }
        // For simplicity, just add the new assistant message to the list
        // and optionally reload sessions if title was updated
        this.messages.update(m => [...m, res.assistantMessage]);
        
        // Refresh session list quietly if it was a new chat to get the updated title
        const currentSession = this.sessions().find(s => s.id === sessionId);
        if (currentSession && currentSession.title === "New Chat") {
           this.api.get<ChatSession[]>('chat/sessions').subscribe({
             next: (sessions) => this.sessions.set(sessions)
           });
        }
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
