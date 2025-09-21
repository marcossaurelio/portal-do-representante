import { Component, ViewChild } from '@angular/core';
import { PoInfoModule, PoSearchModule, PoTableModule, PoTagType, PoTableColumn, PoButtonModule, PoWidgetModule } from '@po-ui/ng-components';
import { PoFieldModule, PoModule, PoTableAction, PoPageAction, PoNotificationService, PoModalModule, PoModalComponent } from '@po-ui/ng-components';
import { PoModalAction, PoDynamicFormField,PoDynamicFormValidation, PoDynamicFormFieldChanged, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { PoPageDynamicSearchModule, PoPageDynamicSearchFilters, PoPageDynamicTableModule } from '@po-ui/ng-templates';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CustomerService } from '../../services/domain/customer.service';
import { CityService } from '../../services/domain/city.service';
import { FieldsService } from '../../services/fields.service';
import { firstValueFrom, Observable } from 'rxjs';

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
    PoModalModule,
  ],
  templateUrl: './orcamentos.component.html',
  styleUrl: './orcamentos.component.css'
})
export class OrcamentosComponent {

  constructor(private router: Router, private api: ApiService, private poNotification: PoNotificationService, private customerService: CustomerService, private cityService: CityService, private fieldsService: FieldsService) {}

  @ViewChild('modal', { static: true }) 'modal': PoModalComponent;

  public columns: Array<PoTableColumn> = [];
  public items: Array<any> = [];
  public filteredItems: Array<any> = [];
  private sellerId: string = localStorage.getItem('sellerId') ?? '';
  public isHideLoading: boolean = true;
  public selectedFilterBlock: number = 0;
  public customerModalTitle: string = 'Cadastro de Novo Cliente';
  public customerModalData: any = { hasIe: true };
  public customerModalValidateFields: Array<string> = [];

  public readonly actions: Array<PoPageAction> = [
    { label: 'Incluir',       action: this.addBudget.bind(this),          icon: 'an an-plus',       disabled: false,  visible: true },
    { label: 'Novo Cliente',  action: this.openCustomerModal.bind(this),  icon: 'an an-user-plus',  disabled: false,  visible: true, separator: true },
  ]
  
  public readonly itemActions: Array<PoTableAction> = [
    { action: this.modifyBudget.bind(this),      icon: 'an an-note-pencil',        label: 'Alterar',               disabled: (item: any) => !this.isModifiable(item), visible: (item: any) => !this.isExpired(item)  },
    { action: this.modifyBudget.bind(this),      icon: 'an an-note-pencil',        label: 'Renovar',               disabled: (item: any) => !this.isModifiable(item), visible: (item: any) => this.isExpired(item)   },
    { action: this.viewBudget.bind(this),        icon: 'an an-magnifying-glass',   label: 'Visualizar',            disabled: false                                           },
    { action: this.copyBudget.bind(this),        icon: 'an an-copy',               label: 'Copiar',                disabled: false                                           },
    { action: this.sendToApproval.bind(this),    icon: 'an an-paper-plane-tilt',   label: 'Enviar para Aprovação', disabled: (item: any) => !this.isPendingOrder(item)       },
    { action: this.approveQuotation.bind(this),  icon: 'an an-check',              label: 'Aprovar cotação',       disabled: (item: any) => !this.isPendingQuotation(item)   },
    { action: this.rejectQuotation.bind(this),   icon: 'an an-x',                  label: 'Rejeitar cotação',      disabled: (item: any) => !this.isPendingQuotation(item)   },
  ]

  public readonly filters: Array<PoPageDynamicSearchFilters> = [
    { property: 'budget',         label: 'Orçamento'      , type: 'label'},
    { property: 'order',          label: 'Pedido'         },
    { property: 'customer',       label: 'Cliente'        },
    { property: 'inclusionDate',  label: 'Data Inclusão'  },
  ]
  
