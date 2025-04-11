import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private http: HttpClient, private api: ApiService) {}

  private endPointLogin = 'portal-do-representante/login/';

  public isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    const tokenExpiration = localStorage.getItem('authTokenExpiration');

    if (!token || !tokenExpiration) {
      return false;
    }
  
    // Gera a data atual no formato YYYYMMDD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayFormatted = `${year}${month}${day}`;
  
    return tokenExpiration >= todayFormatted;
  }
    
  /*
  login(token: string): void {
    localStorage.setItem('token',token);
    this.router.navigate(['/home']);
  }
  */

  public login(user: string, password: string) {
    const body = {
      "user": user,
      "password": password
    };
    return this.api.post(this.endPointLogin, body);
  }

  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    this.router.navigate(['/login']);
  }
}
