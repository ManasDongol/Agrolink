import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MessagesService, MessageDto, Conversation, Connection } from './messages.service';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  recentConversations: Conversation[] = [];
  openedMessages: MessageDto[] = [];
  ConnectionList: Connection[] = [];
  newMessage: string = '';
  OpenedConversation: boolean = false;
  UserId: string = '';
  HasConversation: boolean = false;
  apiurl: string = environment.apiUrl;
  receiverId: string = '';

  OpenedConversationUsername: string = "";
  OpenedConversationProfile: string = "";

  searchQuery: string = '';
isSearching: boolean = false;

filteredConversations: any[] = [];
filteredConnections: any[] = [];

private searchSubject = new Subject<string>();

  @ViewChild('messagesList') private messagesList!: ElementRef;

  constructor(public messagesService: MessagesService, public auth: Auth) {}

  ngOnInit() {
    //debounce 
      this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(query => {
    this.performSearch(query);
  });
    // Authenticate user
    this.auth.checkAuth().pipe(
      switchMap(user => {
        this.auth.setAuthenticated(true);
        this.UserId = user.id;
        console.log('Logged in user:', this.UserId);
        return this.messagesService.getConversations(user.id);
      }),
      switchMap(convs => {
        this.recentConversations = convs;
        this.HasConversation = convs.length > 0;
        return  this.messagesService.getConnections(this.UserId);
      })
    ).subscribe({
      next: connections => {
        if (connections) {
          this.ConnectionList = connections;
          console.log('Connections loaded:', this.ConnectionList);
        }
      },
      error: err => {
        console.error('Error loading messages/connections:', err);
        this.auth.setAuthenticated(false);
      }
    });

    // Subscribe to messages$ from service (SignalR + cache)
    this.messagesService.messages$.subscribe(msgs => {
      this.openedMessages = msgs;
      this.scrollToBottom();
    });
  }

  getConnectionData() {
    this.messagesService.getConnections(this.UserId)
      .subscribe({
        next: data => this.ConnectionList = data,
        error: err => console.error('Error fetching connections', err)
      });
  }

  startConversation(conn: Connection) {
    if (!this.UserId) return;
    this.messagesService.createConversation(this.UserId, conn.id)
      .subscribe(conv => {
        this.recentConversations.push(conv);
        this.HasConversation = true;
        this.selectConversation(conv);
      }, err => console.error('Error creating conversation', err));
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectConversation(conv: Conversation) {
    this.OpenedConversation = true;
    this.OpenedConversationUsername= conv.partnerName;
    this.messagesService.openConversation(conv.id);
    this.receiverId = conv.partnerId;
  }


  getUserprofile(path:string){

    console.log(this.apiurl+path)
    return this.apiurl+path;

  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.messagesService.sendMessage(this.UserId, this.receiverId, this.newMessage);
    this.newMessage = '';
  }

  private scrollToBottom() {
    try {
      this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
    } catch (err) { }
  }


  onSearch() {
  this.searchSubject.next(this.searchQuery);
}

performSearch(query: string) {
  const q = query.toLowerCase().trim();

  if (!q) {
    this.isSearching = false;
    return;
  }

  this.isSearching = true;

  // Conversations
  this.filteredConversations = this.recentConversations.filter(c =>
    c.partnerName.toLowerCase().includes(q)
  );

  // Avoid duplicates
  const conversationUserIds = new Set(
    this.recentConversations.map(c => c.partnerId)
  );

  console.log(this.ConnectionList.length);

  // Connections
  this.filteredConnections = this.ConnectionList.filter(c =>
    c.name.toLowerCase().includes(q) &&
    !conversationUserIds.has(c.id)
  );
}

clearSearch() {
  this.searchQuery = '';
  this.isSearching = false;
}

startChatFromSearch(conn: any) {
  this.startConversation(conn);

  // Instantly reflect in UI
  const newConv = {
    id: 'temp-' + conn.id,
    partnerId: conn.id,
    partnerName: conn.name,
    partnerProfile: conn.profileImage
  };

  this.recentConversations.unshift(newConv);

  this.selectConversation(newConv);
}


}