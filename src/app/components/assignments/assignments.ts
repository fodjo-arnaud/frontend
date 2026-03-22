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
  loadingStudentAssignments = false;

  page = 1;
  limit = 20;
  totalDocs = 0;
  totalPages = 1;
  searchQuery = '';
  filterStatus = '';
  selectedAssignment: any = null;

  private readonly API_BASE_URL = 'https://assignments-api-5dov.onrender.com/api';

  newAssignment: any = {
    nom: '', auteur: '', matiere: '', prof: '', note: null,
    dateDeRendu: '', imageMatiere: '', rendu: false, remarques: '', priorite: 'moyenne'
  };

  newSubject: any = { nom: '', prof: '', image: '' };

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
    const defaultSubjects = this.directoryService.getSubjects().map(s => ({
      _id: s.name, nom: s.name, prof: s.prof, image: s.image, icon: s.icon, color: s.color, isStatic: true
    }));
    this.availableSubjects = defaultSubjects;

    const processSubjects = (data: any[]) => {
      if (data && data.length > 0) {
        const backendSubjects = data.map(s => ({ ...s, icon: 'book', color: '#3b82f6', isStatic: false }));
        this.availableSubjects = [...defaultSubjects, ...backendSubjects];
      }
      this.cd.detectChanges();
    };

    // On priorise Render en production
    this.http.get<any[]>(`${this.API_BASE_URL}/subjects`).subscribe({
      next: (data) => processSubjects(data),
      error: () => {
        // Fallback local seulement si Render échoue
        this.http.get<any[]>(`http://localhost:3000/api/subjects`).subscribe({
          next: (data) => processSubjects(data),
          error: () => this.cd.detectChanges()
        });
      }
    });
  }

  loadStudents() {
    this.extractStudentsFromAssignments();

    const processAuthors = (authors: string[]) => {
      if (authors && authors.length > 0) {
        const studentList = authors
          .filter((name: any): name is string => !!name && typeof name === 'string' && name.trim() !== "")
          .map(name => ({ name: name.trim(), source: 'Base de données', role: 'user' }));
        this.mergeStudents(studentList);
      }
    };

    const processUsers = (users: any[]) => {
      if (users && users.length > 0) {
        this.mergeStudents(users.map(u => ({ name: u.username, source: 'Compte', role: u.role })));
      }
    };

    // 1. Récupération via l'endpoint dédié aux auteurs
    this.http.get<string[]>(`${this.API_BASE_URL}/assignments/authors`).subscribe({
      next: (authors) => processAuthors(authors),
      error: () => {
        this.http.get<string[]>(`http://localhost:3000/api/assignments/authors`).subscribe({
          next: (authors) => processAuthors(authors),
          error: () => {
            this.assignmentService.getAssignments(1, 5000).subscribe({
              next: (data) => {
                if (data && data.docs) {
                  const authorsList = [...new Set(data.docs.map((a: any) => a.auteur))]
                    .filter((name: any): name is string => !!name && typeof name === 'string' && name.trim() !== "")
                    .map(name => ({ name: name.trim(), source: 'Base de données', role: 'user' }));
                  this.mergeStudents(authorsList);
                }
              }
            });
          }
        });
      }
    });

    // 2. Récupération des comptes utilisateurs
    this.http.get<any[]>(`${this.API_BASE_URL}/auth/users`).subscribe({
      next: (users) => processUsers(users),
      error: () => {
        this.http.get<any[]>(`http://localhost:3000/api/auth/users`).subscribe({
          next: (users) => processUsers(users)
        });
      }
    });
  }

  mergeStudents(newList: any[]) {
    if (!newList || newList.length === 0) return;
    const map = new Map();

    this.availableStudents.forEach(s => {
      if (s && s.name) map.set(s.name.trim(), s);
    });

    newList.forEach(item => {
      const name = (item && item.name) ? item.name.trim() : null;
      if (name && !map.has(name)) {
        map.set(name, { ...item, name });
      }
    });

    this.availableStudents = Array.from(map.values()).sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '')
    );
    this.cd.detectChanges();
  }

  extractStudentsFromAssignments() {
    if (!this.assignments || this.assignments.length === 0) return;
    const authors = this.assignments
      .map(a => a.auteur)
      .filter((name: any): name is string => !!name && typeof name === 'string' && name.trim() !== "");

    if (authors.length > 0) {
      const studentObjects = [...new Set(authors)].map((name: string) => ({
        name: name.trim(), source: 'Auteur', role: 'user'
      }));
      this.mergeStudents(studentObjects);
    }
  }

  onStudentClick(student: any) {
    if (!student || !student.name) return;
    this.selectedStudent = student;
    this.showStudentDetailsModal = true;
    this.loadingStudentAssignments = true;
    this.selectedStudentAssignments = [];
    const searchName = student.name.trim();

    this.assignmentService.getAssignments(1, 1000, '', '', searchName).subscribe({
      next: (data: any) => {
        if (data && data.docs) {
          this.selectedStudentAssignments = data.docs.filter((a: any) =>
            a.auteur && a.auteur.trim() === searchName
          );
        }
        this.loadingStudentAssignments = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loadingStudentAssignments = false;
        this.cd.detectChanges();
      }
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
          ...a, imageMatiere: (a.imageMatiere && a.imageMatiere.includes('via.placeholder.com')) ? '' : a.imageMatiere
        }));
        this.totalDocs = data.totalDocs;
        this.totalPages = data.totalPages;
        if (data.stats) this.stats = data.stats;
        this.extractStudentsFromAssignments();
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
    this.cd.detectChanges();
  }

  editSubject(subject: any) {
    if (subject.isStatic) {
      this.notifService.show('Matière par défaut non modifiable', 'info');
      return;
    }
    this.isSubjectEditMode = true;
    this.currentSubjectEditId = subject._id;
    this.newSubject = { ...subject };
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
      setTimeout(() => this.notifService.show('Matière par défaut non supprimable', 'info'));
      return;
    }
    if (confirm('Supprimer cette matière ?')) {
      this.http.delete(`${this.API_BASE_URL}/subjects/${id}`).subscribe({
        next: () => {
          this.notifService.show('Matière supprimée', 'success');
          this.loadSubjects();
        },
        error: () => {
          this.http.delete(`http://localhost:3000/api/subjects/${id}`).subscribe({
            next: () => {
              this.notifService.show('Matière supprimée localement', 'success');
              this.loadSubjects();
            },
            error: () => this.notifService.show('Erreur de suppression', 'error')
          });
        }
      });
    }
  }

  saveSubject() {
    if (!this.newSubject.nom || !this.newSubject.prof || !this.newSubject.image) {
      this.notifService.show('Champs requis manquants', 'error');
      return;
    }

    const action = this.isSubjectEditMode
      ? this.http.put(`${this.API_BASE_URL}/subjects/${this.currentSubjectEditId}`, this.newSubject)
      : this.http.post(`${this.API_BASE_URL}/subjects`, this.newSubject);

    action.subscribe({
      next: () => {
        this.notifService.show(this.isSubjectEditMode ? 'Matière mise à jour' : 'Matière enregistrée', 'success');
        this.closeSubjectModal();
        this.loadSubjects();
      },
      error: () => {
        // Fallback local
        const localAction = this.isSubjectEditMode
          ? this.http.put(`http://localhost:3000/api/subjects/${this.currentSubjectEditId}`, this.newSubject)
          : this.http.post(`http://localhost:3000/api/subjects`, this.newSubject);

        localAction.subscribe({
          next: () => {
            this.notifService.show('Enregistré localement', 'success');
            this.closeSubjectModal();
            this.loadSubjects();
          },
          error: () => this.notifService.show('Erreur de connexion au serveur', 'error')
        });
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
      if (!this.auth.isAdmin()) this.newAssignment.auteur = this.auth.getUsername();
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
    const action = this.isEditMode
      ? this.assignmentService.updateAssignment(this.currentEditId, this.newAssignment)
      : this.assignmentService.addAssignment(this.newAssignment);

    action.subscribe(() => {
      setTimeout(() => {
        this.notifService.show(this.isEditMode ? 'Mis à jour' : 'Créé', 'success');
        this.closeModal();
        this.refreshAssignments();
      });
    });
  }

  onDeleteAssignment(id: string) {
    if (confirm('Supprimer ?')) {
      this.assignmentService.deleteAssignment(id).subscribe(() => {
        setTimeout(() => {
          this.notifService.show('Supprimé', 'info');
          this.refreshAssignments();
        });
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
