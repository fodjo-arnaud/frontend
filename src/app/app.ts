import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet, Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { NotificationService, Notification } from './services/notification';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  notification: Notification | null = null;
  currentRoute: string = '';
  isDarkMode: boolean = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notifService: NotificationService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Initialiser le thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    this.notifService.getNotification().subscribe(notif => {
      this.notification = notif.show ? notif : null;
    });
  }

  toggleTheme() {
    if (this.isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  enableDarkMode() {
    this.isDarkMode = true;
    this.renderer.addClass(document.body, 'dark-theme');
    localStorage.setItem('theme', 'dark');
  }

  disableDarkMode() {
    this.isDarkMode = false;
    this.renderer.removeClass(document.body, 'dark-theme');
    localStorage.setItem('theme', 'light');
  }

  shouldShowNavbar(): boolean {
    const isLoginPage = this.currentRoute === '/' || this.currentRoute === '' || this.currentRoute.includes('/login');
    return this.auth.isLogged() && !isLoginPage;
  }

  onLogout() {
    this.auth.logout();
    this.notifService.show('Déconnexion réussie', 'info');
    this.router.navigate(['/']);
  }
}
