import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MessagesService, Message, Conversation, Connection } from './messages.service';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/Services/Auth/auth';
import { ConnectionRequestDto } from '../../core/Dtos/NetworkDtos';
import { switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';
@Component({
  selector: 'app-messages',
    standalone: true,           
  imports: [FormsModule,CommonModule], 
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],

})
export class MessagesComponent implements OnInit, AfterViewChecked {
  recentConversations: Conversation[] = [];
  openedMessages: Message[] = [];
  ConnectionList: Connection[]=[];
  newMessage: string = '';
  OpenedConversation : boolean = false;
  UserId:string="";
  HasConversation:boolean = false;
  apiurl:string=environment.apiUrl;

  @ViewChild('messagesList') private messagesList!: ElementRef;

  constructor(public messagesService: MessagesService, public auth:Auth) {}



ngOnInit() {

  this.auth.checkAuth().pipe(

    switchMap(user => {
      this.auth.setAuthenticated(true);
      this.UserId = user.id;
      console.log("manas:", this.UserId);

      return this.messagesService.getConversations(user.id);
    }),

    switchMap(convs => {
      this.recentConversations = convs;

      if (convs.length > 0) {
        this.HasConversation = true;
        this.selectConversation(convs[0]);
        return of(null); // stop here
      } else {
        return this.messagesService.getConnections(this.UserId);
      }
    })

  ).subscribe({
    next: (connections) => {
     
      if (connections) {
        this.ConnectionList = connections;
        for(let i of this.ConnectionList){
          console.log(i);
        }
      }
    },
    error: (err) => {
      console.error(err);
      this.auth.setAuthenticated(false);
    }
  });


  // keep this separate (this is fine)
  this.messagesService.messages$.subscribe(msgs => {
    this.openedMessages = msgs;
    this.scrollToBottom();
  });

}

  getConnectionData(){
      this.messagesService.getConnections(this.UserId)
      .subscribe({
      next: (data) => {
        this.ConnectionList = data; // assign the response here
      },
      error: (err) => {
        console.error('Error fetching connections', err);
      }
    });
  }
startConversation(conn: Connection) {
  if (!this.UserId) return;

  this.messagesService.createConversation(this.UserId, conn.id)
    .subscribe(conv => {
      // After creating, immediately open the conversation
      this.recentConversations.push(conv);
      this.HasConversation = true;
      this.selectConversation(conv);
    }, err => {
      console.error('Error creating conversation', err);
    });
}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectConversation(conv: Conversation) {
    this.OpenedConversation  = true;
    this.messagesService.openConversation(conv.id);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.messagesService.sendMessage(this.UserId,this.newMessage);
    this.newMessage = '';
  }

  private scrollToBottom() {
    try {
      this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
    } catch (err) { }
  }
}