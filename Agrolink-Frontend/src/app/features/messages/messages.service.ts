import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface MessageDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  sent: string; // ISO string from backend
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
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

  private apiUrl = 'http://localhost:5131/api/Message'; // backend API
  private hubUrl = 'http://localhost:5131/chatHub';     // SignalR hub

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

      // Listen for incoming messages
      this.hubConnection.on('ReceiveMessage', (message: MessageDto) => {
        const convId = message.conversationId;
        if (!this.messagesMap.has(convId)) this.messagesMap.set(convId, []);
        this.messagesMap.get(convId)!.push(message);
        this.messages$.next([...this.messagesMap.get(convId)!]);
      });

    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }

  // Create a new conversation
  createConversation(user1Id: string, user2Id: string) {
    const payload = { user1Id, user2Id };
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, payload);
  }

  // Get conversations for a user
  getConversations(userId: string) {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  // Get connections
  getConnections(userId: string) {
    return this.http.get<Connection[]>(`${this.apiUrl}/connections/${userId}`);
  }

  // Open a conversation
  openConversation(conversationId: string) {
    this.currentConversationId = conversationId;

    if (this.messagesMap.has(conversationId)) {
      this.messages$.next(this.messagesMap.get(conversationId)!);
      return;
    }

    this.http.get<MessageDto[]>(`${this.apiUrl}/messages/${conversationId}`)
      .subscribe(messages => {
        this.messagesMap.set(conversationId, messages);
        this.messages$.next(messages);
      });
  }

  // Send a message
  sendMessage(senderId: string, receiverId: string, content: string) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn("Hub not connected yet!");
      return;
    }

    // Optimistically add message to UI
    const tempMessage: MessageDto = {
      messageId: 'temp-' + Date.now(),
      conversationId: this.currentConversationId,
      senderId,
      content,
      sent: new Date().toISOString()
    };
    if (!this.messagesMap.has(this.currentConversationId)) this.messagesMap.set(this.currentConversationId, []);
    this.messagesMap.get(this.currentConversationId)!.push(tempMessage);
    this.messages$.next([...this.messagesMap.get(this.currentConversationId)!]);

    // Save to DB
    this.http.post(`${this.apiUrl}/send`, {
      senderId,
      conversationId: this.currentConversationId,
      content
    }).subscribe({
      next: () => console.log("Message saved to DB"),
      error: err => console.error("Failed to save message:", err)
    });

    // Send to hub for real-time
    this.hubConnection.invoke('SendMessage', receiverId, content, this.currentConversationId)
      .then(() => console.log("SignalR SendMessage invoked"))
      .catch(err => console.error("SignalR SendMessage error:", err));
  }
}