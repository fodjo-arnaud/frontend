import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../services/assignment';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { DirectoryService, SubjectItem } from '../../services/directory';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignments.html',
  styleUrls: ['./assignments.css']
})
export class AssignmentsComponent implements OnInit {

  assignments: any[] = [];
  showModal = false;
  isEditMode = false;
  currentEditId = '';
  currentStep = 1;

  availableSubjects: SubjectItem[] = [];
  availableStudents: any[] = [];

  page = 1;
  limit = 20;
  totalDocs = 0;
  totalPages = 1;

  searchQuery = '';
  filterStatus = '';
  showDetailModal = false;
  selectedAssignment: any = null;

  newAssignment: any = {
    nom: '',
    auteur: '',
    matiere: '',
    prof: '',
    note: null,
    dateDeRendu: '',
    imageMatiere: '',
    rendu: false,
    remarques: ''
  };

  constructor(
    private assignmentService: AssignmentService,
    public auth: AuthService,
    private cd: ChangeDetectorRef,
    private notifService: NotificationService,
    private directoryService: DirectoryService
  ) {}

  ngOnInit() {
    this.refreshAssignments();
    this.availableSubjects = this.directoryService.getSubjects();
    this.availableStudents = this.directoryService.getStudents();
  }

  onSubjectChange() {
    const subject = this.directoryService.getSubjectByName(this.newAssignment.matiere);
    if (subject) {
      this.newAssignment.prof = subject.prof;
      this.newAssignment.imageMatiere = subject.image || '';
      this.notifService.show(`Matière sélectionnée : ${subject.name}`, 'info');
    }
  }

  refreshAssignments() {
    // RESTRICTION : Si pas admin, on ne demande que ses propres devoirs
    const authorFilter = this.auth.isAdmin() ? '' : this.auth.getUsername();

    this.assignmentService.getAssignments(this.page, this.limit, this.searchQuery, this.filterStatus, authorFilter).subscribe((data: any) => {
      if (data && data.docs) {
        this.assignments = data.docs;
        this.totalDocs = data.totalDocs;
        this.totalPages = data.totalPages;
      }
      this.cd.detectChanges();
    });
  }

  onSearch() {
    this.page = 1;
    this.refreshAssignments();
  }

  nextPage() { if (this.page < this.totalPages) { this.page++; this.refreshAssignments(); } }
  previousPage() { if (this.page > 1) { this.page--; this.refreshAssignments(); } }

  onViewDetails(assignment: any) {
    this.selectedAssignment = { ...assignment };
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedAssignment = null;
  }

  nextStep() { if (this.currentStep < 3) this.currentStep++; }
  previousStep() { if (this.currentStep > 1) this.currentStep--; }

  openModal(assignment?: any) {
    this.currentStep = 1;
    if (assignment) {
      this.isEditMode = true;
      this.currentEditId = assignment._id;
      this.newAssignment = { ...assignment };
      if (this.newAssignment.dateDeRendu) {
        this.newAssignment.dateDeRendu = new Date(this.newAssignment.dateDeRendu).toISOString().split('T')[0];
      }
    } else {
      this.isEditMode = false;
      this.resetForm();

      // AUTO-REMPLISSAGE : Si c'est un élève, on met son nom d'office
      if (!this.auth.isAdmin()) {
        this.newAssignment.auteur = this.auth.getUsername();
      }
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newAssignment = { nom: '', auteur: '', matiere: '', prof: '', note: null, dateDeRendu: '', imageMatiere: '', rendu: false, remarques: '' };
    this.isEditMode = false;
    this.currentEditId = '';
    this.currentStep = 1;
  }

  onSaveAssignment() {
    if (!this.newAssignment.nom || !this.newAssignment.auteur) return;

    if (this.isEditMode) {
      this.assignmentService.updateAssignment(this.currentEditId, this.newAssignment).subscribe(() => {
        this.notifService.show('Sauvegardé !', 'success');
        this.closeModal();
        this.refreshAssignments();
      });
    } else {
      this.assignmentService.addAssignment(this.newAssignment).subscribe(() => {
        this.notifService.show('Créé !', 'success');
        this.closeModal();
        this.refreshAssignments();
      });
    }
  }

  onDeleteAssignment(id: string) {
    if (confirm('Supprimer cet assignment ?')) {
      this.assignmentService.deleteAssignment(id).subscribe(() => {
        this.notifService.show('Supprimé', 'info');
        this.refreshAssignments();
      });
    }
  }

  getNoteClass(note: number): string {
    if (note >= 15) return 'note-high';
    if (note >= 10) return 'note-mid';
    return 'note-low';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getSubjectIcon(subject: string): string {
    const s = this.directoryService.getSubjectByName(subject);
    return s ? s.icon : 'menu_book';
  }

  getSubjectColor(subject: string): string {
    const s = this.directoryService.getSubjectByName(subject);
    return s ? s.color : '#718096';
  }
}