  public blockFilters: Array<any> = [
    { order: 1, description: 'Em cotação',      amount: 0,  filter: 'CJ_YPRSITU = \'CP\' AND CJ_VALIDA >= FORMAT(GETDATE(), \'yyyyMMdd\')' },
    { order: 2, description: 'Em aprovação',    amount: 0,  filter: 'CJ_YPRSITU = \'PE\'' },
    { order: 3, description: 'Em carregamento', amount: 0,  filter: 'CJ_YPRSITU = \'PA\' AND C5_NOTA = \'\'' },
    { order: 4, description: 'Faturados',       amount: 0,  filter: 'CJ_YPRSITU = \'PA\' AND C5_NOTA != \'\'' },
    { order: 5, description: 'Rejeitados',      amount: 0,  filter: 'CJ_YPRSITU = \'PR\'' },
    { order: 6, description: 'Pendente ação',   amount: 0,  filter: 'CJ_YPRSITU IN (\'CP\',\'PP\') AND CJ_VALIDA >= FORMAT(GETDATE(), \'yyyyMMdd\')' },
  ];

  public readonly states: Array<any> = [
    { code: 'AC', label: 'Acre' },
    { code: 'AL', label: 'Alagoas' },
    { code: 'AP', label: 'Amapá' },
    { code: 'AM', label: 'Amazonas' },
    { code: 'BA', label: 'Bahia' },
    { code: 'CE', label: 'Ceará' },
    { code: 'DF', label: 'Distrito Federal' },
    { code: 'ES', label: 'Espírito Santo' },
    { code: 'GO', label: 'Goiás' },
    { code: 'MA', label: 'Maranhão' },
    { code: 'MT', label: 'Mato Grosso' },
    { code: 'MS', label: 'Mato Grosso do Sul' },
    { code: 'MG', label: 'Minas Gerais' },
    { code: 'PA', label: 'Pará' },
    { code: 'PB', label: 'Paraíba' },
    { code: 'PR', label: 'Paraná' },
    { code: 'PE', label: 'Pernambuco' },
    { code: 'PI', label: 'Piauí' },
    { code: 'RJ', label: 'Rio de Janeiro' },
    { code: 'RN', label: 'Rio Grande do Norte' },
    { code: 'RS', label: 'Rio Grande do Sul' },
    { code: 'RO', label: 'Rondônia' },
    { code: 'RR', label: 'Roraima' },
    { code: 'SC', label: 'Santa Catarina' },
    { code: 'SP', label: 'São Paulo' },
    { code: 'SE', label: 'Sergipe' },
    { code: 'TO', label: 'Tocantins' }
  ]

  public cityServiceWrapper = {
    getFilteredItems: (filteredParams: PoLookupFilteredItemsParams): Observable<any> => {
      // Adiciona o estado atual aos parâmetros
      const enhancedParams = {
        ...filteredParams,
        filterParams: {
          ...filteredParams.filterParams,
          state: this.customerModalData.state || ''
        }
      };
      return this.cityService.getFilteredItems(enhancedParams);
    },
    
    getObjectByValue: (city: string): Observable<any> => {
      return this.cityService.getObjectByValue(this.customerModalData.state+city);
    }
  };

