import { Component, ViewChild } from '@angular/core';
import { PoTabsModule, PoPageModule, PoDynamicModule, PoGridModule, PoContainerModule, PoDynamicFormField, PoTableModule, PoTableAction, PoModalModule, PoButtonModule, PoModalComponent, PoModalAction, PoDynamicFormComponent, PoNotificationService, PoDynamicFormValidation, PoLoadingModule, PoDynamicFormFieldChanged } from '@po-ui/ng-components';
import { PoPageDynamicEditModule } from '@po-ui/ng-templates';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-formulario',
  imports: [
    PoTabsModule,
    PoPageModule,
    PoTableModule,
    PoModalModule,
    PoButtonModule,
    PoPageDynamicEditModule,
    PoDynamicModule,
    PoGridModule,
    PoContainerModule,
    PoLoadingModule,
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  
  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private poNotification: PoNotificationService) {}

  @ViewChild(PoModalComponent, { static: true }) 'modal': PoModalComponent;
  @ViewChild(PoDynamicFormComponent, { static: true }) 'dynamicForm': PoDynamicFormComponent;

  public headerData: any  = {};
  public rowData: any = {};
  public mode: string = 'view';
  public location: string = ''
  public budgetId: string = ''
  public isHideLoading: boolean = true;
  public formTitle: string = 'Orçamentos'
  public validateFieldsHeader: Array<string> = ['loadingLocation','freightType'];
  public validateFieldsRow: Array<string> = ['productId','comissionPercentage','unitPrice','amount'];
  public fields: Array<PoDynamicFormField> = [];
  public generalDataFields: Array<PoDynamicFormField> = [];
  public logisticsDataFields: Array<PoDynamicFormField> = [];
  public columns: Array<any> = [];
  public rowFormTitle: string = 'Item - Adicionar';

  private currentRowProduct: string = ''


  public rows: Array<any> = [
    {
      item: '01',
      amount: 1,
      unitPrice: 0,
      totalPrice: 0,
      comissionUnitValue: 0,
      comissionTotalValue: 0,
    },
  ];

  public readonly confirmRow: PoModalAction = {
    action: () => { this.saveRow(this.rowData); },
    label: 'Confirmar',
    disabled: false,
    loading: false,
  }
  
  public readonly cancelRow: PoModalAction = {
    action: () => { this.closeRow(); },
    label: 'Cancelar',
    disabled: false,
    loading: false,
  }

  public gridRowActions: Array<PoTableAction> = [];

  public async ngOnInit() {
    this.isHideLoading = false;

    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || '';
      this.budgetId = params['budget'] || '';
      this.location = params['location'] || '';
    });

    this.formTitle += ' - ' + this.getModeDescription(this.mode)

    this.fields = [
      {
        property: 'loadingLocation',
        label: 'Unidade Carreg.',
        visible: true,
        required: true,
        showRequired: true,
        readonly: !this.isAddMode(),
        gridColumns: 3,
        options: [
          { loadingLocation: 'Rio Grande do Norte', code: "01010001" },
          { loadingLocation: 'Rio Grande do Norte', code: "01010001" },
          { loadingLocation: 'São Paulo',           code: "01030010" },
          { loadingLocation: 'Rio de Janeiro',      code: "01020009" },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'loadingLocation',
        order: 1,
      },
      {
        property: 'budgetId',
        label: 'Orçamento',
        visible: true,
        required: false,
        showRequired: false,
        readonly: true,
        gridColumns: 2,
        type: 'string',
        order: 1,
      },
      {
        property: 'budgetStatus',
        label: 'Sit. Orçamento',
        visible: true,
        required: false,
        showRequired: false,
        readonly: true,
        gridColumns: 3,
        options: [
          { budgetStatus: 'Cotação pendente',     code: "CP" },
          { budgetStatus: 'Cotação rejeitada',    code: "CR" },
          { budgetStatus: 'Pré Pedido pendente',  code: "PP" },
          { budgetStatus: 'Pré Pedido cancelado', code: "PC" },
          { budgetStatus: 'Pré Pedido rejeitado', code: "PR" },
          { budgetStatus: 'Pré Pedido aprovado',  code: "PA" },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'budgetStatus',
        order: 1,
      },
      {
        property: 'customerId',
        label: 'Cliente',
        visible: true,
        required: true,
        showRequired: true,
        disabled: true,
        minLength: 3,
        maxLength: 6,
        gridColumns: 4,
        type: 'string',
        searchService: 'https://192.168.100.249:8500/portal-do-representante/clientes',
        columns: [
          { property: 'cliente', label: 'Código' },
          { property: 'cgc', label: 'CNPJ' },
          { property: 'tipo', label: 'Tipo' },
          { property: 'razaoSocial', label: 'Nome' },
        ],
        format: ['cgc', 'razaoSocial'],
        fieldLabel: 'razaoSocial',
        fieldValue: 'codigoLoja',
        order: 1,
      },
      {
        property: 'paymentTerms',
        label: 'Cond. Pag.',
        visible: true,
        required: true,
        showRequired: true,
        disabled: this.isViewMode() || this.isAddMode(),
        minLength: 3,
        maxLength: 40,
        gridColumns: 3,
        type: 'string',
        searchService: 'https://192.168.100.249:8500/portal-do-representante/condicoes',
        columns: [
          { property: 'codigo', label: 'Código' },
          { property: 'descricao', label: 'Descrição' },
        ],
        format: ['codigo', 'descricao'],
        fieldLabel: 'descricao',
        fieldValue: 'codigo',
        order: 1,
      },
      {
        property: 'observation',
        label: 'Observação',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        maxLength: 120,
        gridColumns: 9,
        type: 'string',
        rows: 1,
        order: 1,
      },
      {
        property: 'freightType',
        label: 'Tipo Frete',
        visible: true,
        required: true,
        showRequired: true,
        readonly: this.isViewMode(),
        maxLength: 3,
        gridColumns: 3,
        options: [
          { freightType: 'CIF', code: 'C' },
          { freightType: 'CIF', code: 'C' },
          { freightType: 'FOB', code: 'F' },
          { freightType: 'FOB', code: 'F' },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'freightType',
        order: 2,
      },
      {
        property: 'freightPaymentTerms',
        label: 'Cond. Pag. Frete',
        visible: true,
        required: false,
        showRequired: false,
        disabled: this.isViewMode() || this.isAddMode(),
        minLength: 3,
        maxLength: 40,
        gridColumns: 3,
        type: 'string',
        searchService: 'https://192.168.100.249:8500/portal-do-representante/condicoes',
        columns: [
          { property: 'codigo', label: 'Código' },
          { property: 'descricao', label: 'Descrição' },
        ],
        format: ['codigo', 'descricao'],
        fieldLabel: 'descricao',
        fieldValue: 'codigo',
        order: 2,
      },
      {
        property: 'freightCost',
        label: 'Valor Frete',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'currency',
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
        order: 2
      },
      {
        property: 'cargoType',
        label: 'Tipo Carga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        minLength: 3,
        maxLength: 40,
        gridColumns: 4,
        options: [
          { cargoType: 'Batida'                             , code: '1' },
          { cargoType: 'Batida'                             , code: '1' },
          { cargoType: 'Paletizada COM Devolucao do Palete' , code: '2' },
          { cargoType: 'Paletizada SEM Devolucao do Palete' , code: '3' },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'cargoType',
        order: 2,
      },
      {
        property: 'unloadingType',
        label: 'Tipo Descarga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        minLength: 3,
        maxLength: 40,
        gridColumns: 3,
        options: [
          { cargoType: 'Por conta do cliente'                 , code: '1' },
          { cargoType: 'Por conta do cliente'                 , code: '1' },
          { cargoType: 'Por conta do motorista (leva chapa)'  , code: '2' },
          { cargoType: 'Por conta do motorista (paga taxa)'   , code: '3' },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'cargoType',
        order: 2,
      },
      {
        property: 'unloadingCost',
        label: 'Valor Descarga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'currency',
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
        order: 2
      },
    ]

    this.columns = [
      {
        property: 'item',
        label: 'Item',
        type: 'string',
        required: true,
        showRequired: false,
        readonly: this.isViewMode(),
        minLength: 2,
        maxLength: 4,
        gridColumns: 1,
      },
      {
        property: 'productId',
        label: 'Cód. Produto',
        type: 'string',
        required: true,
        showRequired: false,
        disabled: this.isViewMode(),
        maxLength: 20,
        searchService: 'https://192.168.100.249:8500/portal-do-representante/produtos',
        columns: [
          { property: 'codigo', label: 'Código' },
          { property: 'descricao', label: 'Descrição' },
        ],
        format: ['codigo'],
        fieldValue: 'codigo',
        gridColumns: 2,
      },
      {
        property: 'productDescription',
        label: 'Desc. Produto',
        type: 'string',
        required: false,
        showRequired: false,
        readonly: true,
        maxLength: 60,
        gridColumns: 6,
      },
      {
        property: 'amount',
        label: 'Quantidade',
        type: 'number',
        required: true,
        showRequired: false,
        readonly: this.isViewMode(),
        maxLength: 10,
        gridColumns: 2,
        format: '1.2-2',
      },
      {
        property: 'packagingType',
        label: 'Embalagem',
        type: 'string',
        required: false,
        showRequired: false,
        readonly: true,
        maxLength: 20,
        gridColumns: 2,
      },
      {
        property: 'unitPrice',
        label: 'Valor Unit.',
        type: 'currency',
        required: false,
        showRequired: false,
        //readonly: true,
        readonly: this.isViewMode(),
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'totalPrice',
        label: 'Valor Total',
        type: 'currency',
        required: false,
        showRequired: false,
        readonly: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'comissionPercentage',
        label: 'Comissão (%)',
        type: 'number',
        required: true,
        showRequired: false,
        readonly: this.isViewMode(),
        maxLength: 3,
        gridColumns: 2,
      },
      {
        property: 'comissionUnitValue',
        label: 'Vl. Unit. Comissão',
        type: 'currency',
        required: false,
        showRequired: false,
        readonly: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'comissionTotalValue',
        label: 'Vl. Total Comissão',
        type: 'currency',
        required: false,
        showRequired: false,
        readonly: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
    ]
    
    this.generalDataFields = this.getFields(1);
    this.logisticsDataFields = this.getFields(2);

    this.gridRowActions = [
      { action: this.onModifyRow.bind(this),       icon: 'an an-note-pencil',   label: 'Alterar linha',     disabled: this.isViewMode() },
      { action: this.onAddRow.bind(this),          icon: 'an an-plus',          label: 'Adicionar linha',   disabled: this.isViewMode() },
    ];
        
    if (this.mode != 'add' && this.location && this.budgetId) {
      const res = await this.loadFormFields(this.location,this.budgetId);

      if (res) {
        this.headerData = {
          loadingLocation:      res.filial,
          budgetId:             res.orcamento,
          budgetStatus:         res.situacao,
          customerId:           res.cliente+res.loja,
          paymentTerms:         res.condPag,
          observation:          res.observacao.trim(),
          freightType:          res.tipoFrete,
          freightPaymentTerms:  res.condPagFrete,
          freightCost:          res.valorFrete,
          cargoType:            res.tipoCarga,
          unloadingType:        res.tipoDescarga,
          unloadingCost:        res.valorDescarga,
        };

        this.rows = res.itens.map((item: any) => ({
          item:                 item.item,
          productId:            item.produto.trim(),
          productDescription:   item.descProduto.trim(),
          amount:               item.quantidade,
          packagingType:        item.embalagem,
          unitPrice:            item.valorUnitario,
          totalPrice:           item.valorTotal,
          comissionPercentage:  item.comissao,
          comissionUnitValue:   item.valorUnitario * item.comissao / 100,
          comissionTotalValue:  item.valorTotal * item.comissao / 100,
        }));
      }
    }

    this.isHideLoading = true;

  }

  public getFields(order: number): Array<PoDynamicFormField> {
    return this.fields.filter(field => field.order == order);
  }

  public fillRowData(row: any): void {
    Object.entries(row).forEach(([key, value]) => this.rowData[key] = value);
    this.rowData.operation = 'MOD';
  }

  public fillRowNextItem(row: any): void {
    const item = this.rows[this.rows.length-1].item;
    const newItem = parseInt(item, 10)+1;
    this.rowData.item = newItem.toString().padStart(item.length, '0');
    this.rowData.amount = 1;
    this.rowData.unitPrice = 0;
    this.rowData.totalPrice = 0;
    this.rowData.comissionUnitValue = 0;
    this.rowData.comissionTotalValue = 0;
    this.rowData.operation = 'ADD';
  }

  public eraseRowData(): void {
    this.rowData = {};
  }

  public async onSaveForm() {
    if (this.validateHeaderData()) {
      this.isHideLoading = false;
      const res = await this.sendForm(this.isAddMode());
      if (res) {
        if (res.success) {
          this.poNotification.success(res.message);
          this.router.navigate(['/','orcamentos']);
        } else {
          this.poNotification.error(res.message + ': ' + res.fix);
        }
      }
      this.isHideLoading = true;
    }
  }

  public async sendForm(isAddMode: boolean): Promise<any> {
    const body = {
      "filial":         this.headerData.loadingLocation           ?? "",
      "orcamento":      this.headerData.budgetId                  ?? "",
      "cliente":        this.headerData.customerId.substring(0,6) ?? "",
      "lojaCliente":    this.headerData.customerId.slice(-2)      ?? "",
      "condPag":        this.headerData.paymentTerms              ?? "",
      "observacao":     this.headerData.observation               ?? "",
      "vendedor":       localStorage.getItem('sellerId')          ?? "",
      "situacao":       this.headerData.budgetStatus              ?? "",
      "condPagFrete":   this.headerData.freightPaymentTerms       ?? "",
      "valorFrete":     this.headerData.freightCost               ?? 0,
      "tipoCarga":      this.headerData.cargoType                 ?? "",
      "tipoDescarga":   this.headerData.unloadingType             ?? "",
      "valorDescarga":  this.headerData.unloadingCost             ?? 0,
      "tipoFrete":      this.headerData.freightType               ?? "",
      "itens":          this.rows.map((item: any) => ({
        "item":           item.item                 ?? "",
        "produto":        item.productId            ?? "",
        "quantidade":     item.amount               ?? 0,
        "precoUnitario":  item.unitPrice            ?? 0,
        "comissao":       item.comissionPercentage  ?? 0
      }))
    };
    try {
      if (isAddMode) {
        const res = await firstValueFrom( this.api.post('portal-do-representante/orcamentos/incluir/', body));
        return res;
      } else {
        const res = await firstValueFrom( this.api.put('portal-do-representante/orcamentos/alterar/', body));
        return res;
      }
    } catch (error) {
      this.poNotification.error('Erro ao buscar orçamento: ' + error);
      return null;
    }
  }

  public validateHeaderData(): boolean {
    const requiredFields: Array<PoDynamicFormField> = this.getRequiredFields();
    const missingFields = requiredFields.filter(field => {
      const value = this.headerData[field.property];
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map(f => f.label).join(', ');
      this.poNotification.warning('Preencha os campos obrigatórios: ' + missingFieldLabels);
      return false;
    }

    return true;

  }

  public getRequiredFields(): Array<PoDynamicFormField> {
      return this.fields.filter(field => field.required == true);
  }

  public onCancelForm() {
    this.router.navigate(['/','orcamentos'])
  }

  public onModifyRow(row: any) {
    if (this.validateHeaderData()) {
      this.eraseRowData();
      this.fillRowData(row)
      this.currentRowProduct = this.rowData.productId
      this.rowFormTitle = 'Item - Alterar'
      this.modal.open()
    }
  }

  public onAddRow(row: any) {
    if (this.validateHeaderData()) {
      this.eraseRowData();
      this.fillRowNextItem(row)
      this.currentRowProduct = this.rowData.productId
      this.rowFormTitle = 'Item - Adicionar'
      this.modal.open()
    }
  }

  public saveRow(row: any) {
    if (row.operation === 'ADD') {
      this.rows = [...this.rows, row]
    } else if (row.operation === 'MOD') {
      this.rows = this.rows.map(existingRow => {
        return existingRow.item === row.item ? { ...row } : existingRow;
      });
    }
    this.modal.close()
  }

  public closeRow() {
    this.modal.close()
  }

  public onChangeFieldsHeader(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    
    if (changedValue.property === 'loadingLocation') {
      const newBudgetStatus = changedValue.value.loadingLocation === '01010001' ? 'CP' : 'PP';
      return {
        value: { budgetStatus: newBudgetStatus},
        fields: [
          { property: 'loadingLocation',  readonly: true },
          { property: 'customerId',       disabled: false },
          { property: 'paymentTerms',     disabled: false },
          { property: 'observation',      readonly: false },
        ],
      }
    } else if (changedValue.property === 'freightType') {
      return {
        fields: [
          { property: 'freightPaymentTerms',  disabled: false },
          { property: 'cargoType',            readonly: false },
          { property: 'unloadingType',        readonly: false },
          { property: 'freightCost',          readonly: false },
          { property: 'unloadingCost',        readonly: false },
        ]
      }
    } else {
      return {}
    }
    return {}
  };

  public onChangeFieldsRow(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    
    if (changedValue.property === 'productId') {
      if (!this.currentRowProduct) {
        this.fillProductData(changedValue.value.productId)
        return {}
      } else {
        return {
          value: { productId: this.currentRowProduct },
        }
      }
    } else if (changedValue.property === 'comissionPercentage' || changedValue.property === 'unitPrice' || changedValue.property === 'amount') {
      return {
        value: {
          totalPrice:           this.rowData.unitPrice*this.rowData.amount,
          comissionUnitValue:   this.rowData.unitPrice*(this.rowData.comissionPercentage/100),
          comissionTotalValue:  this.rowData.unitPrice*this.rowData.amount*(this.rowData.comissionPercentage/100),
        }
      }
    } else {
      return {}
    }
  };

  private async loadFormFields(location: string, budgetId: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.api.get('portal-do-representante/orcamentos/dados?loadingLocation='+location+'&budget='+budgetId));
      return res; // Retorna os dados completos do orçamento
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      return null;
    }
  }

  private async fillProductData(codigoProduto: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/produtos/'+codigoProduto));
      if (res) {
        this.rowData.productDescription = res.descricao;
        this.rowData.packagingType = res.unidade;
      }
      return res
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      return null;
    }
  }
  
  private getModeDescription(mode: string): string {
    if (mode == 'add') {
      return 'Incluir'
    } else if (mode == 'modify') {
      return 'Alterar'
    } else if (mode == 'copy') {
      return 'Copiar'
    } else {
      return 'Visualizar'
    }
  }

  private isViewMode(): boolean {
    if (this.mode == 'view') {
      return true
    } else {
      return false
    }
  }

  private isAddMode(): boolean {
    if (this.mode == 'add') {
      return true
    } else {
      return false
    }
  }

  public isLoadingLocationEmpty(): boolean {
    return !this.headerData.loadingLocation
  }

}
