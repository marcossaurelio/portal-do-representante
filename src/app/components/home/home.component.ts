import { Component } from '@angular/core';
import { PoPageModule, PoInfoModule, PoWidgetModule, PoButtonModule } from '@po-ui/ng-components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    PoPageModule,
    PoInfoModule,
    PoWidgetModule,
    PoButtonModule,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {

  }

  private userName: string = localStorage.getItem('userName') ?? '';

  public welcomeMessage: string = this.userName ? 'Seja bem-vindo, ' + this.userName : 'Seja bem-vindo';

  public redirectToBudgetsPage(): void {
    this.router.navigate(['/','orcamentos']);
  }

  public redirectToSalesOverviewPage(): void {
    this.router.navigate(['/','visao-vendas']);
  }

  public redirectToAccountsReceivablePage(): void {
    this.router.navigate(['/','contas-a-receber']);
  }

  public redirectToPriceTablesPage(): void {
    this.router.navigate(['/','tabelas-preco']);
  }

}
