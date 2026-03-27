import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/Services/AiService/ai-service';
import { AiResponseDto } from '../../core/Dtos/AiResponseDto';

interface Message {
  role: 'user' | 'ai';
  content: string;
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
export class AiPage implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  userInput = '';
  messages: Message[] = [];
  isLoading = false;
  sidebarCollapsed = false;
  

  activeChatId: string | null = null;
  
   constructor(
   
    private service: AiService
  ) {}

  

  chatHistory: ChatHistory[] = [
    { id: '1', title: 'Crop rotation strategies', messages: [] },
    { id: '2', title: 'Soil pH for tomatoes', messages: [] },
    { id: '3', title: 'Wheat disease identification', messages: [] },
  ];

  private shouldScrollToBottom = false;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  startNewChat() {
    this.messages = [];
    this.activeChatId = null;
    this.userInput = '';
  }

  loadChat(id: string) {
    const chat = this.chatHistory.find(c => c.id === id);
    if (chat) {
      this.activeChatId = id;
      this.messages = [...chat.messages];
      this.shouldScrollToBottom = true;
    }
  }

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

  async sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    // Add user message
    this.messages.push({ role: 'user', content: text });
    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Auto-save to history if new chat
    if (!this.activeChatId) {
      const newId = Date.now().toString();
      const title = text.length > 40 ? text.substring(0, 40) + '...' : text;
      const newChat: ChatHistory = { id: newId, title, messages: [] };
      this.chatHistory.unshift(newChat);
      this.activeChatId = newId;
    }

    try {
      
        
      var response = this.service.Ask(text).subscribe(
        {
          next:(res)=>{
              const aiText = res.answer; 
              console.log(res.answer)

              this.messages.push({ role: 'ai', content: aiText });

          }
        }
      );

     
     

      // Save messages to active chat history
      const activeChat = this.chatHistory.find(c => c.id === this.activeChatId);
      if (activeChat) {
        activeChat.messages = [...this.messages];
      }

    } catch (error) {
      this.messages.push({
        role: 'ai',
        content: 'Sorry, I encountered an error connecting to the AI service. Please check your connection and try again.'
      });
    } finally {
      this.isLoading = false;
      this.shouldScrollToBottom = true;
    }
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}