  public customerModalFields: Array<PoDynamicFormField> = [
    {
      property: 'cnpj',
      label: 'CNPJ',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 18,
      gridColumns: 3,
      type: 'string',
      mask: '99.999.999/9999-99',
    },
    {
      property: 'name',
      label: 'Razão Social',
      visible: true,
      required: true,
      showRequired: false,
      disabled: true,
      noAutocomplete: true,
      maxLength: 60,
      gridColumns: 5,
      type: 'string',
    },
    {
      property: 'fantasyName',
      label: 'Nome Fantasia',
      visible: true,
      required: true,
      showRequired: false,
      disabled: true,
      noAutocomplete: true,
      maxLength: 35,
      gridColumns: 4,
      type: 'string',
    },
    {
      property: 'hasIe',
      label: 'Contribuinte ICMS?',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      gridColumns: 2,
      booleanTrue: 'Sim',
      booleanFalse: 'Não',
      type: 'boolean',
    },
    {
      property: 'ie',
      label: 'Inscrição Estadual',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 18,
      gridColumns: 3,
      type: 'string',
    },
    {
      property: 'simplesNacional',
      label: 'Simples Nacional?',
      visible: false,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      gridColumns: 2,
      booleanTrue: 'Sim',
      booleanFalse: 'Não',
      type: 'boolean',
    },
    {
      property: 'address',
      label: 'Endereço',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 40,
      gridColumns: 5,
    },
    {
      property: 'state',
      label: 'Estado',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 2,
      gridColumns: 2,
      type: 'string',
      options: this.states,
      fieldValue: 'code',
      fieldLabel: 'code',
    },
    {
      property: 'city',
      label: 'Cidade',
      visible: true,
      required: true,
      showRequired: false,
      disabled: true,
      noAutocomplete: true,
      maxLength: 60,
      gridColumns: 3,
      type: 'string',
        searchService: this.cityServiceWrapper,
        columns: [
          { property: 'codigo', label: 'Código IBGE' },
          { property: 'cidade', label: 'Cidade' },
          { property: 'estado', label: 'Estado' },
        ],
        format: ['cidade'],
        fieldLabel: 'cidade',
        fieldValue: 'codigo',
    },
    {
      property: 'neighborhood',
      label: 'Bairro',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 30,
      gridColumns: 3,
      type: 'string',
    },
    {
      property: 'zipCode',
      label: 'CEP',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 9,
      gridColumns: 2,
      type: 'string',
      mask: '99999-999',
    },
    {
      property: 'complement',
      label: 'Complemento',
      visible: true,
      required: false,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 50,
      gridColumns: 4,
      type: 'string',
    },
    {
      property: 'ddd',
      label: 'DDD',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 2,
      gridColumns: 1,
      type: 'string',
    },
    {
      property: 'phone',
      label: 'Telefone',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 9,
      gridColumns: 2,
      type: 'string',
    },
    {
      property: 'email',
      label: 'E-mail',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 100,
      gridColumns: 3,
      type: 'string',
    },
    {
      property: 'category',
      label: 'Categoria',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 2,
      gridColumns: 3,
      options: [
        { code: 'DT', label: 'Distribuidor'               },
        { code: 'AT', label: 'Atacado'                    },
        { code: 'VR', label: 'Varejo'                     },
        { code: 'AJ', label: 'Atacarejo'                  },
        { code: 'CB', label: 'Cesta Básica'               },
        { code: 'FS', label: 'Food Service'               },
        { code: 'IA', label: 'Indústria de Alimentos'     },
        { code: 'IT', label: 'Indústria Têxtil'           },
        { code: 'IL', label: 'Indústria de Limpeza'       },
        { code: 'IG', label: 'Indústria Geral'            },
        { code: 'IR', label: 'Indústria de Ração Animal'  },
        { code: 'CH', label: 'Charqueadas'                },
        { code: 'PC', label: 'Pecuaristas e Avicultores'  },
        { code: 'TA', label: 'Tratamento de Água'         },
      ],
      type: 'string',
      fieldValue: 'code',
      fieldLabel: 'label',
    },
    {
      property: 'type',
      label: 'Tipo',
      visible: true,
      required: true,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 1,
      gridColumns: 3,
      options: [
        { code: 'F', label: 'Consumidor Final'  },
        { code: 'L', label: 'Produtor Rural'    },
        { code: 'R', label: 'Revendedor'        },
        { code: 'S', label: 'Solidário'         },
      ],
      type: 'string',
      fieldValue: 'code',
      fieldLabel: 'label',
    },
    {
      property: 'observation',
      label: 'Observação',
      visible: true,
      required: false,
      showRequired: false,
      disabled: false,
      noAutocomplete: true,
      maxLength: 100,
      gridColumns: 12,
      type: 'string',
    }
  ];

  public readonly confirmCustomer: PoModalAction = {
    action: () => { this.sendCustomer(this.customerModalData); },
    label: 'Confirmar',
    loading: false,
  }
  
  public readonly cancelCustomer: PoModalAction = {
    action: () => { this.closeCustomerModal(); },
    label: 'Cancelar',
    disabled: false,
    loading: false,
  }


