import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private http: HttpClient) {}

  private apiUrl = 'https://192.168.100.249:8500/portal-do-representante/login/';

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  login(token: string): void {
    localStorage.setItem('token',token);
    this.router.navigate(['/home']);
  }

  /*
  login(user: string, password: string) {
    const body = {
      "user": user,
      "password": password
    };
    return this.http.post(this.apiUrl, body);
  }
  */

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
