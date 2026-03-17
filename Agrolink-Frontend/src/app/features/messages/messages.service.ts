import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  sent: Date;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
}

export interface Connection{
    id: string;
    name:string;
    profileImage:string;

}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private hubConnection!: signalR.HubConnection;

  private messagesMap = new Map<string, Message[]>();
  public messages$ = new BehaviorSubject<Message[]>([]);

  currentConversationId: string = '';

  private apiUrl = 'http://localhost:5131/api/Message'; // change if needed
  private hubUrl = 'http://localhost:5131/chatHub';

  constructor(private http: HttpClient) {
    this.startConnection();
  }

  
  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.log(err));

    //  Receive message from server
    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      const convId = message.conversationId;

      if (!this.messagesMap.has(convId)) {
        this.messagesMap.set(convId, []);
      }

      this.messagesMap.get(convId)!.push(message);

      // update UI only if it's current chat
      if (convId === this.currentConversationId) {
        this.messages$.next(this.messagesMap.get(convId)!);
      }
    });
  }

  // Create a new conversation with a connection
createConversation(user1Id: string, user2Id: string) {
  const payload = { user1Id, user2Id };
  
  return this.http.post<Conversation>(`${this.apiUrl}/conversations`, payload);
}
  

  getConversations(userId: string) {
   
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${userId}`);
  }
  // Load Connections for potential convos
  getConnections(userId:string){
    return this.http.get<Connection[]>(`${this.apiUrl}/connections/${userId}`)

  }

 

  //  OPEN CHAT
  openConversation(conversationId: string) {
    this.currentConversationId = conversationId;

    // If already cached → don't call API again
    if (this.messagesMap.has(conversationId)) {
      this.messages$.next(this.messagesMap.get(conversationId)!);
      return;
    }

    // Otherwise fetch from backend
    this.http.get<Message[]>(`${this.apiUrl}/messages/${conversationId}`)
      .subscribe(messages => {
        this.messagesMap.set(conversationId, messages);
        this.messages$.next(messages);
      });

    // Join SignalR group
    this.hubConnection.invoke('JoinConversation', conversationId);
  }

  // SEND MESSAGE
  sendMessage(senderid:string,content: string) {
    const message = {
      senderId: senderid, 
      conversationId: this.currentConversationId,
      content: content
    };

    // Save to DB
    this.http.post(`${this.apiUrl}/send`, message).subscribe();

    // Send real-time
    this.hubConnection.invoke('SendMessage', this.currentConversationId, content);
  }
}