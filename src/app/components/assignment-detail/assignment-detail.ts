import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Détail Assignment</h2>
    <p>Information sur l'assignment</p>
  `
})
export class AssignmentDetailComponent {}