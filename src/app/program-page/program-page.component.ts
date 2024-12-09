import { Component, OnInit } from '@angular/core';
import { ProgramCardComponent } from '../program-card/program-card.component';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../.service/program.service';

@Component({
  selector: 'app-program-page',
  templateUrl: './program-page.component.html',
  styleUrls: ['./program-page.component.css'],
  standalone: true,
  imports: [CommonModule, ProgramCardComponent]
})
export class ProgramPageComponent implements OnInit {
  programs: any[] = []; 

  constructor(private programService: ProgramService) {}

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.programService.getPrograms().subscribe(
      (data: any[]) => {
        console.log(data);
        this.programs = data;
      },
      (error: any) => {
        console.error('Error loading programs', error);
      }
    );
  }

  joinProgramEvent(eventData: any) {
    console.log('User joined the program event:', eventData);
  }
}
