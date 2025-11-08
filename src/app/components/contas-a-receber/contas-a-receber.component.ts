import { Component } from '@angular/core';
import { PoTableColumn, PoTableModule, PoTagType, PoLoadingModule } from '@po-ui/ng-components';
import { PoPageDynamicSearchModule, PoPageDynamicSearchFilters } from '@po-ui/ng-templates';
import { ApiService } from '../../services/api.service';
import { FieldsService } from '../../services/fields.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contas-a-receber',
  imports: [
    PoPageDynamicSearchModule,
    PoTableModule,
    PoLoadingModule,
  ],
  templateUrl: './contas-a-receber.component.html',
  styleUrl: './contas-a-receber.component.css'
})
export class ContasAReceberComponent {

  constructor(private api: ApiService, private fieldsService: FieldsService) { }

  public itemsServiceURL = this.api.baseUrl + '/portal-do-representante/contasareceber';
  public isHideLoading = true;
  public isShowMoreLoading = false;
  public isShowMoreDisabled = false;
  public items: Array<any> = [];
  public filteredItems: Array<any> = [];
  public get tableHeight(): number {
    return Object.keys(this.activeDisclaimers).length > 0 ? 480 : 570;
  }
  
  private pageSize = 1000;
  private page = 1;
  private activeDisclaimers: any = {};

  public columns: Array<PoTableColumn> = [
    { property: 'status',
      label: 'Status',
      type: 'label',
      width: '200px',
      fixed: true,
      labels: [
        { value: 'PE',  label: 'Pendente',            type: PoTagType.Warning,  icon: true  },
        { value: 'PP',  label: 'Pago Parcialmente',   type: PoTagType.Info,     icon: true  },
        { value: 'PG',  label: 'Pago',                type: PoTagType.Success,  icon: true  },
        { value: 'AT',  label: 'Atrasado',            type: PoTagType.Danger,   icon: true  },
      ],
    },
    { property: 'branch',         label: 'Filial',        type: 'string',   width: '150px'  },
    { property: 'budgetId',       label: 'Orçamento',     type: 'string',   width: '150px'  },
    { property: 'orderId',        label: 'Pedido',        type: 'string',   width: '120px'  },
    { property: 'sellerId',       label: 'Vendedor',      type: 'string',   width: '150px'  },
    { property: 'sellerName',     label: 'Nome Vendedor', type: 'string',   width: '250px'  },
    { property: 'clientId',       label: 'Cliente',       type: 'string',   width: '200px'  },
    { property: 'clientName',     label: 'Nome',          type: 'string',   width: '250px'  },
    { property: 'prefix',         label: 'Prefixo',       type: 'string',   width: '120px'  },
    { property: 'document',       label: 'Documento',     type: 'string',   width: '150px'  },
    { property: 'installment',    label: 'Parcela',       type: 'string',   width: '120px'  },
    { property: 'issueDate',      label: 'Emissão',       type: 'date',     width: '150px'  },
    { property: 'dueDate',        label: 'Vencimento',    type: 'date',     width: '150px'  },
    { property: 'paymentDate',    label: 'Data Pagto',    type: 'date',     width: '150px'  },
    { property: 'value',          label: 'Valor',         type: 'currency', width: '200px'  },
    { property: 'paidValue',      label: 'Valor Pago',    type: 'currency', width: '200px'  },
    { property: 'balance',        label: 'Saldo',         type: 'currency', width: '200px'  },
    { property: 'daysOverdue',    label: 'Dias Atraso',   type: 'number',   width: '150px'  },
  ];

