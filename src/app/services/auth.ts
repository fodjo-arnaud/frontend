import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private logged = false;

  constructor() {}

  login(username: string, password: string) {
    const currentStoredPass = localStorage.getItem('password') || '1234';

    if ((username === "admin" || username === "user") && password === currentStoredPass) {
      this.logged = true;
      localStorage.setItem('logged', 'true');
      localStorage.setItem('role', username === "admin" ? 'admin' : 'user');
      localStorage.setItem('username', username);

      // Enregistrement de la date de connexion
      const loginDate = new Date().toISOString();
      localStorage.setItem('lastLogin', loginDate);

      if (!localStorage.getItem('password')) {
        localStorage.setItem('password', '1234');
      }
      return true;
    }
    return false;
  }

  logout() {
    this.logged = false;
    localStorage.removeItem('logged');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    // On peut choisir de garder lastLogin ou de le supprimer.
    // Généralement on le garde pour l'afficher au prochain profil.
  }

  isLogged(): boolean {
    return this.logged || localStorage.getItem('logged') === 'true';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getLastLogin(): string | null {
    return localStorage.getItem('lastLogin');
  }

  updatePassword(oldPass: string, newPass: string): boolean {
    const currentPass = localStorage.getItem('password') || '1234';
    if (oldPass === currentPass) {
      localStorage.setItem('password', newPass);
      return true;
    }
    return false;
  }
}
