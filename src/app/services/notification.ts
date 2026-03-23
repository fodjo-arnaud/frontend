import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notification$ = new BehaviorSubject<Notification>({
    message: '',
    type: 'success',
    show: false
  });

  private createUserModalTrigger$ = new Subject<void>();

  getNotification() {
    return this.notification$.asObservable();
  }

  getCreateUserModalTrigger() {
    return this.createUserModalTrigger$.asObservable();
  }

  triggerCreateUserModal() {
    this.createUserModalTrigger$.next();
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.notification$.next({ message, type, show: true });
    setTimeout(() => {
      this.notification$.next({ message: '', type, show: false });
    }, 3000);
  }
}
