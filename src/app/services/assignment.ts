import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  url = "https://assignments-api1.onrender.com/api/assignments";

  constructor(private http: HttpClient) {}

  getAssignments(page: number = 1, limit: number = 20, search: string = '', filter: string = '', author: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (filter) params = params.set('rendu', filter);
    if (author) params = params.set('auteur', author);

    return this.http.get(this.url, { params });
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
