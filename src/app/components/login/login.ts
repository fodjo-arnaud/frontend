import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./login.css'],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {

  username = "";
  password = "";
  error = "";
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    // On ne redirige plus automatiquement.
    // On reste sur la page de connexion comme vous l'avez demandé.
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.username || !this.password) {
      this.error = "Veuillez remplir tous les champs";
      return;
    }

    if (this.auth.login(this.username, this.password)) {
      this.notifService.show(`Bienvenue, ${this.username} !`, 'success');
      this.router.navigate(['/assignments']);
    } else {
      this.error = "Login ou mot de passe incorrect";
      this.notifService.show("Échec de l'authentification", 'error');
    }
  }
}
