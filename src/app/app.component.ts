import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

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
    PoPageModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  constructor(private router: Router) {

  }

  srcImage = 'assets/images/logo-serv-sal.png';

  readonly menus: Array<PoMenuItem> = [
    { label: 'Home',                      action: this.homeClick.bind(this),          icon: 'an an-house-line',             shortLabel: "Home" },
    { label: 'Orçamentos',                action: this.orcamentosClick.bind(this),    icon: 'an an-clipboard-text',         shortLabel: "Orçamentos" },
    { label: 'Visão Geral de Vendas',     action: this.visaoVendasClick.bind(this),   icon: 'an an-chart-line-up',          shortLabel: "Vendas" },
    { label: 'Categorias e Performance',  action: this.categoriasClick.bind(this),    icon: 'an an-chart-pie-slice',        shortLabel: "Performance" },
    { label: 'Contas a Receber',          action: this.contasReceberClick.bind(this), icon: 'an an-currency-circle-dollar', shortLabel: "Contas a Receber" },
  ];

  private homeClick() {
    this.router.navigate(['/']);
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
  
}