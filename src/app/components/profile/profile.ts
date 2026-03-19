import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  username: string = '';
  role: string = '';
  lastLogin: string | null = null;

  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  showPasswords = {
    current: false,
    new: false,
    confirm: false
  };

  constructor(
    public auth: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.auth.getUsername();
    this.role = this.auth.isAdmin() ? 'Administrateur' : 'Élève / Utilisateur';
    // Récupération de la vraie date de connexion
    this.lastLogin = this.auth.getLastLogin();
  }

  togglePassword(field: 'current' | 'new' | 'confirm') {
    this.showPasswords[field] = !this.showPasswords[field];
  }

  onChangePassword() {
    if (!this.passwords.current) {
      this.notifService.show('Mot de passe actuel requis', 'error');
      return;
    }

    if (this.passwords.new !== this.passwords.confirm) {
      this.notifService.show('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    const success = this.auth.updatePassword(this.passwords.current, this.passwords.new);

    if (success) {
      this.notifService.show('Mot de passe mis à jour !', 'success');
      this.passwords = { current: '', new: '', confirm: '' };
    } else {
      this.notifService.show('Ancien mot de passe incorrect', 'error');
    }
  }

  goBack() {
    this.router.navigate(['/assignments']);
  }
}
