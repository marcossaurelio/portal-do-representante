import { Component } from '@angular/core';
import { PoPageModule, PoInfoModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-home',
  imports: [
    PoPageModule,
    PoInfoModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor() {

  }

  private userName: string = localStorage.getItem('userName') ?? '';

  public welcomeMessage: string = this.userName ? 'Seja bem-vindo, ' + this.userName : 'Seja bem-vindo';

}
