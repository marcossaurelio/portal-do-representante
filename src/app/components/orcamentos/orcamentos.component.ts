import { Component } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule, PoFieldModule, PoModule, PoTableAction, PoPageAction } from '@po-ui/ng-components';
import { PoPageDynamicSearchModule, PoPageDynamicSearchFilters, PoPageDynamicTableModule } from '@po-ui/ng-templates';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

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

  constructor(private router: Router, private api: ApiService) {}

  public columns: Array<PoTableColumn> = [];
  public items: Array<any> = [];
  public filteredItems: Array<any> = [];

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

  public readonly filters: Array<PoPageDynamicSearchFilters> = [
    { property: 'budget',         label: 'Orçamento'      , type: 'label'},
    { property: 'order',          label: 'Pedido'         },
    { property: 'customer',       label: 'Cliente'        },
    { property: 'inclusionDate',  label: 'Data Inclusão'  },
  ]
  
  public async ngOnInit(): Promise<void> {
    this.columns = this.getColumns();
    this.items = await this.getItems();
    this.filteredItems = [...this.items];
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

  public async getItems(): Promise<Array<any>> {
    
    const params: string = '?seller=000017&page=1';

    try {

      const res: any = await firstValueFrom(this.api.get('portal-do-representante/orcamentos' + params));

      return res.objects.map((item: any) => ({
        budgetStatus: 'CP',
        orderStatus: '',
        budget: item.orcamento,
        order: '',
        customer: item.cliente,
        inclusionDate: item.dataEmissao,
      }));

    } catch (e) {

      console.error('Falha ao buscar os dados: ' + e);
      return [];

    }
  }

  public onAdvancedSearch(filter: object) {
    const filters = Object.entries(filter)
    filters.length ? this.searchItems(filters) : this.resetFilters();
  }
  
  private resetFilters() {
    this.filteredItems = this.items;
  }
  
  private searchItems(filters: Array<any>) {
    this.filteredItems = this.items.filter(item => {
    return filters.every(([key, value]) => {
      if (!item[key]) return false;  // Se a chave não existir no item, o item não passa
      return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
    });
  });
  }

  public onQuickSearch(value: string) {
    this.filteredItems = this.items.filter(item =>
      Object.keys(item).some(key =>
        item[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
  }

  public onChangeDisclaimers(disclaimers: Array<any>) {
    if(disclaimers.length > 0) {

      let filters: Array<any> = []
      disclaimers.forEach(disclaimer => filters.push([disclaimer.property,disclaimer.value]));
      this.searchItems(filters);

    } else {

      this.resetFilters();
      
    }
  }

  private isPendingQuotation(item: any): boolean {
    return item.budgetStatus === 'CP';
  }
  
  public addBudget() {
    this.router.navigate(['/','orcamentos','formulario'])
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
