import { Component } from '@angular/core';

import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-feed',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
    
  toggleNewPost : boolean = false;
    posts = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    title: `Post Title ${i + 1}`,
    content: `This is the content of post ${i + 1}. Lorem ipsum dolor sit amet...`
  }));

  togglePost(){
    this.toggleNewPost = !this.toggleNewPost;
  }
}
