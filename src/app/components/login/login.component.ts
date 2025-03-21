import { Component } from '@angular/core';
import { PoPageLoginModule, PoPageLoginLiterals } from '@po-ui/ng-templates';
import { AuthService } from '../../auth.service';
import { PoNotificationService } from '@po-ui/ng-components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    PoPageLoginModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService: AuthService, private poNotification: PoNotificationService, private router: Router) {}

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
  }

}