  public async ngOnInit(): Promise<void> {
    this.isHideLoading = false;
    this.customerModalValidateFields = this.customerModalFields.map(field => field.property)
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
      {property: 'branchName',      label: 'Filial'   },
      {property: 'loadingLocation', label: 'Unidade Carreg.' },
      {property: 'budget',          label: 'Orçamento'},
      {
        property: 'budgetStatus',
        label: 'Situação Orçamento',
        type: 'label',
        labels: [
          { value: 'CP',  type: PoTagType.Warning,    label: 'Cotação pendente',        icon: true  },
          { value: 'CR',  type: PoTagType.Neutral,    label: 'Cotação rejeitada',       icon: false },
          { value: 'PP',  type: PoTagType.Warning,    label: 'Pré pedido pendente',     icon: true  },
          { value: 'PE',  type: PoTagType.Info,       label: 'Pré pedido em aprovação', icon: true  },
          { value: 'PR',  type: PoTagType.Danger,     label: 'Pré pedido rejeitado',    icon: true  },
          { value: 'PA',  type: PoTagType.Success,    label: 'Pré pedido aprovado',     icon: true  },
          { value: 'EX',  type: PoTagType.Neutral,    label: 'Orçamento expirado',      icon: true  },
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
        ]
      },
      { property: 'customer',       label: 'Cliente'  },
      { property: 'inclusionDate',  label: 'Data Inclusão', type: 'date'  },
      { property: 'expirationDate', label: 'Data Validade', type: 'date'  },
    ]
  }

  public async getItems(filter?: string): Promise<Array<any>> {
    const params: string = '?sellerId='+this.sellerId+'&page=1';
    const body: any = {filtro: filter ?? ''};
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/orcamentos' + params,body));
      return res.objects.map((item: any) => ({
        branchId:             item.filial,
        branchName:           this.getBranchByCode(item.filial),
        loadingLocationId:    item.unidadeCarregamento,
        loadingLocation:      this.getLoagingLocationByCode(item.unidadeCarregamento),
        budgetStatus:         item.situacao,
        orderStatus:          item.pedido ? item.situacaoPedido : '',
        budget:               item.orcamento,
        order:                item.pedido,
        customer:             item.nomeCliente,
        totalValue:           item.valorTotal,
        inclusionDate:        this.dateFormat(item.dataEmissao),
        expirationDate:       this.dateFormat(item.dataVencimento),
      }));
    } catch (e: any) {
      this.poNotification.error('Falha ao buscar os orçamentos: ' + e.message);
      return [];
    }
  }

  public cleanBrowse() {
    this.filteredItems = [];
  }

  private getBranchByCode(branchId: string): string{
    const branch = this.fieldsService.getBranches.find(branch => branch.id === branchId);
    return branch ? branch.name : branchId;
  }

  private getLoagingLocationByCode(locationId: string): string {
    const location = this.fieldsService.getLoadingLocations.find(location => location.id === locationId);
    return location ? location.name : locationId;
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

  private isModifiable(item: any): boolean {
    return item.budgetStatus !== 'PA';
  }

  private isExpired(item: any): boolean {
    return item.budgetStatus === 'EX';
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
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'view', branch: item.branchId, budget: item.budget } })
  }
  
  public copyBudget(item: any) {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'copy', branch: item.branchId, budget: item.budget } })
  }
  
  public modifyBudget(item: any) {
    this.router.navigate(['/','orcamentos','formulario'], { queryParams: { mode: 'modify', branch: item.branchId, budget: item.budget } })
  }
  
  public async approveQuotation(item: any): Promise<void> {
    this.isHideLoading = false;
    const branchId = item.branchId;
    const budget = item.budget;
    const body = { filial: branchId, orcamento: budget }
    try {
      const res: any = await firstValueFrom(this.api.put('portal-do-representante/orcamentos/cotacao/aprovar', body, branchId));
      if (res.success) {
        this.poNotification.success('Cotação aprovada com sucesso!');
        this.items = await this.getItems();
        this.filteredItems = [...this.items];
        await this.updateBlockFilters();
      } else {
        this.poNotification.error('Falha ao aprovar a cotação: ' + res.message);
      }
    } catch (e: any) {
      this.poNotification.error('Falha ao aprovar a cotação: ' + e.message);
    }
    this.isHideLoading = true;
  }

  public async rejectQuotation(item: any): Promise<void> {
    this.isHideLoading = false;
    const branchId = item.branchId;
    const budget = item.budget;
    const body = { filial: branchId, orcamento: budget }
    try {
      const res: any = await firstValueFrom(this.api.put('portal-do-representante/orcamentos/cotacao/rejeitar', body, branchId));
      if (res.success) {
        this.poNotification.success('Cotação rejeitada com sucesso!');
        this.items = await this.getItems();
        this.filteredItems = [...this.items];
        await this.updateBlockFilters();
      } else {
        this.poNotification.error('Falha ao rejeitar a cotação: ' + res.message);
      }
    }
    catch (e: any) {
      this.poNotification.error('Falha ao rejeitar a cotação: ' + e.message);
    }
    this.isHideLoading = true;
  }

  public async sendToApproval(item: any): Promise<void> {
    this.isHideLoading = false;
    const branchId = item.branchId;
    const budget = item.budget;
    const body = { filial: branchId, orcamento: budget }
    try {
      const res: any = await firstValueFrom(this.api.put('portal-do-representante/orcamentos/pre-pedido/aprovar', body, branchId));
      if (res.success) {
        this.poNotification.success('Pré pedido enviado para aprovação com sucesso!');
        this.items = await this.getItems();
        this.filteredItems = [...this.items];
        await this.updateBlockFilters();
      } else {
        this.poNotification.error('Falha ao enviar o pré pedido para aprovação: ' + res.message);
      }
    } catch (e: any) {
      this.poNotification.error('Falha ao enviar o pré pedido para aprovação: ' + e.message);
    }
    this.isHideLoading = true;
  }

  public onChangeCustomerFields(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    if (changedValue.property === 'cnpj') {
      !!this.customerModalData.cnpj ? this.fillCustomerData() : null;
      return {
        fields: [
          { property: 'city', disabled: !this.customerModalData.cnpj },
        ]
      }
    }
    if (changedValue.property === 'hasIe') {
      const ieField = this.customerModalFields.find(field => field.property === 'ie');
      if (ieField) {
        ieField.required = !!this.customerModalData.hasIe;
      }
      this.customerModalFields
      return {
        fields: [
          { property: 'ie', required: this.customerModalData.hasIe, disabled: !this.customerModalData.hasIe },
        ],
        value: {
          ie: this.customerModalData.hasIe ? this.customerModalData.ie : '',
        }
      }
    }
    return {};
  }
  
  public async sendCustomer(customerData: any): Promise<void> {
    if (!this.validateCustomerForm()) {
      return;
    }
    this.confirmCustomer.loading = true;
    this.isHideLoading = false;
    const res: any = await this.customerService.createCustomer(customerData);
    if (res.success) {
      this.poNotification.success('Cliente cadastrado com sucesso. Código: ' + res.codigo);
      this.closeCustomerModal();
      this.customerModalData = {};
    } else {
      this.poNotification.error('Falha ao cadastrar cliente: ' + res.fix);
    }
    this.confirmCustomer.loading = false;
    this.isHideLoading = true;
  }

  private async fillCustomerData(): Promise<void> {
    this.confirmCustomer.loading = true;
    const cnpj = this.customerModalData.cnpj;
    const res: any = await this.customerService.getCustomerPublicData(cnpj);
    if (!res.success) {
      this.poNotification.error('Falha ao buscar dados do cliente: ' + res.message);
      this.customerModalData.cnpj = '';
      this.confirmCustomer.loading = false;
      return;
    }
    if (res.jaCadastrado) {
      this.poNotification.warning('CNPJ já cadastrado na base de dados. Não será possível realizar um novo cadastro.');
      this.customerModalData.cnpj = '';
      this.confirmCustomer.loading = false;
      return;
    }
    this.customerModalData = {
      ...this.customerModalData,
      name:             res.razaoSocial,
      fantasyName:      res.nomeFantasia,
      address:          res.endereco,
      state:            res.uf,
      city:             res.municipio,
      neighborhood:     res.bairro,
      zipCode:          res.cep,
      complement:       res.complemento,
      ddd:              res.ddd,
      phone:            res.telefone,
      email:            res.email,
      simplesNacional:  res.simplesNacional,
    }
    this.confirmCustomer.loading = false;
    return;
  }

  private validateCustomerForm(): boolean {
  const requiredFields = this.customerModalFields.filter(field => field.required === true);
  const emptyFields = requiredFields
    .filter(field => {
      const value = this.customerModalData[field.property];
      return (!value || (typeof value === 'string' && value.trim() === '')) && typeof value !== 'boolean';
    })
    .map(field => field.label);
  if (emptyFields.length > 0) {
    const fieldsText = emptyFields.join(', ');
    this.poNotification.warning(
      `Os seguintes campos obrigatórios devem ser preenchidos: ${fieldsText}`
    );
    return false;
  }
  return true;
}

  private openCustomerModal() {
    this.modal.open()
  }

  private closeCustomerModal() {
    this.modal.close()
  }

}
