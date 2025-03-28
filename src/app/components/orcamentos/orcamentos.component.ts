import { Component } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule, PoFieldModule, PoModule, PoTableAction, PoPageAction } from '@po-ui/ng-components';
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

  public readonly actions: Array<PoPageAction> = [
    {label: 'Incluir', action: this.addBudget.bind(this), icon: 'an an-plus', disabled: false, visible: true}
  ]
  
  public readonly itemActions: Array<PoTableAction> = [
    {action: this.modifyBudget.bind(this),      icon: 'an an-note-pencil',        label: 'Alterar',            disabled: false                                          },
    {action: this.viewBudget.bind(this),        icon: 'an an-magnifying-glass',   label: 'Visualizar',         disabled: false                                          },
    {action: this.copyBudget.bind(this),        icon: 'an an-copy',               label: 'Copiar',             disabled: false                                          },
    {action: this.approveQuotation.bind(this),  icon: 'an an-check',              label: 'Aprovar cotação',    disabled: (item: any) => !this.isPendingQuotation(item)  },
    {action: this.rejectQuotation.bind(this),   icon: 'an an-x',                  label: 'Rejeitar cotação',   disabled: (item: any) => !this.isPendingQuotation(item)  },
  ]

  public readonly filterColumns: Array<PoPageDynamicSearchFilters> = [
    { property: 'budget',         label: 'Orçamento'      , type: 'label'},
    { property: 'order',          label: 'Pedido'         },
    { property: 'customer',       label: 'Cliente'        },
    { property: 'inclusionDate',  label: 'Data Inclusão'  },
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
        property: 'budgetStatus',
        label: 'Situação Orçamento',
        type: 'label',
        labels: [
          { value: 'CP',  type: PoTagType.Info,       label: 'Cotação pendente',      icon: true  },
          { value: 'CR',  type: PoTagType.Neutral,    label: 'Cotação rejeitada',     icon: false },
          { value: 'PP',  type: PoTagType.Warning,    label: 'Pré pedido pendente',   icon: true  },
          { value: 'PC',  type: PoTagType.Neutral,    label: 'Pré pedido cancelado',  icon: true  },
          { value: 'PR',  type: PoTagType.Danger,     label: 'Pré pedido rejeitado',  icon: true  },
          { value: 'PA',  type: PoTagType.Success,    label: 'Pré pedido aprovado',   icon: true  },
        ]
      },
      {
        property: 'orderStatus',
        label: 'Situação Pedido',
        type: 'label',
        labels: [
          { value: 'F', type: PoTagType.Success,    label: 'Faturado',          icon: true  },
          { value: 'O', type: PoTagType.Warning,    label: 'Aguardando Ordem',  icon: true  },
          { value: 'C', type: PoTagType.Info,       label: 'Em carregamento',   icon: true  },
        ]
      },
      {property: 'budget', label: 'Orçamento'},
      {property: 'order', label: 'Pedido'},
      {property: 'customer', label: 'Cliente'},
      {property: 'inclusionDate', label: 'Data Inclusão'},
    ]
  }

  public getItems(): Array<any> {
    return [
      {'budgetStatus':'PA',   'orderStatus':'F',  'budget':'000001',   'order':'000856',  'customer':'M C SERVICOS DE TECNOLOGIA E GESTAO',  'inclusionDate':'07/03/2025'},
      {'budgetStatus':'PA',   'orderStatus':'C',  'budget':'000002',   'order':'000892',  'customer':'SERV SAL REFINARIA LTDA',              'inclusionDate':'07/03/2025'},
      {'budgetStatus':'PA',   'orderStatus':'O',  'budget':'000005',   'order':'000913',  'customer':'MC DISTRIBUIDORA LTDA',                'inclusionDate':'08/03/2025'},
      {'budgetStatus':'PR',   'orderStatus':' ',  'budget':'000008',   'order':'      ',  'customer':'MOSSORO ATACADO E VAREJO LTDA',        'inclusionDate':'10/03/2025'},
      {'budgetStatus':'PP',   'orderStatus':' ',  'budget':'000010',   'order':'      ',  'customer':'M C SERVICOS DE TECNOLOGIA E GESTAO',  'inclusionDate':'10/03/2025'},
      {'budgetStatus':'CP',   'orderStatus':' ',  'budget':'000022',   'order':'      ',  'customer':'FORTALEZA REFINADOS SA',               'inclusionDate':'10/03/2025'},
      {'budgetStatus':'CR',   'orderStatus':' ',  'budget':'000025',   'order':'      ',  'customer':'SERV SAL REFINARIA LTDA',              'inclusionDate':'10/03/2025'},
    ]
  }

  private isPendingQuotation(item: any): boolean {
    return item.budgetStatus === 'CP';
  }
  
  public addBudget() {
    
  }
  
  public viewBudget() {
    
  }
  
  public copyBudget() {
    
  }
  
  public modifyBudget() {
    
  }
  
  public approveQuotation() {

  }

  public rejectQuotation() {

  }
  
}
