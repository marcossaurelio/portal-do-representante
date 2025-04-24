import { Component, ViewChild } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { PoTabsModule, PoPageModule, PoDynamicModule, PoGridModule, PoContainerModule, PoDynamicFormField, PoTableModule, PoTableAction, PoModalModule, PoButtonModule, PoModalComponent, PoModalAction, PoDynamicFormComponent, PoNotificationService, PoDynamicFormValidation, PoLoadingModule } from '@po-ui/ng-components';
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
  
  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService) {}

  @ViewChild(PoModalComponent, { static: true }) 'modal': PoModalComponent;
  @ViewChild(PoDynamicFormComponent, { static: true }) 'dynamicForm': PoDynamicFormComponent;

  public headerData: any  = {};
  public rowData: any     = {};
  public mode: string     = 'view';
  public location: string = ''
  public budget: string   = ''
  public isHideLoading: boolean = true;
  public formTitle: string = 'Orçamentos'

  public readonly fields: Array<PoDynamicFormField> = [
    {
      property: 'loadingLocation',
      label: 'Unidade Carreg.',
      visible: true,
      required: true,
      showRequired: true,
      readonly: false,
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
      property: 'budgetType',
      label: 'Tipo Orçamento',
      visible: true,
      required: true,
      showRequired: true,
      readonly: true,
      gridColumns: 3,
      options: [
        { budgetType: 'Cotação',     code: "C" },
        { budgetType: 'Cotação',     code: "C" },
        { budgetType: 'Pré Pedido',  code: "P" },
        { budgetType: 'Pré Pedido',  code: "P" },
      ],
      type: 'string',
      fieldValue: 'code',
      fieldLabel: 'budgetType',
      order: 1,
    },
    {
      property: 'customerId',
      label: 'Cliente',
      visible: true,
      required: true,
      showRequired: true,
      readonly: false,
      minLength: 3,
      maxLength: 6,
      gridColumns: 2,
      type: 'string',
      order: 1,
    },
    {
      property: 'customerName',
      label: 'Nome do Cliente',
      visible: true,
      required: true,
      showRequired: true,
      readonly: true,
      maxLength: 70,
      gridColumns: 4,
      type: 'string',
      order: 1,
    },
    {
      property: 'paymentTerms',
      label: 'Cond. Pag.',
      visible: true,
      required: true,
      showRequired: true,
      readonly: false,
      minLength: 3,
      maxLength: 40,
      gridColumns: 2,
      type: 'string',
      order: 1,
    },
    {
      property: 'observation',
      label: 'Observação',
      visible: true,
      required: false,
      showRequired: false,
      readonly: false,
      maxLength: 120,
      gridColumns: 10,
      type: 'string',
      rows: 1,
      order: 1,
    },
    /*
    {
      property: 'observationTest',
      label: 'Observação',
      visible: true,
      required: false,
      showRequired: false,
      readonly: false,
      maxLength: 120,
      gridColumns: 10,
      type: 'string',
      rows: 1,
      searchService: 'https://po-sample-api.onrender.com/v1/heroes',
      columns: [
        { property: 'nickname', label: 'Hero' },
        { property: 'label', label: 'Name' }
      ],
      format: ['id', 'nickname'],
      fieldLabel: 'nickname',
      fieldValue: 'email',
      order: 1,
    },
    */
    {
      property: 'freightType',
      label: 'Tipo Frete',
      visible: true,
      required: true,
      showRequired: true,
      readonly: false,
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
      readonly: false,
      minLength: 3,
      maxLength: 40,
      gridColumns: 3,
      type: 'string',
      order: 2,
    },
    {
      property: 'cargoType',
      label: 'Tipo Carga',
      visible: true,
      required: false,
      showRequired: false,
      readonly: false,
      minLength: 3,
      maxLength: 40,
      gridColumns: 3,
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
      readonly: false,
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
      readonly: false,
      type: 'currency',
      maxLength: 20,
      gridColumns: 2,
      format: 'BRL',
      order: 2
    },
  ]
  
  public readonly columns: Array<any> = [
    {
      property: 'item',
      label: 'Item',
      type: 'string',
      required: true,
      showRequired: false,
      readonly: true,
      minLength: 2,
      maxLength: 4,
      gridColumns: 1,
    },
    {
      property: 'productCode',
      label: 'Cód. Produto',
      type: 'string',
      required: true,
      showRequired: false,
      readonly: false,
      maxLength: 20,
      gridColumns: 3,
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
      readonly: false,
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
      readonly: true,
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
      readonly: false,
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
  ];

  public rows: Array<any> = [
    {
      item: '01',
      amount: '1',
      unitPrice: 0,
      totalPrice: 0,
      comissionPercentage: 0,
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

  public readonly generalDataFields: Array<PoDynamicFormField> = this.getFields(1);
  public readonly logisticsDataFields: Array<PoDynamicFormField> = this.getFields(2);

  public gridRowActions: Array<PoTableAction> = [
    { action: this.onModifyRow.bind(this),       icon: 'an an-note-pencil',   label: 'Alterar linha',     disabled: false },
    { action: this.onAddRow.bind(this),          icon: 'an an-plus',          label: 'Adicionar linha',   disabled: false },
  ];

  public async ngOnInit() {
    this.isHideLoading = false;

    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || '';
      this.budget = params['budget'] || '';
      this.location = params['location'] || '';
    });

    this.formTitle += ' - ' + this.getModeDescription(this.mode)

    if (this.mode != 'add' && this.location && this.budget) {
      const res = await this.loadFormFields(this.location,this.budget);

      if (res) {
        this.headerData = {
          loadingLocation:      res.filial,
          budgetType:           res.situacao[0],
          customerId:           res.cliente,
          customerName:         res.nomeCliente,
          paymentTerms:         res.condPag,
          observation:          res.observacao,
          freightType:          res.tipoFrete,
          freightPaymentTerms:  res.condPagFrete,
          cargoType:            res.tipoCarga,
          unloadingType:        res.tipoDescarga,
          unloadingCost:        res.valorDescarga,
        };

        this.rows = res.itens.map((item: any) => ({
          item:                 item.item,
          productCode:          item.produto.trim(),
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
    this.rowData.comissionPercentage = 0;
    this.rowData.comissionUnitValue = 0;
    this.rowData.comissionTotalValue = 0;
    this.rowData.operation = 'ADD';
  }

  public eraseRowData(): void {
    this.rowData = {};
  }

  public onSaveForm() {
    
  }

  public onCancelForm() {
    this.router.navigate(['/','orcamentos'])
  }

  public onModifyRow(row: any) {
    this.eraseRowData();
    this.fillRowData(row)
    this.modal.open()
  }

  public onAddRow(row: any) {
    this.eraseRowData();
    this.fillRowNextItem(row)
    this.modal.open()
  }

  public saveRow(row: any) {
    const { operation, ...cleanRow } = row; // remove o campo "operation"

    if (row.operation === 'ADD') {
      this.rows = [...this.rows, cleanRow]
    } else if (row.operation === 'MOD') {
      this.rows = this.rows.map(existingRow => {
        return existingRow.item === cleanRow.item ? { ...cleanRow } : existingRow;
      });
    }
    this.modal.close()
  }

  public closeRow() {
    this.modal.close()
  }

  public onChangeFields(changeValue: any): PoDynamicFormValidation {
    if (changeValue.property === 'productCode') {
      return {
        value: { productDescription: 'Teste' },
        fields: [{ property: 'productCode', readonly: true }]
      }
    } else {
      return {}
    }
  };

  private async loadFormFields(location: string, budget: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.api.get('portal-do-representante/orcamentos/dados?loadingLocation='+this.location+'&budget='+this.budget));
      return res; // Retorna os dados completos do orçamento
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

}
