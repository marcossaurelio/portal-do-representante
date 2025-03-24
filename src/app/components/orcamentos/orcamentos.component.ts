import { Component } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule, PoFieldModule, PoModule, PoTableAction } from '@po-ui/ng-components';
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

  public columns: Array<PoTableColumn> = [];
  public items: Array<any> = [];

  public itemActions: Array<PoTableAction> = [
    {action: this.modifyBudget.bind(this),  icon: 'an an-note-pencil',        label: 'Alterar',            disabled: false                         },
    {action: this.modifyBudget.bind(this),  icon: 'an an-magnifying-glass',   label: 'Visualizar',         disabled: false                         },
    {action: this.modifyBudget.bind(this),  icon: 'an an-copy',               label: 'Copiar',             disabled: false                         },
    {action: this.modifyBudget.bind(this),  icon: 'an an-check',              label: 'Aprovar cotação',    disabled: !!this.isQuotation.bind(this) },
    {action: this.modifyBudget.bind(this),  icon: 'an an-x',                  label: 'Rejeitar cotação',   disabled: !!this.isQuotation.bind(this) },
  ]

  constructor(){

  }

  ngOnInit(): void {
    
    this.columns = this.getColumns();
    this.items = this.getItems();

  }

  public getColumns(): Array<PoTableColumn> {
    return [
      {
        property: 'Situação Orçamento',
        type: 'label',
        labels: [
          { value: 'CP',  type: PoTagType.Info,       label: 'Cotação pendente',      icon: true },
          { value: 'CR',  type: PoTagType.Neutral,    label: 'Cotação rejeitada',     icon: true },
          { value: 'PP',  type: PoTagType.Warning,    label: 'Pré pedido pendente',   icon: true },
          { value: 'PR',  type: PoTagType.Danger,     label: 'Pré pedido rejeitado',  icon: true },
          { value: 'PA',  type: PoTagType.Success,    label: 'Pré pedido aprovado',   icon: true },
        ]
      },
      {
        property: 'Situação Pedido',
        type: 'label',
        labels: [
          { value: 'F', type: PoTagType.Success,    label: 'Faturado',          icon: true  },
          { value: 'O', type: PoTagType.Warning,    label: 'Aguardando Ordem',  icon: true },
          { value: 'C', type: PoTagType.Info,       label: 'Em carregamento',   icon: true },
        ]
      },
      {property: 'Orçamento'},
      {property: 'Pedido'},
      {property: 'Cliente'},
      {property: 'Data Inclusão'},
    ]
  }

  public getItems(): Array<any> {
   return [
    {'Situação Orçamento':'PA',   'Situação Pedido':'F',  'Orçamento':'000001',   'Pedido':'000856',  'Cliente':'M C SERVICOS DE TECNOLOGIA E GESTAO',  'Data Inclusão':'07/03/2025'},
    {'Situação Orçamento':'PA',   'Situação Pedido':'C',  'Orçamento':'000002',   'Pedido':'000892',  'Cliente':'SERV SAL REFINARIA LTDA',              'Data Inclusão':'07/03/2025'},
    {'Situação Orçamento':'PA',   'Situação Pedido':'O',  'Orçamento':'000005',   'Pedido':'000913',  'Cliente':'MC DISTRIBUIDORA LTDA',                'Data Inclusão':'08/03/2025'},
    {'Situação Orçamento':'PR',   'Situação Pedido':' ',  'Orçamento':'000008',   'Pedido':'      ',  'Cliente':'MOSSORO ATACADO E VAREJO LTDA',        'Data Inclusão':'10/03/2025'},
    {'Situação Orçamento':'PP',   'Situação Pedido':' ',  'Orçamento':'000010',   'Pedido':'      ',  'Cliente':'M C SERVICOS DE TECNOLOGIA E GESTAO',  'Data Inclusão':'10/03/2025'},
    {'Situação Orçamento':'CP',   'Situação Pedido':' ',  'Orçamento':'000022',   'Pedido':'      ',  'Cliente':'FORTALEZA REFINADOS SA',               'Data Inclusão':'10/03/2025'},
    {'Situação Orçamento':'CR',   'Situação Pedido':' ',  'Orçamento':'000025',   'Pedido':'      ',  'Cliente':'SERV SAL REFINARIA LTDA',              'Data Inclusão':'10/03/2025'},
   ]
  }

  private isQuotation(item: any): boolean {
    return item['Situação Orçamento'] === 'CP';
  }

  addOrcamento() {

  }

  modifyBudget() {
    
  }
  
  
}
