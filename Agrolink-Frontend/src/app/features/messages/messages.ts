import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MessagesService, MessageDto, Conversation, Connection } from './messages.service';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';

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

  @ViewChild('messagesList') private messagesList!: ElementRef;

  constructor(public messagesService: MessagesService, public auth: Auth) {}

  ngOnInit() {
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
        return !this.HasConversation ? this.messagesService.getConnections(this.UserId) : of(null);
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
    this.messagesService.openConversation(conv.id);
    this.receiverId = conv.user1Id === this.UserId ? conv.user2Id : conv.user1Id;
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
}