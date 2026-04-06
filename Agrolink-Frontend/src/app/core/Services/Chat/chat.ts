import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class Chat {
   
  private hubConnection!: HubConnection;

  public startConnection = () => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5131/chathub') 
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while establishing connection: ' + err));
  }

  // Method to listen for server events
  public addMessageListener = () => {
    this.hubConnection.on('MessageReceived', (message) => { // 'MessageReceived' is the server method name
      console.log(message);
    });
  }

  // Method to send messages to the server
  public sendMessage(message: string): void {
    this.hubConnection.send('SendMessage', message) // 'SendMessage' is the server method name
      .then(() => {})
      .catch(err => console.error(err));
  }
  
}
