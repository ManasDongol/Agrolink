import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";

@Component({
  selector: 'app-messages',
  imports: [Navbar],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages {
    recentChats = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    lastMessage: `Last message preview from user ${i + 1}`
  }));

  openedChatMessages = Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    sender: i % 2 === 0 ? 'You' : 'Friend',
    content: `Message ${i + 1} in chat.`
  }));
}
