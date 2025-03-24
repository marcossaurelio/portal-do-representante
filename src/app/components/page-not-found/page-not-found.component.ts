import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  PoButtonModule,
  PoPageModule,
  PoMenuItem,
  PoMenuModule,
  PoImageModule,
  PoToolbarModule,
  PoFieldModule,
} from '@po-ui/ng-components';


@Component({
  selector: 'app-page-not-found',
  imports: [
    CommonModule,
    PoImageModule,
    PoToolbarModule,
    PoMenuModule,
    PoButtonModule,
    PoPageModule,
    PoFieldModule
  ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  
  constructor(private router :Router){

  }

  navigateToHome() {
    this.router.navigate(['/','home']);
  }

}
