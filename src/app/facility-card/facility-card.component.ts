import { Component, Input, OnInit } from '@angular/core';
import { Facility } from '../home/home.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../safe.pipe';

@Component({
  selector: 'app-facility-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SafePipe],
  templateUrl: './facility-card.component.html',
  styleUrls: ['./facility-card.component.css']
})
export class FacilityCardComponent implements OnInit {
  @Input() facility!: Facility; 
  showVideo = false;
  defaultImage: string = 'assets/default-image.jpg'; 

  isVideoModalOpen: boolean = false; 
  constructor() {}

  ngOnInit(): void {}

  openVideoModal() {
    console.log('Opening video modal');
    this.isVideoModalOpen = true;
  }
  
  closeVideoModal() {
    console.log('Closing video modal');
    this.isVideoModalOpen = false;
  }

  isYouTubeLink(link: string): boolean {
    console.log(link);
    return link.includes('youtube.com') || link.includes('youtu.be');
  }

  getEmbeddedUrl(link: string): string {
    console.log("Original link:", link);
    if (link.includes('watch?v=')) {
        const videoId = link.split('v=')[1].split('&')[0]; 
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (link.includes('youtu.be')) {
        return link.replace('youtu.be/', 'youtube.com/embed/');
    }
    return link; 
}


}
