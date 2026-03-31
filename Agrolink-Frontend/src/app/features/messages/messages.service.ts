import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface MessageDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  sent: string;
  isImage?: boolean;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerProfile: string;
  lastMessage?: MessageDto;
}

export interface Connection {
  id: string;
  name: string;
  profileImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private hubConnection!: signalR.HubConnection;
  private messagesMap = new Map<string, MessageDto[]>();
  public messages$ = new BehaviorSubject<MessageDto[]>([]);
  currentConversationId: string = '';

  private apiUrl = 'http://localhost:5131/api/Message';
  private hubUrl = 'http://localhost:5131/chatHub';
  private baseUrl = 'http://localhost:5131';   // ← one place to change if server URL changes

  constructor(private http: HttpClient) {
    this.startConnection();
  }

  async startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .configureLogging(signalR.LogLevel.Trace)
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR connected');

      this.hubConnection.on('ReceiveMessage', (message: MessageDto) => {
        const convId = message.conversationId;
        if (!this.messagesMap.has(convId)) this.messagesMap.set(convId, []);
        this.messagesMap.get(convId)!.push(message);
        if (convId === this.currentConversationId) {
          this.messages$.next([...this.messagesMap.get(convId)!]);
        }
      });

      this.hubConnection.on('ReceiveImage', (message: MessageDto) => {
        const convId = message.conversationId;
        if (!this.messagesMap.has(convId)) this.messagesMap.set(convId, []);

        const fullMessage: MessageDto = {
          ...message,
          content: `${this.baseUrl}${message.content}`,  // ✅ relative → absolute
          isImage: true
        };

        this.messagesMap.get(convId)!.push(fullMessage);
        if (convId === this.currentConversationId) {
          this.messages$.next([...this.messagesMap.get(convId)!]);
        }
      });

    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }

  createConversation(user1Id: string, user2Id: string) {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, { user1Id, user2Id });
  }

  getConversations(userId: string) {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  getConnections(userId: string) {
    return this.http.get<Connection[]>(`${this.apiUrl}/connections/${userId}`);
  }

  openConversation(conversationId: string) {
  this.currentConversationId = conversationId;

  this.http.get<MessageDto[]>(`${this.apiUrl}/messages/${conversationId}`)
    .subscribe(messages => {
      const mapped = messages.map(m => {
        const isImg = m.isImage || (m.content?.startsWith('/images/') ?? false);
        return {
          ...m,
          isImage: isImg,
          content: isImg ? `${this.baseUrl}${m.content}` : (m.content ?? '')
        };
      });

      //  Only append temp messages — real messages are already in DB response
      const cached = this.messagesMap.get(conversationId) ?? [];
      const unsaved = cached.filter(m => m.messageId.startsWith('temp-'));

      const merged = [...mapped, ...unsaved];
      this.messagesMap.set(conversationId, merged);
      this.messages$.next(merged);
    });
}
 sendMessage(senderId: string, receiverId: string, content: string) {
  if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
    console.warn('Hub not connected yet!');
    return;
  }

  const tempId = 'temp-' + Date.now();

  const tempMessage: MessageDto = {
    messageId: tempId,
    conversationId: this.currentConversationId,
    senderId,
    content,
    sent: new Date().toISOString()
  };

  if (!this.messagesMap.has(this.currentConversationId)) 
    this.messagesMap.set(this.currentConversationId, []);
  
  this.messagesMap.get(this.currentConversationId)!.push(tempMessage);
  this.messages$.next([...this.messagesMap.get(this.currentConversationId)!]);

  this.http.post<MessageDto>(`${this.apiUrl}/send`, {
    senderId,
    conversationId: this.currentConversationId,
    content
  }).subscribe({
    next: (savedMessage) => {
      // Replace temp message with real DB message in cache
      const cached = this.messagesMap.get(this.currentConversationId);
      if (cached) {
        const idx = cached.findIndex(m => m.messageId === tempId);
        if (idx !== -1) {
          cached[idx] = { ...savedMessage, isImage: false };
          this.messages$.next([...cached]);
        }
      }
    },
    error: err => console.error('Failed to save message:', err)
  });

  this.hubConnection.invoke('SendMessage', receiverId, this.currentConversationId, content)
    .catch(err => console.error('SignalR SendMessage error:', err));
}

  sendImage(file: File, conversationId: string, senderId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/sendImage`, formData);
  }

  notifyImageSent(receiverId: string, conversationId: string, imageUrl: string) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) return;

    // imageUrl is relative (/images/...) — hub forwards it as-is, receiver prepends baseUrl
    this.hubConnection.invoke('SendImage', receiverId, conversationId, imageUrl)
      .catch(err => console.error('SignalR SendImage error:', err));
  }
}