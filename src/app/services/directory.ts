import { Injectable } from '@angular/core';

export interface DirectoryItem {
  id: string;
  name: string;
  avatar?: string;
}

export interface SubjectItem {
  name: string;
  prof: string;
  icon: string;
  color: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {

  private students: DirectoryItem[] = [
    { id: '1', name: 'Alice Martin' },
    { id: '2', name: 'Bob Dupont' },
    { id: '3', name: 'Charlie Durand' },
    { id: '4', name: 'David Lefebvre' },
    { id: '5', name: 'Eve Morel' },
    { id: '6', name: 'Frank Petit' },
    { id: '7', name: 'Grace Bertrand' },
  ];

  private subjects: SubjectItem[] = [
    { name: 'Mathématiques', prof: 'M. Dupont', icon: 'calculate', color: '#e53e3e', image: 'https://img.freepik.com/vecteurs-libre/fond-education-mathematiques-dessines-main_23-2148463442.jpg' },
    { name: 'Réseau & LAN', prof: 'Mme. Lambert', icon: 'lan', color: '#3182ce', image: 'https://t3.ftcdn.net/jpg/02/09/25/36/360_F_209253685_9f4Y1FhM461e5B9qJIn5t7lq2U9S4zH6.jpg' },
    { name: 'Développement Java', prof: 'M. Silue', icon: 'code', color: '#38a169', image: 'https://logos-world.net/wp-content/uploads/2022/07/Java-Logo.png' },
    { name: 'Base de données SQL', prof: 'Mme. Leroy', icon: 'storage', color: '#805ad5', image: 'https://img.freepik.com/vecteurs-premium/concept-sql-administration-donnees-developpement-logiciel-creation-requetes-sql_645513-43.jpg' },
    { name: 'Web Design (UI/UX)', prof: 'M. Roux', icon: 'palette', color: '#d53f8c', image: 'https://img.freepik.com/vecteurs-libre/concept-conception-web-flat-design_23-2148139812.jpg' },
    { name: 'Intelligence Artificielle', prof: 'M. Bernard', icon: 'psychology', color: '#319795', image: 'https://img.freepik.com/vecteurs-libre/technologie-intelligence-artificielle-futuriste-visage_1017-21775.jpg' }
  ];

  getStudents() {
    return this.students;
  }

  getSubjects() {
    return this.subjects;
  }

  getSubjectByName(name: string) {
    return this.subjects.find(s => s.name === name);
  }
}
