import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { PoButtonModule, PoToolbarProfile, PoToolbarAction, PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from './auth.service';
import { ProtheusLibCoreModule } from '@totvs/protheus-lib-core';

import {
  PoMenuItem,
  PoMenuModule,
  PoPageModule,
  PoToolbarModule,
  PoImageModule
} from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    PoImageModule,
    PoToolbarModule,
    PoMenuModule,
    PoButtonModule,
    PoPageModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  constructor(private router: Router, private authService: AuthService, private poNotification: PoNotificationService) {

  }

  get isLoginRoute(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/page-not-found')
  }

  logoServSal = 'assets/images/logo-serv-sal.png';

  profile: PoToolbarProfile = {
    avatar: 'https://via.placeholder.com/48x48?text=AVATAR',
    subtitle: 'Representante',
    title: 'Admin'
  };

  profileActions: Array<PoToolbarAction> = [
    { icon: 'an an-sign-out', label: 'Sair', type: 'danger', separator: true, action: this.logout.bind(this) }
  ];

  readonly menus: Array<PoMenuItem> = [
    { label: 'Home',                      action: this.homeClick.bind(this),          icon: 'an an-house-line',             shortLabel: "Home" },
    { label: 'Orçamentos',                action: this.orcamentosClick.bind(this),    icon: 'an an-clipboard-text',         shortLabel: "Orçamentos" },
    { label: 'Visão Geral de Vendas',     action: this.visaoVendasClick.bind(this),   icon: 'an an-chart-line-up',          shortLabel: "Vendas" },
    { label: 'Categorias e Performance',  action: this.categoriasClick.bind(this),    icon: 'an an-chart-pie-slice',        shortLabel: "Performance" },
    { label: 'Contas a Receber',          action: this.contasReceberClick.bind(this), icon: 'an an-currency-circle-dollar', shortLabel: "Contas a Receber" },
    { label: 'Tabelas de Preço',          action: this.tabelasPrecoClick.bind(this),  icon: 'an an-money-wavy',             shortLabel: "Tabelas de Preço" },
  ];

  private homeClick() {
    this.router.navigate(['/','home']);
  }

  private orcamentosClick() {
    this.router.navigate(['/', 'orcamentos']);
  }
  
  private visaoVendasClick() {
    this.router.navigate(['/', 'visao-vendas']);
  }
  
  private categoriasClick() {
    this.router.navigate(['/', 'categorias']);
  }
  
  private contasReceberClick() {
    this.router.navigate(['/', 'contas-a-receber']);
  }

  private tabelasPrecoClick() {
    this.router.navigate(['/', 'tabelas-preco']);
  }
  
  logout() {
    this.authService.logout();
    this.poNotification.information('Logout realizado com sucesso!');
  }

}