  public filterFields: Array<PoPageDynamicSearchFilters> = [
    { property: 'status',
      label: 'Status',
      type: 'string',
      gridColumns: 6,
      options: this.columns[0].labels,
      optionsMulti: true,
      hideSearch: true,
      hideSelectAll: true,
    },
    {
      property: 'branch',
      label: 'Filial',
      type: 'string',
      gridColumns: 6,
      options: this.fieldsService.getBranches,
      optionsMulti: true,
      fieldValue: 'id',
      fieldLabel: 'name',
      hideSearch: true,
      hideSelectAll: true,
    },
    { property: 'budgetId', label: 'Orçamento', type: 'string', gridColumns: 3, maxLength: 6  },
    { property: 'orderId',  label: 'Pedido',    type: 'string', gridColumns: 3, maxLength: 6  },
    {
      property: 'sellerId',
      label: 'Vendedor',
      type: 'string',
      gridColumns: 6,
      visible: this.fieldsService.isInternalUser,
      searchService: this.api.baseUrl + '/portal-do-representante/vendedores',
      columns: [
        { property: 'codigo',   label: 'Código'   },
        { property: 'nome',     label: 'Nome'     },
        { property: 'cgc',      label: 'CPF/CNPJ' },
        { property: 'tipo',     label: 'Tipo'     },
      ],
      multiple: true,
      fieldLabel: 'nome',
      fieldValue: 'codigo',
    },
    { property: 'clientId',
      label: 'Cliente',
      type: 'string',
      gridColumns: 9,
      searchService: this.api.baseUrl + '/portal-do-representante/clientes',
      columns: [
        { property: 'codigoLoja', label: 'Código' },
        { property: 'cgc', label: 'CNPJ' },
        { property: 'tipo', label: 'Tipo' },
        { property: 'razaoSocial', label: 'Nome' },
      ],
      format: ['razaoSocial'],
      fieldLabel: 'razaoSocial',
      fieldValue: 'codigoLoja',
      multiple: true,
    },
    { property: 'document', label: 'Documento', type: 'string', gridColumns: 3, maxLength: 9  },
    {
      property: 'issueDate',
      label: 'Data de Emissão',
      type: 'date',
      range: true,
      gridColumns: 5,
    },
    {
      property: 'dueDate',
      label: 'Data de Vencimento',
      type: 'date',
      range: true,
      gridColumns: 5,
    },
    { property: 'valueFrom',    label: 'Valor de',  type: 'currency',  gridColumns: 3  },
    { property: 'valueTo',      label: 'Valor até', type: 'currency',  gridColumns: 3  },
    { property: 'balanceFrom',  label: 'Saldo de',  type: 'currency',  gridColumns: 3  },
    { property: 'balanceTo',    label: 'Saldo até', type: 'currency',  gridColumns: 3  },
  ];

  async ngOnInit() {
    this.isHideLoading = false;
    this.items = await this.getItems();
    this.filteredItems = [...this.items];
    this.page++;
    this.isHideLoading = true;
  }

  public async onShowMore(event: any) {
    this.isShowMoreLoading = true;
    const NewItems: Array<any> = await this.getItems();
    this.items = [...this.items, ...NewItems];
    this.onQuickSearch(this.activeDisclaimers.quickSearch ?? '');
    this.page++;
    this.isShowMoreLoading = false;
  }

  private async getItems(): Promise<any> {
    const body: any = this.buildBody();
    const res: any = await firstValueFrom(this.api.post('portal-do-representante/contasareceber', body));
    this.isShowMoreDisabled = !res.hasNext;
    res.items.forEach((item: any) => {
      item.branch = this.fieldsService.getBranchNameById(item.branch);
    });
    return res.items;
  }

  private buildBody(): any {
    let body: any = {
      ...this.activeDisclaimers,
      page:         this.page,
      pageSize:     this.pageSize,
      sellerId:     !this.fieldsService.isInternalUser ? [localStorage.getItem('sellerId')] : this.activeDisclaimers.sellerId,
    };
    return body;
  }

  public async onChangeDisclaimers(disclaimers: any) {
    this.isHideLoading = false;
    this.activeDisclaimers = disclaimers;
    this.page = 1;
    this.items = await this.getItems();
    this.filteredItems = [...this.items];
    this.page++;
    this.isHideLoading = true;
  }

  public onQuickSearch(value: string) {
    this.filteredItems = this.items.filter(item =>
      Object.keys(item).some(key =>
        item[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    if (!value || value === '') {
      delete this.activeDisclaimers.quickSearch;
    } else {
      this.activeDisclaimers.quickSearch = value;
    }
  }

}
