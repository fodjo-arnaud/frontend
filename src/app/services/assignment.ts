import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  url = "https://assignments-api1.onrender.com/api/assignments";

  constructor(private http: HttpClient) {}

  getAssignments(page: number = 1, limit: number = 20, search: string = '', filter: string = '', author: string = ''): Observable<any> {
    let queryUrl = `${this.url}?page=${page}&limit=${limit}`;
    if (search) queryUrl += `&search=${search}`;
    if (filter) queryUrl += `&rendu=${filter}`;
    // On ajoute le filtre par auteur si précisé
    if (author) queryUrl += `&auteur=${author}`;
    return this.http.get(queryUrl);
  }

  addAssignment(assignment: any): Observable<any> {
    return this.http.post(this.url, assignment);
  }

  deleteAssignment(id: string): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  updateAssignment(id: string, assignment: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, assignment);
  }
}
