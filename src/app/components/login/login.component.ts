import { Component } from '@angular/core';
import { PoPageLoginModule, PoPageLoginLiterals } from '@po-ui/ng-templates';
import { AuthService } from '../../services/auth.service';
import { PoNotificationService } from '@po-ui/ng-components';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [
    PoPageLoginModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService: AuthService, private poNotification: PoNotificationService, private router: Router, private http: HttpClient) {}

  loading: boolean = false;

  customLiterals: PoPageLoginLiterals = {
    loginLabel: 'Usuário',
    passwordLabel: 'Senha',
    loginPlaceholder: 'Código de Vendedor, CPF ou CNPJ',
    loginHint: 'Suas credenciais de acesso são as fornecidas pela equipe comercial da Serv Sal',
  };

  /*
  onLoginSubmit(credentials: {login: string; password: string}) {
    this.loading = true;
    if (credentials.login === 'admin' && credentials.password === 'admin') {
      this.authService.login('token-test');
      this.poNotification.success('Login realizado com sucesso!');
    } else {
      this.poNotification.error('Usuário ou senha inválidos.')
      this.loading = false;
    }
    */
  
  onLoginSubmit(credentials: {login: string; password: string}) {
    this.loading = true;
    this.authService.login(credentials.login, credentials.password).subscribe({
      next: (res: any) => {
        if (res.auth === true) {
          localStorage.setItem('authToken', res.authToken);
          localStorage.setItem('authTokenExpiration', res.authTokenExpiration);
          localStorage.setItem('userName', this.capitalizeName(res.userName));
          localStorage.setItem('sellerId', res.sellerId);
          this.router.navigate(['/','home'])
          this.poNotification.success(res.message);
        } else {
          this.poNotification.error('Erro ao realizar o login: ' + res.message)
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.poNotification.error('Erro ao realizar o login: ' + error.message);
        this.loading = false;
      }
    });
  }

  capitalizeName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Verifica se a palavra tem caracteres acentuados e capitaliza corretamente
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

}
