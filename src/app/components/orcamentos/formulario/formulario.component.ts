import { Component, ViewChild } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { PoTabsModule, PoPageModule, PoDynamicModule, PoGridModule, PoContainerModule, PoDynamicFormField, PoTableModule, PoTableAction, PoModalModule, PoButtonModule, PoModalComponent, PoModalAction, PoDynamicFormComponent, PoNotificationService } from '@po-ui/ng-components';
import { PoPageDynamicEditModule } from '@po-ui/ng-templates';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  
  constructor(private router: Router) {

  }

  @ViewChild(PoModalComponent, { static: true }) 'modal': PoModalComponent;
  @ViewChild(PoDynamicFormComponent, { static: true }) 'dynamicForm': PoDynamicFormComponent;

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
        { loadingLocation: 'Rio Grande do Norte', code: "RN" },
        { loadingLocation: 'Rio Grande do Norte', code: "RN" },
        { loadingLocation: 'São Paulo',           code: "SP" },
        { loadingLocation: 'Rio de Janeiro',      code: "RJ" },
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
      minLength: 6,
      maxLength: 6,
      gridColumns: 3,
      type: 'string',
      order: 1,
    },
    {
      property: 'customer',
      label: 'Cliente',
      visible: true,
      required: true,
      showRequired: true,
      readonly: false,
      minLength: 3,
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
      maxLength: 100,
      gridColumns: 12,
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
      readonly: false,
      maxLength: 3,
      gridColumns: 3,
      options: [
        { freightType: 'CIF' },
        { freightType: 'CIF' },
        { freightType: 'FOB' },
        { freightType: 'FOB' },
      ],
      type: 'string',
      fieldValue: 'freightType',
      fieldLabel: 'freightType',
      order: 2,
    },
    {
      property: 'freightPaymentTerms',
      label: 'Cond. Pag. Frete',
      visible: true,
      required: false,
      showRequired: false,
      readonly: true,
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
      readonly: true,
      minLength: 3,
      maxLength: 40,
      gridColumns: 3,
      options: [
        { cargoType: 'Batida'     },
        { cargoType: 'Batida'     },
        { cargoType: 'Paletizada' },
        { cargoType: 'Paletizada' },
      ],
      type: 'string',
      fieldValue: 'cargoType',
      fieldLabel: 'cargoType',
      order: 2,
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

  public rowData: any = {}

  public readonly generalDataFields: Array<PoDynamicFormField> = this.getFields(1)
  public readonly logisticsDataFields: Array<PoDynamicFormField> = this.getFields(2)

  public gridRowActions: Array<PoTableAction> = [
    { action: this.onModifyRow.bind(this),       icon: 'an an-note-pencil',   label: 'Alterar linha',     disabled: false },
    { action: this.onAddRow.bind(this),          icon: 'an an-plus',          label: 'Adicionar linha',   disabled: false },
  ];

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



}
