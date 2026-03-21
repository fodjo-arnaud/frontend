import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../services/assignment';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { DirectoryService, SubjectItem } from '../../services/directory';
import { HttpClient } from '@angular/common/http';

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
  showDetailModal = false;
  showSubjectModal = false;
  showStudentModal = false;
  showStudentDetailsModal = false;
  isEditMode = false;
  isSubjectEditMode = false;
  currentEditId = '';
  currentSubjectEditId = '';
  currentStep = 1;

  stats = { total: 0, done: 0, pending: 0 };
  availableSubjects: any[] = [];
  availableStudents: any[] = [];

  selectedStudent: any = null;
  selectedStudentAssignments: any[] = [];

  page = 1;
  limit = 20;
  totalDocs = 0;
  totalPages = 1;
  searchQuery = '';
  filterStatus = '';
  selectedAssignment: any = null;

  newAssignment: any = {
    nom: '', auteur: '', matiere: '', prof: '', note: null,
    dateDeRendu: '', imageMatiere: '', rendu: false, remarques: '', priorite: 'moyenne'
  };

  newSubject: any = {
    nom: '',
    prof: '',
    image: ''
  };

  constructor(
    private assignmentService: AssignmentService,
    public auth: AuthService,
    private cd: ChangeDetectorRef,
    private notifService: NotificationService,
    private directoryService: DirectoryService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.refreshAssignments();
    this.loadSubjects();
    this.loadStudents();
  }

  loadSubjects() {
    this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe({
      next: (data) => {
        const defaultSubjects = this.directoryService.getSubjects().map(s => ({
          _id: s.name,
          nom: s.name,
          prof: s.prof,
          image: s.image,
          icon: s.icon,
          color: s.color,
          isStatic: true
        }));

        if (data && data.length > 0) {
          const backendSubjects = data.map(s => {
            const cleanImage = (s.image && s.image.includes('via.placeholder.com')) ? '' : s.image;
            return {
              ...s,
              image: cleanImage,
              icon: 'book',
              color: '#3b82f6',
              isStatic: false
            };
          });
          this.availableSubjects = [...defaultSubjects, ...backendSubjects];
        } else {
          this.availableSubjects = defaultSubjects;
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.availableSubjects = this.directoryService.getSubjects().map(s => ({
          _id: s.name,
          nom: s.name,
          prof: s.prof,
          image: s.image,
          icon: s.icon,
          color: s.color,
          isStatic: true
        }));
      }
    });
  }

  loadStudents() {
    this.http.get<any[]>('http://localhost:3000/api/auth/users').subscribe({
      next: (users) => {
        const userList = users.map(u => ({ name: u.username, source: 'Compte', role: u.role }));

        this.http.get<string[]>('http://localhost:3000/api/assignments/authors').subscribe({
          next: (authors) => {
            const authorList = authors.map(a => ({ name: a, source: 'Auteur', role: 'user' }));
            const combined = [...userList, ...authorList];
            const uniqueMap = new Map();
            combined.forEach(item => {
              if(!uniqueMap.has(item.name)) {
                uniqueMap.set(item.name, item);
              }
            });
            this.availableStudents = Array.from(uniqueMap.values());
            this.cd.detectChanges();
          }
        });
      }
    });
  }

  onStudentClick(student: any) {
    this.selectedStudent = student;
    this.selectedStudentAssignments = [];
    this.showStudentDetailsModal = true;

    // Récupérer les devoirs de cet étudiant
    this.assignmentService.getAssignments(1, 100, '', '', student.name).subscribe((data: any) => {
      if (data && data.docs) {
        this.selectedStudentAssignments = data.docs;
      }
      this.cd.detectChanges();
    });
  }

  closeStudentDetailsModal() {
    this.showStudentDetailsModal = false;
    this.selectedStudent = null;
    this.selectedStudentAssignments = [];
    this.cd.detectChanges();
  }

  onSubjectChange() {
    const subject = this.availableSubjects.find(s => s.nom === this.newAssignment.matiere);
    if (subject) {
      this.newAssignment.prof = subject.prof;
      this.newAssignment.imageMatiere = subject.image || '';
    }
  }

  refreshAssignments() {
    const authorFilter = this.auth.isAdmin() ? '' : this.auth.getUsername();
    this.assignmentService.getAssignments(this.page, this.limit, this.searchQuery, this.filterStatus, authorFilter).subscribe((data: any) => {
      if (data && data.docs) {
        this.assignments = data.docs.map((a: any) => ({
          ...a,
          imageMatiere: (a.imageMatiere && a.imageMatiere.includes('via.placeholder.com')) ? '' : a.imageMatiere
        }));
        this.totalDocs = data.totalDocs;
        this.totalPages = data.totalPages;
        if (data.stats) this.stats = data.stats;
      }
      this.cd.detectChanges();
    });
  }

  onSearch() { this.page = 1; this.refreshAssignments(); }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.refreshAssignments(); } }
  previousPage() { if (this.page > 1) { this.page--; this.refreshAssignments(); } }

  nextStep() { if (this.currentStep < 3) this.currentStep++; this.cd.detectChanges(); }
  previousStep() { if (this.currentStep > 1) this.currentStep--; this.cd.detectChanges(); }

  onViewDetails(assignment: any) {
    this.selectedAssignment = { ...assignment };
    this.showDetailModal = true;
    this.cd.detectChanges();
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedAssignment = null;
    this.cd.detectChanges();
  }

  openSubjectModal() {
    this.newSubject = { nom: '', prof: '', image: '' };
    this.isSubjectEditMode = false;
    this.showSubjectModal = true;
    this.cd.detectChanges();
  }

  closeSubjectModal() {
    this.showSubjectModal = false;
    this.isSubjectEditMode = false;
    this.currentSubjectEditId = '';
    this.cd.detectChanges();
  }

  openStudentModal() {
    this.loadStudents();
    this.showStudentModal = true;
    this.cd.detectChanges();
  }

  closeStudentModal() {
    this.showStudentModal = false;
    this.cd.detectChanges();
  }

  deleteSubject(id: string, isStatic: boolean) {
    if (isStatic) {
      this.notifService.show('Cette matière par défaut ne peut pas être supprimée', 'info');
      return;
    }
    if (confirm('Supprimer cette matière ?')) {
      this.http.delete(`http://localhost:3000/api/subjects/${id}`).subscribe({
        next: () => {
          this.notifService.show('Matière supprimée', 'success');
          this.loadSubjects();
        },
        error: () => this.notifService.show('Erreur lors de la suppression', 'error')
      });
    }
  }

  saveSubject() {
    if (!this.newSubject.nom || !this.newSubject.prof || !this.newSubject.image) {
      this.notifService.show('Veuillez remplir tous les champs', 'error');
      return;
    }

    const dataToSend = {
      nom: this.newSubject.nom,
      prof: this.newSubject.prof,
      image: this.newSubject.image
    };

    this.http.post('http://localhost:3000/api/subjects', dataToSend).subscribe({
      next: () => {
        this.notifService.show('Matière enregistrée avec succès', 'success');
        this.closeSubjectModal();
        this.loadSubjects();
      },
      error: () => {
        this.notifService.show('Erreur lors de l\'enregistrement', 'error');
      }
    });
  }

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
      if (!this.auth.isAdmin()) { this.newAssignment.auteur = this.auth.getUsername(); }
    }
    this.showModal = true;
    this.cd.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
    this.cd.detectChanges();
  }

  resetForm() {
    this.newAssignment = {
      nom: '', auteur: '', matiere: '', prof: '', note: null,
      dateDeRendu: '', imageMatiere: '', rendu: false, remarques: '', priorite: 'moyenne'
    };
    this.isEditMode = false;
    this.currentEditId = '';
    this.currentStep = 1;
  }

  onSaveAssignment() {
    if (!this.newAssignment.nom || !this.newAssignment.auteur) return;
    if (this.isEditMode) {
      this.assignmentService.updateAssignment(this.currentEditId, this.newAssignment).subscribe(() => {
        this.notifService.show('Assignment mis à jour', 'success');
        this.closeModal();
        this.refreshAssignments();
      });
    } else {
      this.assignmentService.addAssignment(this.newAssignment).subscribe(() => {
        this.notifService.show('Nouvel assignment créé', 'success');
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
    const s = this.availableSubjects.find(sub => sub.nom === subject);
    return s ? s.icon : 'menu_book';
  }

  getSubjectColor(subject: string): string {
    const s = this.availableSubjects.find(sub => sub.nom === subject);
    return s ? s.color : '#718096';
  }
}
