import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/Services/AiService/ai-service';

interface Message {
  role: 'user' | 'ai';
  content: string;
  isImage?: boolean;
  imagePreview?: string;
  imagePath?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
}

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-page.html',
  styleUrl: './ai-page.css',
})
export class AiPage implements AfterViewChecked, OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  userInput = '';
  messages: Message[] = [];
  isLoading = false;
  sidebarCollapsed = false;
  conversationLocked = false;
  queriesUsed = 0;
  queriesRemaining = 10;

  activeChatId: string | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  chatHistory: ChatHistory[] = [];

  private shouldScrollToBottom = false;

  constructor(private service: AiService) {}

  ngOnInit() {
    this.loadSessions();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ── Sidebar ──────────────────────────────────────────
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadSessions() {
    this.service.GetSessions().subscribe({
      next: (sessions) => {
        this.chatHistory = sessions.map(s => ({
          id: s.id,
          title: s.title,
          messages: []
        }));
      }
    });
  }

  loadChat(id: string) {
    this.service.GetSession(id).subscribe({
      next: (msgs) => {
        this.activeChatId = id;
        this.conversationLocked = false;
      this.messages = msgs.map((m): Message => ({
  role: m.role === 'user' ? 'user' : 'ai',
  content: m.content ?? '',
  isImage: m.isImage,
  imagePath: m.imagePath ?? undefined
}));

        // Count how many user messages to restore limit state
        const userCount = this.messages.filter(m => m.role === 'user').length;
        this.queriesUsed = userCount;
        this.queriesRemaining = 10 - userCount;
        if (userCount >= 10) this.conversationLocked = true;

        this.shouldScrollToBottom = true;
      }
    });
  }

  startNewChat() {
    this.messages = [];
    this.activeChatId = null;
    this.userInput = '';
    this.conversationLocked = false;
    this.queriesUsed = 0;
    this.queriesRemaining = 10;
    this.clearImage();
  }

  deleteSession(id: string, event: Event) {
    event.stopPropagation();
    this.service.DeleteSession(id).subscribe({
      next: () => {
        this.chatHistory = this.chatHistory.filter(c => c.id !== id);
        if (this.activeChatId === id) this.startNewChat();
      }
    });
  }

  // ── Image ─────────────────────────────────────────────
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedImage);
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  // ── Messaging ─────────────────────────────────────────
  sendSuggestion(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    const text = this.userInput.trim();
    if ((!text && !this.selectedImage) || this.isLoading || this.conversationLocked) return;

    // Push user message to UI
    this.messages.push({
      role: 'user',
      content: text,
      isImage: !!this.selectedImage,
      imagePreview: this.imagePreview ?? undefined
    });

    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    if (this.selectedImage) {
      this.sendImageMessage(text);
    } else {
      this.sendTextMessage(text);
    }
  }

  private sendTextMessage(text: string) {
    this.service.Ask(text, this.activeChatId ?? undefined).subscribe({
      next: (res) => {
        // If new chat, add to sidebar
        if (!this.activeChatId) {
          this.chatHistory.unshift({ id: res.sessionId, title: res.sessionTitle, messages: [] });
        }
        this.activeChatId = res.sessionId;

        this.messages.push({ role: 'ai', content: res.answer });
        this.queriesUsed = res.queriesUsed;
        this.queriesRemaining = res.queriesRemaining;

        if (res.conversationEnded) {
          this.conversationLocked = true;
          this.messages.push({
            role: 'ai',
            content: '⚠️ This conversation has reached the 10 question limit. Please start a new chat.'
          });
        }

        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Sorry, something went wrong. Please try again.';
        this.messages.push({ role: 'ai', content: msg });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  private sendImageMessage(text: string) {
    const image = this.selectedImage!;
    this.clearImage();

    this.service.AskWithImage(image, text, this.activeChatId ?? undefined).subscribe({
      next: (res) => {
        if (!this.activeChatId) {
          this.chatHistory.unshift({ id: res.sessionId, title: res.sessionTitle, messages: [] });
        }
        this.activeChatId = res.sessionId;

        this.messages.push({ role: 'ai', content: res.answer });
        this.queriesUsed = res.queriesUsed;
        this.queriesRemaining = res.queriesRemaining;

        if (res.conversationEnded) {
          this.conversationLocked = true;
          this.messages.push({
            role: 'ai',
            content: '⚠️ This conversation has reached the 10 question limit. Please start a new chat.'
          });
        }

        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Sorry, something went wrong. Please try again.';
        this.messages.push({ role: 'ai', content: msg });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}