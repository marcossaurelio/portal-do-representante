import { Component } from '@angular/core';
import { PoPageLoginModule, PoPageLoginLiterals } from '@po-ui/ng-templates';
import { AuthService } from '../../auth.service';
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

  onLoginSubmit(credentials: {login: string; password: string}) {
    this.loading = true;
    if (credentials.login === 'admin' && credentials.password === 'admin') {
      this.authService.login('token-test');
      this.poNotification.success('Login realizado com sucesso!');
    } else {
      this.poNotification.error('Usuário ou senha inválidos.')
      this.loading = false;
    }
    
    /*
  onLoginSubmit(credentials: {login: string; password: string}) {
    this.loading = true;
    this.authService.login(credentials.login, credentials.password).subscribe({
      next: (res: any) => {
        if (res.auth === 'true') {
          this.poNotification.success('Login realizado com sucesso!');
          localStorage.setItem('Token', res.token);
          localStorage.setItem('tokenExpiration', res.tokenExpiration);
          this.router.navigate(['/','home'])
        } else {
          this.poNotification.error('Usuário ou senha inválidos.')
          this.loading = false;
        }
      },
      error: () => {
        this.poNotification.error('Usuário ou senha inválidos.')
        this.loading = false;
        }
      });
      */
  }

}
