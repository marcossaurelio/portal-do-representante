import { Component, ViewChild } from '@angular/core';
import { PoTabsModule, PoPageModule, PoDynamicModule, PoGridModule, PoContainerModule, PoDynamicFormField, PoTableModule } from '@po-ui/ng-components';
import { PoTableAction, PoModalModule, PoButtonModule, PoModalComponent, PoModalAction, PoDynamicFormComponent } from '@po-ui/ng-components';
import { PoNotificationService, PoDynamicFormValidation, PoLoadingModule, PoDynamicFormFieldChanged, PoInfoModule } from '@po-ui/ng-components';
import { PoInfoOrientation, PoTableComponent, PoDividerModule, PoTagModule, PoTagType } from '@po-ui/ng-components';
import { PoPageDynamicEditModule } from '@po-ui/ng-templates';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom, map } from 'rxjs';

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
    PoInfoModule,
    PoDividerModule,
    PoTagModule,
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  
  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private poNotification: PoNotificationService) {}

  @ViewChild('modal', { static: true }) 'modal': PoModalComponent;
  @ViewChild('modalCopy', { static: true }) 'modalCopy': PoModalComponent;
  @ViewChild('tableCopy', { static: true }) 'tableCopy': PoTableComponent;

  public headerData: any  = {};
  public rows: Array<any> = [];
  public rowData: any = {};
  public copyModalHeaderData: any  = {};
  public mode: string = 'view';
  public location: string = ''
  public budgetId: string = ''
  public isHideLoading: boolean = true;
  public formTitle: string = 'Orçamentos'
  public validateHeaderFields: Array<string> = ['loadingLocation','customerId','budgetId'];
  public validateFreightFields: Array<string> = ['freightType','maxLoad','palletPattern10x1','palletPattern30x1','palletPattern25kg','freightCost','freightResponsible','cargoType','transportationMode'];
  public validateFieldsRow: Array<string> = ['productId','comissionPercentage','unitPrice','amount'];
  public fields: Array<PoDynamicFormField> = [];
  public generalDataFields: Array<PoDynamicFormField> = [];
  public logisticsDataFields: Array<PoDynamicFormField> = [];
  public copyModalFields: Array<PoDynamicFormField> = [];
  public columns: Array<any> = [];
  public rowFormTitle: string = 'Item - Adicionar';
  public infoOrientation: PoInfoOrientation = PoInfoOrientation.Horizontal;
  public rows2Copy: Array<any> = [];
  

  private selectedProductId: string = '';
  private pbrPalletWeight: number = 35;
  private disposablePalletWeight: number = 19;


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

  public readonly confirmCopy: PoModalAction = {
    action: () => { this.saveRows2Copy(); },
    label: 'Confirmar',
    disabled: false,
    loading: false,
  }
  
  public readonly cancelCopy: PoModalAction = {
    action: () => { this.router.navigate(['/','orcamentos']); },
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
        noAutocomplete: true,
        gridColumns: 4,
        options: [
          { loadingLocation: 'Rio Grande do Norte', code: "01010001" },
          { loadingLocation: 'Rio Grande do Norte', code: "01010001" },
          { loadingLocation: 'São Paulo',           code: "01020009" },
          { loadingLocation: 'Rio de Janeiro',      code: "01030010" },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'loadingLocation',
        order: 1,
      },
      {
        property: 'budgetId',
        label: 'Cód. Orçamento',
        visible: true,
        required: false,
        showRequired: false,
        readonly: true,
        noAutocomplete: true,
        gridColumns: 3,
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
        noAutocomplete: true,
        gridColumns: 4,
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
        noAutocomplete: true,
        minLength: 3,
        maxLength: 6,
        gridColumns: 6,
        type: 'string',
        searchService: 'https://192.168.100.249:8500/portal-do-representante/clientes',
        columns: [
          { property: 'codigo', label: 'Código' },
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
        property: 'customerIdDisabled',
        label: 'Cliente',
        visible: false,
        required: true,
        showRequired: true,
        disabled: true,
        noAutocomplete: true,
        minLength: 3,
        maxLength: 6,
        gridColumns: 6,
        type: 'string',
        searchService: 'https://192.168.100.249:8500/portal-do-representante/clientes',
        columns: [
          { property: 'codigo', label: 'Código' },
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
        property: 'customerHasIE',
        label: 'Possui IE?',
        visible: true,
        required: false,
        showRequired: false,
        readonly: true,
        noAutocomplete: true,
        maxLength: 3,
        gridColumns: 2,
        options: [
          { label: 'Sim', code: true  },
          { label: 'Sim', code: true  },
          { label: 'Não', code: false },
          { label: 'Não', code: false },
        ],
        type: 'boolean',
        fieldValue: 'code',
        fieldLabel: 'label',
        order: 1,
      },
      {
        property: 'paymentTerms',
        label: 'Cond. Pag.',
        visible: true,
        required: true,
        showRequired: true,
        disabled: !this.isModifyMode() && !this.isCopyMode(),
        noAutocomplete: true,
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
        readonly: !this.isModifyMode() && !this.isCopyMode(),
        noAutocomplete: true,
        maxLength: 120,
        gridColumns: 11,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
        readonly: true,
        type: 'currency',
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
        order: 2
      },
      {
        property: 'freightResponsible',
        label: 'Vendedor Responsável pelo Frete?',
        visible: true,
        required: false,
        showRequired: false,
        noAutocomplete: true,
        disabled: this.isViewMode() || this.isAddMode(),
        type: 'boolean',
        booleanTrue: 'Sim',
        booleanFalse: 'Não',
        gridColumns: 3,
        order: 2
      },
      {
        property: 'transportationMode',
        label: 'Tipo de Veículo',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        noAutocomplete: true,
        minLength: 1,
        maxLength: 1,
        gridColumns: 2,
        options: [
          { transportationMode: 'Rodoviário' , code: 'R' },
          { transportationMode: 'Rodoviário' , code: 'R' },
          { transportationMode: 'Marítimo'   , code: 'M' },
          { transportationMode: 'Marítimo'   , code: 'M' },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'transportationMode',
        order: 2,
      },
      {
        property: 'maxLoad',
        label: 'Carga Máxima (kg)',
        visible: true,
        required: false,
        showRequired: false,
        noAutocomplete: true,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'number',
        maxLength: 10,
        gridColumns: 2,
        format: '1.0-0',
        order: 2
      },
      {
        property: 'unloadingType',
        label: 'Tipo Descarga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        noAutocomplete: true,
        minLength: 3,
        maxLength: 40,
        gridColumns: 3,
        options: [
          { unloadingType: 'Por conta do cliente'                 , code: '1' },
          { unloadingType: 'Por conta do cliente'                 , code: '1' },
          { unloadingType: 'Por conta do motorista (leva chapa)'  , code: '2' },
          { unloadingType: 'Por conta do motorista (paga taxa)'   , code: '3' },
        ],
        type: 'string',
        fieldValue: 'code',
        fieldLabel: 'unloadingType',
        order: 2,
      },
      {
        property: 'unloadingCost',
        label: 'Valor Descarga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        noAutocomplete: true,
        type: 'currency',
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
        order: 2
      },
      {
        property: 'destinationState',
        label: 'UF Destino',
        visible: true,
        required: false,
        showRequired: false,
        readonly: true,
        noAutocomplete: true,
        maxLength: 2,
        gridColumns: 2,
        type: 'string',
        rows: 1,
        order: 2,
      },
      {
        property: 'cargoType',
        label: 'Tipo Carga',
        visible: true,
        required: false,
        showRequired: false,
        readonly: this.isViewMode() || this.isAddMode(),
        noAutocomplete: true,
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
        property: 'palletPattern10x1',
        label: 'Padrão Palete 10x1',
        visible: true,
        required: false,
        showRequired: false,
        noAutocomplete: true,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'number',
        maxLength: 3,
        gridColumns: 2,
        format: '1.0-0',
        order: 2
      },
      {
        property: 'palletPattern30x1',
        label: 'Padrão Palete 30x1',
        visible: true,
        required: false,
        showRequired: false,
        noAutocomplete: true,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'number',
        maxLength: 3,
        gridColumns: 2,
        format: '1.0-0',
        order: 2
      },
      {
        property: 'palletPattern25kg',
        label: 'Padrão Palete 25kg',
        visible: true,
        required: false,
        showRequired: false,
        noAutocomplete: true,
        readonly: this.isViewMode() || this.isAddMode(),
        type: 'number',
        maxLength: 3,
        gridColumns: 2,
        format: '1.0-0',
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
        readonly: true,
        noAutocomplete: true,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
      },
      {
        property: 'unitPrice',
        label: 'Valor Unit.',
        type: 'currency',
        required: true,
        showRequired: false,
        //readonly: true,
        readonly: this.isViewMode(),
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'totalPrice',
        label: 'Valor Total',
        type: 'currency',
        required: true,
        showRequired: false,
        readonly: true,
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'tes',
        label: 'TES',
        type: 'string',
        required: false,
        showRequired: false,
        readonly: false,
        visible: false,
        noAutocomplete: true,
        maxLength: 3,
        gridColumns: 2,
      },
      {
        property: 'comissionPercentage',
        label: 'Comissão (%)',
        type: 'number',
        required: true,
        showRequired: false,
        readonly: this.isViewMode(),
        noAutocomplete: true,
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
        noAutocomplete: true,
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
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
        format: 'BRL',
      },
      {
        property: 'productNetWeight',
        label: 'Peso Neto Produto',
        type: 'number',
        required: false,
        showRequired: false,
        readonly: true,
        visible: false,
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
      },
      {
        property: 'productGrossWeight',
        label: 'Peso Bruto Produto',
        type: 'number',
        required: false,
        showRequired: false,
        readonly: true,
        visible: false,
        noAutocomplete: true,
        maxLength: 20,
        gridColumns: 2,
      },
      {
        property: 'packagingFormat',
        label: 'Formato Embalagem',
        type: 'string',
        required: false,
        showRequired: false,
        readonly: false,
        visible: false,
        noAutocomplete: true,
        maxLength: 3,
        gridColumns: 2,
      },
    ]
    
    this.generalDataFields = this.getFields(1);
    this.logisticsDataFields = this.getFields(2);
    this.copyModalFields = this.fields
      .filter((field) => field.property === 'loadingLocation' || field.property === 'customerId')
      .map((field) => {
        const copiedField = {...field};
        copiedField.readonly = false;
        copiedField.disabled = false;
        return copiedField;
      });

    this.gridRowActions = [
      { action: this.onModifyRow.bind(this),       icon: 'an an-note-pencil',   label: 'Alterar linha',     disabled: this.isViewMode() },
      { action: this.onAddRow.bind(this),          icon: 'an an-plus',          label: 'Adicionar linha',   disabled: this.isViewMode() },
    ];
        
    if (!this.isAddMode() && this.location && this.budgetId) {
      const res = await this.loadBudgetData(this.location,this.budgetId);
      if (res) {        
        this.fillCustomerData();
      } else {
        this.router.navigate(['/','orcamentos']);
      }
    } else {
      this.loadDefaultData();
    }

    this.isHideLoading = true;

  }

  public getFields(order: number): Array<PoDynamicFormField> {
    return this.fields.filter(field => field.order == order);
  }

  public get budgetTotalValue(): string {
    const totalValue = this.rows.reduce((sum, row) => {
      const price = Number(row.totalPrice);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    return totalValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  public get budgetFreightValue(): string {
    const freightCost   = isNaN(Number(this.headerData.freightCost))    ? 0 : this.headerData.freightCost
    const unloadingCost = isNaN(Number(this.headerData.unloadingCost))  ? 0 : this.headerData.unloadingCost
    const totalValue = freightCost + unloadingCost
    return totalValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private get productsAmountPerPackagingFormat(): Array<number> {
    const productsAmount10x1 = this.rows.reduce((sum, row) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '10X1') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    const productsAmount30x1 = this.rows.reduce((sum, row) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '30X1') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    const productsAmount25kg = this.rows.reduce((sum, row) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '25KG') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    return [productsAmount10x1, productsAmount30x1, productsAmount25kg];
  }

  private get palletsAmountPerPackagingFormat(): Array<number> {
    const pallets10x1Amount = Math.ceil(this.productsAmountPerPackagingFormat[0]/(this.headerData.palletPattern10x1 ?? 150));
    const pallets30x1Amount = Math.ceil(this.productsAmountPerPackagingFormat[1]/(this.headerData.palletPattern30x1 ?? 50));
    const pallets25kgAmount = Math.ceil(this.productsAmountPerPackagingFormat[2]/(this.headerData.palletPattern25kg ?? 50));
    return [pallets10x1Amount, pallets30x1Amount, pallets25kgAmount].map(item => isFinite(item) ? item : 0);
  }

  private get totalPalletsWeight(): number {
    const palletUnitWeight = this.headerData.cargoType === '2' ? this.pbrPalletWeight : this.headerData.cargoType === '3' ? this.disposablePalletWeight : 0;
    const totalPalletsAmount = this.palletsAmountPerPackagingFormat[0] + this.palletsAmountPerPackagingFormat[1] + this.palletsAmountPerPackagingFormat[2];
    return totalPalletsAmount * palletUnitWeight;
  }

  public get totalLoadWeight(): number {
    const totalProductsWeight = this.rows.reduce((sum, row) => {
      const grossWeight = row.productGrossWeight ?? 0;
      const amount = row.amount ?? 0;
      const weight = grossWeight * amount;
      return sum + (weight ?? 0);
    }, 0);
    return totalProductsWeight + this.totalPalletsWeight;
  }

  public get totalLoadWeightFormatted(): string {
    const totalWeight = this.totalLoadWeight;
    return totalWeight.toLocaleString('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' kg';
  }

  public get weightStatusInformations(): Array<any> {
    const weightMargin = 3;
    if (this.totalLoadWeight == 0 || !this.totalLoadWeight) {
      return ['Descarregado', PoTagType.Neutral ]
    } else if (this.totalLoadWeight > this.headerData.maxLoad*(1+weightMargin/100)) {
      return ['Carga acima do limite', PoTagType.Danger]
    } else if (this.totalLoadWeight < this.headerData.maxLoad*(1-weightMargin/100)) {
      return ['Carga abaixo do limite', PoTagType.Warning]
    } else {
      return ['Carga dentro do limite', PoTagType.Success]
    }
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

  public async saveForm(isAutoSave: boolean, bkpRows?: Array<any>) {
    if (this.validateHeader() && this.validateRows()) {
      this.isHideLoading = false;
      const res = await this.sendForm();
      if (res) {
        if (res.success) {
          this.poNotification.success(res.message);
          if (!isAutoSave) {
            this.router.navigate(['/','orcamentos']);
          } else {
            !this.headerData.budgetId ? this.headerData.budgetId = res.orcamento : null;
            this.modal.close();
            this.modalCopy.close();
          }
        } else {
          bkpRows ? this.rows = bkpRows.map(item => ({ ...item })) : null;
          this.poNotification.error(res.message + ': ' + res.fix);
        }
      } else {
        bkpRows ? this.rows = bkpRows.map(item => ({ ...item })) : null;
      }
      this.isHideLoading = true;
    }
  }

  public async sendForm(): Promise<any> {
    const body = {
      "filial":           this.headerData.loadingLocation           ?? "",
      "orcamento":        this.headerData.budgetId                  ?? "",
      "cliente":          this.headerData.customerId.substring(0,6) ?? "",
      "lojaCliente":      this.headerData.customerId.slice(-2)      ?? "",
      "condPag":          this.headerData.paymentTerms              ?? "",
      "observacao":       this.headerData.observation ? this.headerData.observation.trim() : "",
      "vendedor":         localStorage.getItem('sellerId')          ?? "",
      "situacao":         this.headerData.budgetStatus              ?? "",
      "condPagFrete":     this.headerData.freightPaymentTerms       ?? "",
      "valorFrete":       this.headerData.freightCost               ?? 0,
      "tipoCarga":        this.headerData.cargoType                 ?? "",
      "tipoDescarga":     this.headerData.unloadingType             ?? "",
      "valorDescarga":    this.headerData.unloadingCost             ?? 0,
      "tipoFrete":        this.headerData.freightType               ?? "",
      "cargaMaxima":      this.headerData.maxLoad                   ?? 0,
      "paletizacao10x1":  this.headerData.palletPattern10x1         ?? 150,
      "paletizacao30x1":  this.headerData.palletPattern30x1         ?? 50,
      "paletizacao25kg":  this.headerData.palletPattern25kg         ?? 50,
      "tipoVeiculo":      this.headerData.transportationMode        ?? "",
      "responsavelFrete": this.headerData.freightResponsible        ?? false,
      "itens":            this.rows.map((item: any) => ({
        "item":           item.item                 ?? "",
        "produto":        item.productId            ?? "",
        "quantidade":     item.amount               ?? 0,
        "precoUnitario":  item.unitPrice            ?? 0,
        "comissao":       item.comissionPercentage  ?? 0,
        "tes":            item.tes                  ?? "",
      }))
    };
    try {
      if (!this.headerData.budgetId) {
        const res = await firstValueFrom( this.api.post('portal-do-representante/orcamentos/incluir/', body));
        return res;
      } else {
        const res = await firstValueFrom( this.api.put('portal-do-representante/orcamentos/alterar/', body));
        return res;
      }
    } catch (error: any) {
      this.poNotification.error('Erro ao atualizar orçamento: ' + error.message);
      return null;
    }
  }

  private validateHeader(): boolean {
    const requiredFields: Array<PoDynamicFormField> = this.getRequiredHeaderFields();
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

  private validateRows(): boolean {
    const requiredFields: Array<PoDynamicFormField> = this.getRequiredRowFields();
    const invalidRows: string[] = [];
  
    this.rows.forEach((row, index) => {
      const missingFields = requiredFields.filter(field => {
        const value = row[field.property];
        if (field.property == 'amount' || field.property == 'unitPrice') {
          return value === null || value === undefined || isNaN(Number(value)) || value === 0;
        } else {
          return value === null || value === undefined || value === '';
        }
      });
  
      if (missingFields.length > 0) {
        const fieldLabels = missingFields.map(f => f.label).join(', ');
        invalidRows.push('Item ' + row.item + ' - Preencha os campos obrigatórios: ' + fieldLabels);
      }
    });
  
    if (invalidRows.length > 0) {
      invalidRows.forEach(message => this.poNotification.warning(message));
      return false;
    }
  
    return true;
  }

  private validateRowData(): boolean {
    const requiredFields: Array<PoDynamicFormField> = this.getRequiredRowFields();
    const invalidRows: string[] = [];
  
    const missingFields = requiredFields.filter(field => {
      const value = this.rowData[field.property];
      if (field.property == 'amount' || field.property == 'unitPrice') {
        return value === null || value === undefined || isNaN(Number(value)) || value === 0;
      } else {
        return value === null || value === undefined || value === '';
      }
    });

    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map(f => f.label).join(', ');
      invalidRows.push('Item ' + this.rowData.item + ' - Preencha os campos obrigatórios: ' + fieldLabels);
    }
  
    if (invalidRows.length > 0) {
      invalidRows.forEach(message => this.poNotification.warning(message));
      return false;
    }
  
    return true;
  }

  public getRequiredHeaderFields(): Array<PoDynamicFormField> {
      return this.fields.filter(field => field.required == true && !field.property.toLowerCase().includes('disabled'));
  }

  public getRequiredRowFields(): Array<PoDynamicFormField> {
    return this.columns.filter(field => field.required == true);
}

  public onCancelForm() {
    this.router.navigate(['/','orcamentos'])
  }

  public onModifyRow(row: any) {
    if (this.validateHeader()) {
      this.eraseRowData();
      this.fillRowData(row)
      this.selectedProductId = this.rowData.productId
      this.rowFormTitle = 'Item - Alterar'
      this.modal.open()
    }
  }

  public onAddRow(row: any) {
    if (this.validateHeader() && this.validateRows()) {
      this.eraseRowData();
      this.fillRowNextItem(row)
      this.selectedProductId = this.rowData.productId
      this.rowFormTitle = 'Item - Adicionar'
      this.modal.open()
    }
  }

  public saveRow(row: any) {
    if (this.validateRowData()) {
      const bkpRows = this.rows.map(item => ({ ...item }));
      if (row.operation === 'ADD') {
        this.rows = [...this.rows, row]
      } else if (row.operation === 'MOD') {
        this.rows = this.rows.map(existingRow => {
          return existingRow.item === row.item ? { ...row } : existingRow;
        });
      }
      this.saveForm(true, bkpRows);
    }
  }

  public closeRow() {
    this.modal.close()
  }

  public formatNumericHeaderValues() {
    const numericFields: Array<string> = this.fields
      .filter(field => field.type === 'number')
      .map(field => field.property);
    numericFields.forEach((field) => {
      const value: number = Math.abs(Number(this.headerData[field])) ?? 0;
      const decimalPlaces: number = Number(this.fields.find(f => f.property === field)?.format?.slice(-1)) ?? 2;
      if (!isNaN(value)) {
        this.headerData[field] = Number(value.toFixed(decimalPlaces));
      }
    });
  }

  public onChangeHeaderFields(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
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
    } else if (changedValue.property === 'customerId' && !this.isCopyMode()) {
      setTimeout(() => {
        this.headerData.customerIdDisabled = this.headerData.customerId;
        this.fillCustomerData();
      }, 0);
      return {
        fields: [
          { property: 'customerId',  visible: false },
          { property: 'customerIdDisabled',  visible: true },
        ]
      }
    } else {
      return {}
    }
  };

  public onChangeFreightFields(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    this.formatNumericHeaderValues();
    if (changedValue.property === 'freightType') {
      return {
        fields: [
          { property: 'freightPaymentTerms',  disabled: false },
          { property: 'cargoType',            readonly: false },
          { property: 'unloadingType',        readonly: false },
          { property: 'unloadingCost',        readonly: false },
          { property: 'transportationMode',   readonly: false },
          { property: 'maxLoad',              readonly: false },
          { property: 'maxLoad',              readonly: false },
          { property: 'freightResponsible',   disabled: false },
        ],
        value: {
          palletPattern10x1: this.headerData.palletPattern10x1 ?? 150,
          palletPattern30x1: this.headerData.palletPattern30x1 ?? 50,
          palletPattern25kg: this.headerData.palletPattern25kg ?? 50,
        }
      }
    } else if (changedValue.property === 'cargoType') {
      return {
        fields: [
          { property: 'palletPattern10x1',    readonly: this.headerData.cargoType === '1' },
          { property: 'palletPattern30x1',    readonly: this.headerData.cargoType === '1' },
          { property: 'palletPattern25kg',    readonly: this.headerData.cargoType === '1' },
        ],
      }
    } else if (changedValue.property === 'palletPattern10x1' || changedValue.property === 'palletPattern30x1' || changedValue.property === 'palletPattern25kg') {
      return {
        value: {
          palletPattern10x1: this.headerData.palletPattern10x1 !== 0 ? this.headerData.palletPattern10x1 : 150,
          palletPattern30x1: this.headerData.palletPattern30x1 !== 0 ? this.headerData.palletPattern30x1 : 50,
          palletPattern25kg: this.headerData.palletPattern25kg !== 0 ? this.headerData.palletPattern25kg : 50,
        }
      }
    } else if (changedValue.property === 'freightResponsible' || changedValue.property === 'freightCost') {
        return {
          fields: [
            { property: 'freightCost',  readonly: !this.headerData.freightResponsible },
          ]
        }
    } else {
      return {}
    }
  };

  public onChangeFieldsRow(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    
    if (changedValue.property === 'productId') {
      if (!this.selectedProductId) {
        this.fillProductData(changedValue.value.productId)
        return {}
      } else {
        return {
          value: { productId: this.selectedProductId },
        }
      }
    } else if (changedValue.property === 'comissionPercentage' || changedValue.property === 'unitPrice' || changedValue.property === 'amount') {
      if (isNaN(Number(changedValue.value.comissionPercentage))) {
        this.rowData.comissionPercentage = 0
      } else if (isNaN(Number(changedValue.value.unitPrice))) {
        this.rowData.unitPrice = 0
      } else if (isNaN(Number(changedValue.value.amount))) {
        this.rowData.amount = 0
      }
      return {
        value: {
          totalPrice:           Math.abs(this.rowData.unitPrice*this.rowData.amount),
          comissionUnitValue:   Math.abs(this.rowData.unitPrice*(this.rowData.comissionPercentage/100)),
          comissionTotalValue:  Math.abs(this.rowData.unitPrice*this.rowData.amount*(this.rowData.comissionPercentage/100)),
        }
      }
    } else {
      return {}
    }
  };

  private async loadBudgetData(location: string, budgetId: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/orcamentos/dados?loadingLocation='+location+'&budget='+budgetId));
      if (res) {
        this.headerData = {
          loadingLocation:      !this.isCopyMode() ? res.filial : '',
          budgetId:             !this.isCopyMode() ? res.orcamento : '',
          budgetStatus:         !this.isCopyMode() ? res.situacao : '',
          customerId:           !this.isCopyMode() ? res.cliente+res.loja : '',
          paymentTerms:         res.condPag               ?? '',
          observation:          res.observacao.trim()     ?? '',
          freightType:          res.tipoFrete             ?? '',
          freightPaymentTerms:  res.condPagFrete          ?? '',
          freightCost:          res.valorFrete            ?? 0,
          cargoType:            res.tipoCarga             ?? '',
          unloadingType:        res.tipoDescarga          ?? '',
          unloadingCost:        res.valorDescarga         ?? 0,
          maxLoad:              res.cargaMaxima           ?? 0,
          palletPattern10x1:    res.paletizacao10x1       ?? 150,
          palletPattern30x1:    res.paletizacao30x1       ?? 50,
          palletPattern25kg:    res.paletizacao25kg       ?? 50,
          transportationMode:   res.tipoVeiculo           ?? '',
          freightResponsible:   res.freteResponsavel      ?? false,
        };
        if (!this.isCopyMode()) {
          this.rows = res.itens.map((item: any) => ({
            item:                 item.item,
            productId:            item.produto.trim(),
            productDescription:   item.descProduto.trim(),
            amount:               item.quantidade,
            packagingType:        item.embalagem,
            unitPrice:            item.valorUnitario,
            totalPrice:           item.valorTotal,
            tes:                  item.tes,
            comissionPercentage:  item.comissao,
            comissionUnitValue:   item.valorUnitario * item.comissao / 100,
            comissionTotalValue:  item.valorTotal * item.comissao / 100,
            productNetWeight:     item.pesoNeto,
            productGrossWeight:   item.pesoBruto,
            packagingFormat:      item.formatoEmbalagem,
          }));
        } else {
          this.rows2Copy = res.itens.map((item: any) => ({
            item:                 item.item,
            productId:            item.produto.trim(),
            productDescription:   item.descProduto.trim(),
            amount:               item.quantidade,
            packagingType:        item.embalagem,
            unitPrice:            item.valorUnitario,
            totalPrice:           item.valorTotal,
            tes:                  item.tes,
            comissionPercentage:  item.comissao,
            comissionUnitValue:   item.valorUnitario * item.comissao / 100,
            comissionTotalValue:  item.valorTotal * item.comissao / 100,
          }));
          setTimeout(() => {
            this.openCopyModal();
          }, 0);
        }
      }
      return res; // Retorna os dados completos do orçamento
    } catch (error: any) {
      this.poNotification.error('Erro ao carregar orçamento: ' + error.message);
      return null;
    }
  }

  private async fillProductData(codigoProduto: string): Promise<any> {
    this.confirmRow.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/produtos/'+codigoProduto));
      if (res) {
        this.rowData.productDescription = res.descricao;
        this.rowData.packagingType = res.unidade;
        this.rowData.packagingFormat = res.formatoEmbalagem;
        this.rowData.productNetWeight = res.pesoLiquido;
        this.rowData.productGrossWeight = res.pesoBruto;
      }
      this.confirmRow.loading = false;
      return res
    } catch (error: any) {
      console.error('Erro ao buscar dados do produto:', error.message);
      this.confirmRow.loading = false;
      return null;
    }
  }

  private async fillCustomerData(): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/clientes/'+this.headerData.customerId));
      if (res) {
        this.headerData.destinationState = res.estado;
        this.headerData.customerHasIE = !!res.ie;
      }
      return res
    } catch (error: any) {
      console.error('Erro ao buscar dados do cliente:', error.message);
      this.confirmRow.loading = false;
      return null;
    }
  }

  private loadDefaultData(): void {
    this.headerData = {
      paymentTerms:         '001',
      freightPaymentTerms:  '001',
      cargoType:            '1',
      unloadingType:        '1',
      palletPattern10x1:    150,
      palletPattern30x1:    50,
      palletPattern25kg:    50,
      transportationMode:   'R',
      freightResponsible:   false,
    };
    this.rows = [
    {
      item: '01',
      amount: 1,
      unitPrice: 0,
      totalPrice: 0,
      comissionUnitValue: 0,
      comissionTotalValue: 0,
    },
    ];
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

  private isModifyMode(): boolean {
    if (this.mode == 'modify') {
      return true
    } else {
      return false
    }
  }

  private isCopyMode(): boolean {
    if (this.mode == 'copy') {
      return true
    } else {
      return false
    }
  }

  public get isFreightTabDisabled(): boolean {
    return !this.headerData.loadingLocation || !this.headerData.customerId;
  }

  private openCopyModal(): any {
    this.modalCopy.open();
    this.tableCopy.selectRowItem(row => true);
  }

  private saveRows2Copy(): any {
    if (!!this.copyModalHeaderData.loadingLocation && !!this.copyModalHeaderData.customerId) {
      this.headerData.loadingLocation = this.copyModalHeaderData.loadingLocation;
      this.headerData.customerId = this.copyModalHeaderData.customerId;
      this.headerData.budgetStatus = this.copyModalHeaderData.loadingLocation === '01010001' ? 'CP' : 'PP';
      if (this.tableCopy.getSelectedRows().length > 0) {
        let item = 0;
        const bkpRows = this.rows.map(item => ({ ...item }));
        this.rows = [];
        this.tableCopy.getSelectedRows().forEach((row) => {
          item++;
          row.item = item.toString().padStart(2, '0');
          delete row.$selected;
          delete row.tes;
          this.rows = [...this.rows,row];
        })
        this.saveForm(true,bkpRows);
      } else {
        this.modalCopy.close();
      }
      this.fillCustomerData()
    } else {
      this.poNotification.warning('Preencha todos os campos obrigatórios: Unidade de Carregamento, Cliente.')
    }
  }
}
