import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MessagesService, MessageDto, Conversation, Connection } from './messages.service';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Spinner } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, CommonModule, Spinner],
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
  selectedConversationIndex: number = -1;

  OpenedConversationUsername: string = '';
  OpenedConversationProfile: string = '';

  searchQuery: string = '';
  isSearching: boolean = false;
  filteredConversations: any[] = [];
  filteredConnections: any[] = [];

  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isUploadingImage: boolean = false;
  isCreatingConversation: boolean = false;

  private searchSubject = new Subject<string>();
  private isStartingConversation: boolean = false;

  @ViewChild('messagesList') private messagesList!: ElementRef;

  constructor(public messagesService: MessagesService, public auth: Auth) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });

    this.auth.checkAuth().pipe(
      switchMap(user => {
        this.auth.setAuthenticated(true);
        this.UserId = user.id;
        return this.messagesService.getConversations(user.id);
      }),
      switchMap(convs => {
        this.recentConversations = convs;
        this.HasConversation = convs.length > 0;
        return this.messagesService.getConnections(this.UserId);
      })
    ).subscribe({
      next: connections => {
        if (connections) {
          this.ConnectionList = connections;
        }
      },
      error: err => {
        console.error('Error loading messages/connections:', err);
        this.auth.setAuthenticated(false);
      }
    });

    this.messagesService.messages$.subscribe(msgs => {
      this.openedMessages = msgs;
      this.scrollToBottom();
    });
  }

  getConnectionData() {
    this.messagesService.getConnections(this.UserId).subscribe({
      next: data => this.ConnectionList = data,
      error: err => console.error('Error fetching connections', err)
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // ✅ Guard added — never opens if id is missing
  selectConversation(conv: Conversation, index: number) {
    if (!conv?.id) {
      console.error('selectConversation: conv.id is missing', conv);
      return;
    }
    this.OpenedConversation = true;
    this.OpenedConversationUsername = conv.partnerName;
    this.OpenedConversationProfile = conv.partnerProfile ?? '';
    this.messagesService.openConversation(conv.id);
    this.receiverId = conv.partnerId;
    this.selectedConversationIndex = index;
  }

  // ✅ Used from connections panel (non-search flow)
  startConversation(conn: Connection) {
    if (!this.UserId || this.isStartingConversation) return;
    this.isStartingConversation = true;
    this.isCreatingConversation = true;

    // Already have a convo with this person — just open it
    const existingConv = this.recentConversations.find(c => c.partnerId === conn.id);
    if (existingConv) {
      const index = this.recentConversations.findIndex(c => c.id === existingConv.id);
      this.selectConversation(existingConv, index);
      this.isStartingConversation = false;
      this.isCreatingConversation = false;
      return;
    }

    this.messagesService.createConversation(this.UserId, conn.id).subscribe({
      next: (conv) => {
        const exists = this.recentConversations.find(c => c.id === conv.id);
        if (!exists) {
          this.recentConversations.unshift(conv);
        }
        this.HasConversation = true;
        const index = this.recentConversations.findIndex(c => c.id === conv.id);
        this.selectConversation(conv, index === -1 ? 0 : index);
      },
      error: err => {
        console.error('Error creating conversation', err);
        this.isStartingConversation = false;
        this.isCreatingConversation = false;
      },
      complete: () => {
        this.isStartingConversation = false;
        this.isCreatingConversation = false;
      }
    });
  }

  // ✅ Used from search results
  startChatFromSearch(conn: any) {
    if (this.isStartingConversation) return;
    this.isStartingConversation = true;
    this.isCreatingConversation = true;

    // Already have a convo with this person — just open it
    const existingConv = this.recentConversations.find(c => c.partnerId === conn.id);
    if (existingConv) {
      const index = this.recentConversations.findIndex(c => c.id === existingConv.id);
      this.selectConversation(existingConv, index);
      this.clearSearch();
      this.isStartingConversation = false;
      this.isCreatingConversation = false;
      return;
    }

    this.messagesService.createConversation(this.UserId, conn.id).subscribe({
      next: (conv) => {
        const alreadyExists = this.recentConversations.find(c => c.id === conv.id);
        if (!alreadyExists) {
          this.recentConversations.unshift(conv);
        }
        this.HasConversation = true;
        this.clearSearch();
        const index = this.recentConversations.findIndex(c => c.id === conv.id);
        this.selectConversation(conv, index === -1 ? 0 : index);
      },
      error: err => {
        console.error('Error creating conversation', err);
        this.isStartingConversation = false;
        this.isCreatingConversation = false;
      },
      complete: () => {
        this.isStartingConversation = false;
        this.isCreatingConversation = false;
      }
    });
  }

  getUserprofile(path: string) {
    return this.apiurl + path;
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.selectedConversationIndex < 0) return;

    const messageToSend = this.newMessage.trim();
    this.messagesService.sendMessage(this.UserId, this.receiverId, messageToSend);

    const conv = this.recentConversations[this.selectedConversationIndex];
    if (conv) {
      const currentdate = new Date();
      if (conv.lastMessage) {
        conv.lastMessage.content = messageToSend;
        conv.lastMessage.sent = currentdate.toString();
        conv.lastMessage.senderId = this.UserId;
      }
      this.recentConversations.splice(this.selectedConversationIndex, 1);
      this.recentConversations.unshift(conv);
      this.selectedConversationIndex = 0;
    }

    this.newMessage = '';
  }

  private scrollToBottom() {
    try {
      this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
    } catch (err) {}
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

    this.filteredConversations = this.recentConversations.filter(c =>
      c.partnerName.toLowerCase().includes(q)
    );

    const conversationUserIds = new Set(
      this.recentConversations.map(c => c.partnerId)
    );

    this.filteredConnections = this.ConnectionList.filter(c =>
      c.name.toLowerCase().includes(q) &&
      !conversationUserIds.has(c.id)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.filteredConversations = [];
    this.filteredConnections = [];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only image files are allowed.');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  cancelImagePreview() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  sendImage() {
    if (!this.selectedFile || !this.currentConversationId) return;

    const file = this.selectedFile;

    const optimisticMsg: MessageDto = {
      messageId: 'temp-img-' + Date.now(),
      conversationId: this.messagesService.currentConversationId,
      senderId: this.UserId,
      content: this.imagePreview!,
      sent: new Date().toISOString(),
      isImage: true
    };
    this.openedMessages = [...this.openedMessages, optimisticMsg];

    this.cancelImagePreview();

    this.isUploadingImage = true;
    this.messagesService.sendImage(file, this.messagesService.currentConversationId, this.UserId).subscribe({
      next: ({ imageUrl }) => {
        this.isUploadingImage = false;

        const idx = this.openedMessages.findIndex(m => m.messageId === optimisticMsg.messageId);
        if (idx !== -1) {
          this.openedMessages[idx] = {
            ...this.openedMessages[idx],
            content: this.apiurl + imageUrl,
            messageId: 'img-confirmed-' + Date.now()
          };
          this.openedMessages = [...this.openedMessages];
        }

        this.messagesService.notifyImageSent(
          this.receiverId,
          this.messagesService.currentConversationId,
          imageUrl
        );

        const conv = this.recentConversations[this.selectedConversationIndex];
        if (conv?.lastMessage) {
          conv.lastMessage.content = '📷 Image';
          conv.lastMessage.sent = new Date().toString();
        }
      },
      error: (err) => {
        this.isUploadingImage = false;
        console.error('Image upload failed', err);

        const idx = this.openedMessages.findIndex(m => m.messageId === optimisticMsg.messageId);
        if (idx !== -1) {
          this.openedMessages[idx] = {
            ...this.openedMessages[idx],
            messageId: 'img-failed-' + Date.now()
          };
        }
      }
    });
  }

  get currentConversationId(): string {
    return this.messagesService.currentConversationId;
  }
}