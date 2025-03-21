import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  login(token: string): void {
    localStorage.setItem('token',token);
    this.router.navigate(['/home']);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
