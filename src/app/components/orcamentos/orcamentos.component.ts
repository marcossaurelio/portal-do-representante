import { Component } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule, PoFieldModule, PoModule, PoTableAction, PoPageAction, PoNotificationService } from '@po-ui/ng-components';
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

  constructor(private router: Router, private api: ApiService, private poNotification: PoNotificationService) {}

  public columns: Array<PoTableColumn> = [];
  public items: Array<any> = [];
  public filteredItems: Array<any> = [];
  private sellerId: string = localStorage.getItem('sellerId') ?? '';
  public isHideLoading: boolean = true;
  public selectedFilterBlock: number = 0;

  public readonly actions: Array<PoPageAction> = [
    {label: 'Incluir', action: this.addBudget.bind(this), icon: 'an an-plus', disabled: false, visible: true}
  ]
  
  public readonly itemActions: Array<PoTableAction> = [
    {action: this.modifyBudget.bind(this),      icon: 'an an-note-pencil',        label: 'Alterar',               disabled: false                                          },
    {action: this.viewBudget.bind(this),        icon: 'an an-magnifying-glass',   label: 'Visualizar',            disabled: false                                          },
    {action: this.copyBudget.bind(this),        icon: 'an an-copy',               label: 'Copiar',                disabled: false                                          },
    {action: this.approveQuotation.bind(this),  icon: 'an an-paper-plane-tilt',   label: 'Enviar para Aprovação', disabled: (item: any) => !this.isPendingOrder(item)                                          },
    {action: this.approveQuotation.bind(this),  icon: 'an an-check',              label: 'Aprovar cotação',       disabled: (item: any) => !this.isPendingQuotation(item)  },
    {action: this.rejectQuotation.bind(this),   icon: 'an an-x',                  label: 'Rejeitar cotação',      disabled: (item: any) => !this.isPendingQuotation(item)  },
  ]

  public readonly filters: Array<PoPageDynamicSearchFilters> = [
    { property: 'budget',         label: 'Orçamento'      , type: 'label'},
    { property: 'order',          label: 'Pedido'         },
    { property: 'customer',       label: 'Cliente'        },
    { property: 'inclusionDate',  label: 'Data Inclusão'  },
  ]
  
  public blockFilters: Array<any> = [
    { order: 1, description: 'Em cotação',      amount: 0,  filter: 'CJ_YPRSITU = \'CP\'' },
    { order: 2, description: 'Em aprovação',    amount: 0,  filter: 'CJ_YPRSITU = \'PE\'' },
    { order: 3, description: 'Em carregamento', amount: 0,  filter: 'CJ_YPRSITU = \'PA\' AND C5_NOTA = \'\'' },
    { order: 4, description: 'Faturados',       amount: 0,  filter: 'CJ_YPRSITU = \'PA\' AND C5_NOTA != \'\'' },
    { order: 5, description: 'Rejeitados',      amount: 0,  filter: 'CJ_YPRSITU = \'PR\'' },
    { order: 6, description: 'Pendente ação',   amount: 0,  filter: 'CJ_YPRSITU IN (\'CP\',\'PP\')' },
  ];

  public async ngOnInit(): Promise<void> {
    this.isHideLoading = false;
    this.columns = this.getColumns();
    this.items = await this.getItems();
    this.filteredItems = [...this.items];
    await this.updateBlockFilters();
    this.isHideLoading = true;
  }

  private async updateBlockFilters() {
    const body: any = {
      vendedor: this.sellerId,
      indicadores: this.blockFilters.map((indicador: any) => ({
        ordem:        indicador.order           ?? "",
        descricao:    indicador.description     ?? "",
        filtro:       indicador.filter          ?? "",
        quantidade:   indicador.amount          ?? 0
      }))
    }
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/orcamentos/indicadores', body));
      if (res.success) {
        this.blockFilters = this.blockFilters.map((item: any, index: number) => ({
          ...item, // Mantém todos os campos originais
          amount: res.indicadores[index]?.quantidade ?? 0
        }));
      } else {
        this.poNotification.error('Falha ao atualizar os indicadores: ' + res.message);
      }
    } catch (e: any) {
      this.poNotification.error('Falha ao atualizar os indicadores: ' + e.message);
    }
  }

  public getColumns(): Array<PoTableColumn> {
    return [
      {property: 'loadingLocation', label: 'Unidade'},
      {property: 'budget', label: 'Orçamento'},
      {
        property: 'budgetStatus',
        label: 'Situação Orçamento',
        type: 'label',
        labels: [
          { value: 'CP',  type: PoTagType.Warning,    label: 'Cotação pendente',        icon: true  },
          { value: 'CR',  type: PoTagType.Neutral,    label: 'Cotação rejeitada',       icon: false },
          { value: 'PP',  type: PoTagType.Warning,    label: 'Pré pedido pendente',     icon: true  },
          { value: 'PE',  type: PoTagType.Info,       label: 'Pré pedido em aprovação', icon: true  },
          { value: 'PC',  type: PoTagType.Neutral,    label: 'Pré pedido cancelado',    icon: true  },
          { value: 'PR',  type: PoTagType.Danger,     label: 'Pré pedido rejeitado',    icon: true  },
          { value: 'PA',  type: PoTagType.Success,    label: 'Pré pedido aprovado',     icon: true  },
        ]
      },
      {property: 'order', label: 'Pedido'},
      {
        property: 'orderStatus',
        label: 'Situação Pedido',
        type: 'label',
        labels: [
          { value: 'F', type: PoTagType.Success,    label: 'Faturado',          icon: true  },
          { value: 'C', type: PoTagType.Info,       label: 'Em carregamento',   icon: true  },
          { value: 'O', type: PoTagType.Warning,    label: 'Aguardando Ordem',  icon: true  },
        ]
      },
      { property: 'customer',       label: 'Cliente'  },
      //{ property: 'totalValue',     label: 'Valor Total',   type: 'numeric'  },
      { property: 'inclusionDate',  label: 'Data Inclusão', type: 'date'     },
    ]
  }

  public async getItems(filter?: string): Promise<Array<any>> {
    const params: string = '?sellerId='+this.sellerId+'&page=1';
    const body: any = {filtro: filter ?? ''};
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/orcamentos' + params,body));
      return res.objects.map((item: any) => ({
        loadingLocationCode:  item.filial,
        loadingLocation:      this.getLoadingLocationByCode(item.filial),
        budgetStatus:         item.situacao,
        orderStatus:          '',
        budget:               item.orcamento,
        order:                '',
        customer:             item.nomeCliente,
        totalValue:           item.valorTotal,
        inclusionDate:        this.dateFormat(item.dataEmissao),
      }));
    } catch (e: any) {
      this.poNotification.error('Falha ao buscar os orçamentos: ' + e.message);
      return [];
    }
  }

  public cleanBrowse() {
    this.filteredItems = [];
  }

  private getLoadingLocationByCode(code: string): string{

    if (code == '01020009'){
      return 'SP'
    } else if (code == '01030010') {
      return 'RJ'
    } else {
      return 'RN'
    }

  }

  private dateFormat(dateString: string): string {

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    return year+'-'+month+'-'+day;

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

  private isPendingOrder(item: any): boolean {
    return item.budgetStatus === 'PP'
  }

  public async onBlockClick(order: number) {
    this.isHideLoading = false;
    if (order === this.selectedFilterBlock) {
      this.selectedFilterBlock = 0; // Limpa o filtro se o mesmo bloco for clicado novamente
      this.items = await this.getItems();
      this.filteredItems = [...this.items];
    } else {
      const filter = this.blockFilters.find(block => block.order === order);
      if (filter) {
        this.selectedFilterBlock = order;
        this.items = await this.getItems(filter.filter);
        this.filteredItems = [...this.items];
      }
    }
    this.isHideLoading = true;
  }
  
  public addBudget() {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'add' } })
  }
  
  public viewBudget(item: any) {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'view', location: item.loadingLocationCode, budget: item.budget } })
  }
  
  public copyBudget(item: any) {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'copy', location: item.loadingLocationCode, budget: item.budget } })
  }
  
  public modifyBudget(item: any) {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'modify', location: item.loadingLocationCode, budget: item.budget } })
  }
  
  public approveQuotation() {

  }

  public rejectQuotation() {

  }
  
}
