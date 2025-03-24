import { Component } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule, PoFieldModule, PoModule } from '@po-ui/ng-components';
import { PoPageDynamicSearchModule, PoPageDynamicSearchLiterals, PoPageDynamicSearchFilters, PoPageDynamicTableModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-orcamentos',
  imports: [
    PoInfoModule,
    PoTableModule,
    PoSearchModule,
    PoButtonModule,
    PoWidgetModule,
    PoFieldModule,
    PoModule,
    PoPageDynamicSearchModule,
    PoPageDynamicTableModule,
  ],
  templateUrl: './orcamentos.component.html',
  styleUrl: './orcamentos.component.css'
})
export class OrcamentosComponent {

  constructor(){

  }

  addOrcamento() {

  }
  
}
