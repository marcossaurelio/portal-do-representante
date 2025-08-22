import { Component, ViewChild } from '@angular/core';
import { PoTabsModule, PoPageModule, PoDynamicModule, PoGridModule, PoContainerModule, PoDynamicFormField, PoTableModule, PoDatepickerModule } from '@po-ui/ng-components';
import { PoTableAction, PoModalModule, PoButtonModule, PoModalComponent, PoModalAction, PoDynamicFormComponent } from '@po-ui/ng-components';
import { PoNotificationService, PoDynamicFormValidation, PoLoadingModule, PoDynamicFormFieldChanged, PoInfoModule } from '@po-ui/ng-components';
import { PoInfoOrientation, PoTableComponent, PoDividerModule, PoTagModule, PoTagType, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { PoPageDynamicEditModule } from '@po-ui/ng-templates';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CustomerService } from '../../../services/domain/customer.service';
import { CityService } from '../../../services/domain/city.service';
import { FieldsService } from '../../../services/fields.service';
import { firstValueFrom, Observable } from 'rxjs';

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
    PoDatepickerModule
],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  
  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private poNotification: PoNotificationService, private customerService: CustomerService, private cityService: CityService, private fieldsService: FieldsService) {}

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
  public loadingText: string = 'Carregando';
  public formTitle: string = 'Orçamentos'
  public validateHeaderFields: Array<string> = []
  public validateFreightFields: Array<string> = []
  public validateFieldsRow: Array<string> = ['productId','comissionPercentage','fobBasePrice','unitPrice','amount'];
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

    this.loadDefaultData();

    if (!this.isAddMode() && this.location && this.budgetId) {
      const res = await this.loadBudgetData(this.location,this.budgetId);
      if (res) {        
        !!this.headerData.customerId ? await this.fillCustomerData() : null;
        !this.isViewMode() ? await this.updateFreightCost() : null;
        //this.updateFieldsProperties();
      } else {
        this.router.navigate(['/','orcamentos']);
      }
    }

    this.fields = this.fieldsService.getFields(this);

    this.columns = this.fieldsService.getColumns(this);
    
    this.generalDataFields = this.getFields(1);
    this.logisticsDataFields = this.getFields(2);
    this.copyModalFields = this.fields
      .filter((field) => field.property === 'loadingLocation' || field.property === 'customerId')
      .map((field) => {
        const copiedField = {...field};
        copiedField.disabled = false;
        copiedField.disabled = false;
        return copiedField;
      });

    this.validateHeaderFields = this.generalDataFields
      .map(field => field.property);
    this.validateFreightFields = this.logisticsDataFields
      .map(field => field.property);

    this.gridRowActions = [
      { action: this.onModifyRow.bind(this),  icon: 'an an-note-pencil',  label: 'Alterar linha',     disabled: this.isViewMode() },
      { action: this.onAddRow.bind(this),     icon: 'an an-plus',         label: 'Adicionar linha',   disabled: this.isViewMode() },
    ];
        
    setTimeout(() => {
      this.isHideLoading = true;
    }, 0);

  }


  public getFields(order: number): Array<PoDynamicFormField> {
    return this.fields.filter(field => field.order == order);
  }

  public get budgetTotalValue(): number {
    const totalValue = this.rows.reduce((sum, row) => {
      const price = Number(row.totalPrice);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    return totalValue;
  }

  public get budgetTotalValueFormatted(): string {
    return this.budgetTotalValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
  
  public get budgetFreightPerTon(): number {
    const freightCost   = isNaN(Number(this.headerData.freightCost))    ? 0 : this.headerData.freightCost
    const unloadingCost = isNaN(Number(this.headerData.unloadingCost))  ? 0 : this.headerData.unloadingCost
    const totalValue = freightCost + unloadingCost
    return totalValue;
  }

  public get overweightCost(): number {
    const netWeight = this.totalProductsNetWeight ?? 0;
    const maxLoad = this.headerData.maxLoad ?? 0;
    const freightCostPerTon = this.headerData.freightCost ?? 0;
    const overweightCost = netWeight >= maxLoad || netWeight <= 0 ? 0 : freightCostPerTon * (maxLoad/netWeight) - freightCostPerTon;
    return overweightCost;
  }

  public get budgetFreightTotalValue(): number {
    const maxLoad = this.headerData.maxLoad ?? 0;
    const overweightCost = this.overweightCost;
    return (this.budgetFreightPerTon + overweightCost) * (maxLoad/1000);
  }

  public get budgetFreightValueFormatted(): string {
    return this.budgetFreightTotalValue.toLocaleString('pt-BR', {
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

  private get totalPalletsAmount(): number {
    return this.palletsAmountPerPackagingFormat[0] + this.palletsAmountPerPackagingFormat[1] + this.palletsAmountPerPackagingFormat[2];
  }

  private get totalPalletsWeight(): number {
    const palletUnitWeight = this.headerData.cargoType.charAt(0) === 'P' ? this.pbrPalletWeight : this.headerData.cargoType.charAt(0) === 'D' ? this.disposablePalletWeight : 0;
    const totalPalletsAmount = this.totalPalletsAmount;
    return totalPalletsAmount * palletUnitWeight;
  }

  private get totalProductsNetWeight(): number {
    return this.rows.reduce((sum, row) => {
      const netWeight = row.productNetWeight ?? 0;
      const amount = row.amount ?? 0;
      const weight = netWeight * amount;
      return sum + (weight ?? 0);
    }, 0);
  }

  private get totalProductsWeight(): number {
    return this.rows.reduce((sum, row) => {
      const grossWeight = row.productGrossWeight ?? 0;
      const amount = row.amount ?? 0;
      const weight = grossWeight * amount;
      return sum + (weight ?? 0);
    }, 0);
  }

  public get totalLoadWeight(): number {
    return this.totalProductsWeight + this.totalPalletsWeight;
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

  public fillRowNextItem(): void {
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

  public async onSaveForm(isAutoSave: boolean): Promise<void> {
    this.isHideLoading = false;
    await this.saveForm(isAutoSave);
    this.isHideLoading = true;
  }

  private async saveForm(isAutoSave: boolean, bkpRows?: Array<any>, bkpHeaderData?: any, isSilent: boolean = false): Promise<any> {
    const budgetStatus = this.headerData.loadingLocation === '01010001' ? 'CP' : 'PP';
    if (!(this.validateHeader(isSilent) && this.validateRows(isSilent))) {
      return;
    }
    await this.updateFreightCost(true);
    await this.updateAllRowsPrices();
    const res = await this.sendForm();
    if (!res) {
      bkpHeaderData ? this.headerData = { ...bkpHeaderData } : null;
      bkpRows ? this.rows = bkpRows.map(item => ({ ...item })) : null;
      return;
    }
    if (!res.success) {
      bkpHeaderData ? this.headerData = { ...bkpHeaderData } : null;
      bkpRows ? this.rows = bkpRows.map(item => ({ ...item })) : null;
      this.poNotification.error(res.message + ': ' + res.fix);
      return;
    }
    this.headerData.budgetStatus = budgetStatus;
    if (!isAutoSave) {
      this.poNotification.success(res.message);
      this.router.navigate(['/','orcamentos']);
    } else {
      !this.headerData.budgetId ? this.headerData.budgetId = res.orcamento : null;
      this.modal.close();
      this.modalCopy.close();
    }
  }

  public async sendForm(): Promise<any> {
    const loadingLocation = this.headerData.loadingLocation ?? '01010001';
    const budgetStatus = loadingLocation === '01010001' ? 'CP' : 'PP';
    const body = {    
      "filial":               this.headerData.loadingLocation           ?? "",
      "orcamento":            this.headerData.budgetId                  ?? "",
      "cliente":              this.headerData.customerId.substring(0,6) ?? "",
      "lojaCliente":          this.headerData.customerId.slice(-2)      ?? "",
      "condPag":              this.headerData.paymentTerms              ?? "",
      "observacao":           this.headerData.observation ? this.headerData.observation.trim() : "",
      "vendedor":             localStorage.getItem('sellerId')          ?? "",
      "situacao":             budgetStatus                              ?? "",
      "condPagFrete":         this.headerData.freightPaymentTerms       ?? "",
      "valorFrete":           this.headerData.freightCost               ?? 0,
      "tipoCarga":            this.headerData.cargoType                 ?? "",
      "tipoDescarga":         this.headerData.unloadingType             ?? "",
      "valorDescarga":        this.headerData.unloadingCost             ?? 0,
      "tipoFrete":            this.headerData.freightType               ?? "",
      "cargaMaxima":          this.headerData.maxLoad                   ?? 0,
      "paletizacao10x1":      this.headerData.palletPattern10x1         ?? 150,
      "paletizacao30x1":      this.headerData.palletPattern30x1         ?? 50,
      "paletizacao25kg":      this.headerData.palletPattern25kg         ?? 50,
      "tipoVeiculo":          this.headerData.transportationMode        ?? "",
      "estadoDestino":        this.headerData.destinationState          ?? "",
      "cidadeDestino":        this.headerData.destinationCity           ?? "",
      "custoSobrepeso":       this.overweightCost                       ?? 0,
      "descontoFinanceiro":   this.headerData.financialDiscount         ?? 0,
      "responsavelFrete":     this.headerData.freightResponsible        ? "1" : "0",
      "veiculoProprio":       this.headerData.customerVehicle           ? "S" : "N",
      "palletReturn":         this.headerData.palletReturn              ? "S" : "N",
      "itens":                this.rows.map((item: any) => ({
        "item":               item.item                 ?? "",
        "produto":            item.productId            ?? "",
        "quantidade":         item.amount               ?? 0,
        "precoFOB":           item.fobBasePrice         ?? 0,
        "precoUnitario":      item.unitPrice            ?? 0,
        "comissao":           item.comissionPercentage  ?? 0,
        "tes":                item.tes                  ?? "",
      }))
    };
    try {
      if (!this.headerData.budgetId) {
        const res = await firstValueFrom( this.api.post('portal-do-representante/orcamentos/incluir/', body, loadingLocation));
        return res;
      } else {
        const res = await firstValueFrom( this.api.put('portal-do-representante/orcamentos/alterar/', body, loadingLocation));
        return res;
      }
    } catch (error: any) {
      this.poNotification.error('Erro ao atualizar orçamento: ' + error.message);
      return null;
    }
  }

  private async getItemPriceInfo(row: any): Promise<any> {
    const loadingLocation = this.headerData.loadingLocation ?? '01010001';
    const body = {
      "filial":             this.headerData.loadingLocation           ?? "",
      "orcamento":          this.headerData.budgetId                  ?? "",
      "cliente":            this.headerData.customerId.substring(0,6) ?? "",
      "lojaCliente":        this.headerData.customerId.slice(-2)      ?? "",
      "condPagamento":      this.headerData.paymentTerms              ?? "",
      "vendedor":           localStorage.getItem('sellerId')          ?? "",
      "situacao":           this.headerData.budgetStatus              ?? "",
      "condPagFrete":       this.headerData.freightPaymentTerms       ?? "",
      "valorFreteBase":     this.headerData.freightCost               ?? 0,
      "tipoCarga":          this.headerData.cargoType                 ?? "",
      "tipoDescarga":       this.headerData.unloadingType             ?? "",
      "valorDescarga":      this.headerData.unloadingCost             ?? 0,
      "tipoFrete":          this.headerData.freightType               ?? "",
      "cargaMaxima":        this.headerData.maxLoad                   ?? 0,
      "tipoVeiculo":        this.headerData.transportationMode        ?? "",
      "responsavelFrete":   this.headerData.freightResponsible        ?? false,
      "veiculoProprio":     this.headerData.customerVehicle           ?? false,
      "categoriaCliente":   this.headerData.customerCategory          ?? "", 
      "estadoDestino":      this.headerData.destinationState          ?? "",
      "cidadeDestino":      this.headerData.destinationCity           ?? "",
      "item":               row.item                                  ?? "",
      "produto":            row.productId                             ?? "",
      "quantidade":         row.amount                                ?? 0,
      "precoFOB":           row.fobBasePrice                          ?? 0,
      "precoUnitario":      row.unitPrice                             ?? 0,
      "comissao":           row.comissionPercentage                   ?? 0,
      "totalFaturamento":   this.budgetTotalValue                     ?? 0,
      "totalFrete":         this.budgetFreightPerTon                  ?? 0,
      "volumeTotal":        this.totalLoadWeight                      ?? 0,
      "pesoTotalProdutos":  this.totalProductsNetWeight               ?? 0,
      "qtdTotalPaletes":    this.totalPalletsAmount                   ?? 0,
      "devolucaoPalete":    this.headerData.palletReturn              ?? false,
    };
    try {
      const res: any = await firstValueFrom( this.api.post('portal-do-representante/precificacao/produto/', body, loadingLocation));
      if (!res.success) {
        this.poNotification.error('Item ' + row.item + ' - ' + res.message + ': ' + res.fix);
        return null;
      }
      return {
        ...row,
        unitPrice: res.precoUnitario,
        comissionPercentage: res.comissao,
        totalPrice: res.precoUnitario * row.amount,
        comissionUnitValue: res.precoUnitario * (1-this.headerData.financialDiscount/100) * (res.comissao / 100),
        comissionTotalValue: res.precoUnitario * (1-this.headerData.financialDiscount/100) * (res.comissao / 100) * row.amount,
      }
    } catch (error: any) {
      this.poNotification.error('Item ' + row.item + ' - ' + 'Erro ao consultar precificação: ' + error.message);
      return null;
    }
  }

  private async updateAllRowsPrices(): Promise<void> {
    this.loadingText = 'Atualizando preços';
    const updatedRows = await Promise.all(this.rows.map(async (row) => {
      const updatedRow = await this.getItemPriceInfo(row);
      return updatedRow ?? row;
    }));
    this.rows = updatedRows;
    this.loadingText = 'Carregando';
  }

  private validateHeader(isSilent: boolean = false): boolean {
    const requiredFields: Array<PoDynamicFormField> = this.getRequiredHeaderFields();
    const missingFields = requiredFields.filter(field => {
      const value = this.headerData[field.property];
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      if (!isSilent) {
        const missingFieldLabels = missingFields.map(f => f.label).join(', ');
        this.poNotification.warning('Preencha os campos obrigatórios: ' + missingFieldLabels);
      }
      return false;
    }

    return true;

  }

  private validateRows(isSilent: boolean = false): boolean {
    if (this.rows.length === 0) {
      if (!isSilent) {
        this.poNotification.warning('Orçamento sem itens. Adicione pelo menos um item.');
      }
      return false;
    }
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
      if (!isSilent) {
        invalidRows.forEach(message => this.poNotification.warning(message));
      }
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
      this.updateColumnsProperties();
      this.modal.open()
    }
  }

  public onAddRow(row: any) {
    if (this.validateHeader() && this.validateRows()) {
      this.eraseRowData();
      this.fillRowNextItem()
      this.selectedProductId = this.rowData.productId
      this.rowFormTitle = 'Item - Adicionar'
      this.updateColumnsProperties();
      this.modal.open()
    }
  }

  public async saveRow(row: any) {
    if (!this.validateRowData()) {
      return;
    }
    this.isHideLoading = false;
    const bkpRows = this.rows.map(item => ({ ...item }));
    if (row.operation === 'ADD') {
      const updatedRow = await this.getItemPriceInfo(row);
      if (!updatedRow) {
        this.isHideLoading = true;
        return;
      }
      row = updatedRow;
      this.rows = [...this.rows, row]
    } else if (row.operation === 'MOD') {
      const updatedRow = await this.getItemPriceInfo(row);
      if (!updatedRow) {
        this.isHideLoading = true;
        return;
      }
      row = updatedRow;
      this.rows = this.rows.map(existingRow => {
        return existingRow.item === row.item ? { ...row } : existingRow;
      });
    }
    await this.saveForm(true, bkpRows);
    this.isHideLoading = true;
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
    if (this.isViewMode()) {
      return {};
    }
    const bkpHeaderData = { ...this.headerData };
    const bkpRows = this.rows.map(item => ({ ...item }));
    const validation: PoDynamicFormValidation = { fields: this.fieldsService.getFields(this) };
    const newBudgetStatus = this.isQuotationBranch ? 'CP' : 'PP';
    changedValue.property === 'loadingLocation' ? this.headerData.budgetStatus = newBudgetStatus : null;
    changedValue.property === 'customerId' ? this.headerData.customerIdDisabled = this.headerData.customerId : null;
    changedValue.property === 'customerId' ? this.fillCustomerData() : null;
    this.saveForm(true, bkpRows, bkpHeaderData, true);
    return validation;
  };

  public onChangeFreightFields(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    if (this.isViewMode()) {
      return {};
    }
    const bkpHeaderData = { ...this.headerData };
    const bkpRows = this.rows.map(item => ({ ...item }));
    const validation: PoDynamicFormValidation = { fields: this.fieldsService.getFields(this) };
    this.formatNumericHeaderValues();
    this.headerData.palletPattern10x1   = this.headerData.palletPattern10x1 ?? 150;
    this.headerData.palletPattern30x1   = this.headerData.palletPattern30x1 ?? 50;
    this.headerData.palletPattern25kg   = this.headerData.palletPattern25kg ?? 50;
    this.headerData.unloadingCost       = this.headerData.unloadingType === 'C' ? 0 : changedValue.property === 'unloadingType' ? null : this.headerData.unloadingCost ?? 0;
    this.headerData.freightCost         = this.headerData.freightType === 'F' ? 0 : this.headerData.freightCost ?? 0;
    this.headerData.transportationMode  = this.headerData.loadingLocation !== '01010001' ? 'R' : this.headerData.transportationMode ?? 'R';
    this.headerData.customerVehicle     = changedValue.value.freightType === 'C' ? false : this.headerData.customerVehicle ?? false;
    this.headerData.palletReturn        = this.headerData.cargoType == 'BT' ? false : this.headerData.palletReturn ?? false;
    changedValue.property === 'destinationState' ? this.headerData.destinationCity = '' : null;
    this.saveForm(true, bkpRows, bkpHeaderData, true);
    return validation;
  };

  public onChangeFieldsRow(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation {
    let validation: PoDynamicFormValidation = {};
    if (changedValue.property === 'productId') {
      if (!this.selectedProductId) {
        this.fillProductData(changedValue.value.productId)
        validation = {}
      } else {
        validation = {
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
      validation = {
        value: {
          totalPrice:           Math.abs(this.rowData.unitPrice*this.rowData.amount),
          comissionUnitValue:   Math.abs(this.rowData.unitPrice*(1-this.headerData.financialDiscount/100)*(this.rowData.comissionPercentage/100)),
          comissionTotalValue:  Math.abs(this.rowData.unitPrice*(1-this.headerData.financialDiscount/100)*this.rowData.amount*(this.rowData.comissionPercentage/100)),
        }
      }
    }
    return validation;
  };

  private async loadBudgetData(location: string, budgetId: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/orcamentos/dados?loadingLocation='+location+'&budget='+budgetId, location));
      if (res) {
        this.headerData = {
          loadingLocation:      !this.isCopyMode() ? res.filial : '',
          budgetId:             !this.isCopyMode() ? res.orcamento : '',
          budgetStatus:         !this.isCopyMode() ? res.situacao : '',
          customerId:           !this.isCopyMode() ? res.cliente+res.loja : '',
          customerIdDisabled:   !this.isCopyMode() ? res.cliente+res.loja : '',
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
          freightResponsible:   res.responsavelFrete      ?? false,
          customerVehicle:      res.veiculoProprio        ?? false,
          destinationState:     res.estadoDestino         ?? '',
          destinationCity:      res.cidadeDestino         ?? '',
          financialDiscount:    res.descontoFinanceiro    ?? 0,
          palletReturn:         res.devolucaoPalete       ?? false,
        };
        if (!this.isCopyMode()) {
          this.rows = res.itens.map((item: any) => ({
            item:                 item.item,
            productId:            item.produto.trim(),
            productDescription:   item.descProduto.trim(),
            amount:               item.quantidade,
            packagingType:        item.embalagem,
            fobBasePrice:         item.precoFOB,
            unitPrice:            item.valorUnitario,
            totalPrice:           item.valorTotal,
            tes:                  item.tes,
            comissionPercentage:  item.comissao,
            comissionUnitValue:   item.valorUnitario * (1-res.descontoFinanceiro/100) * item.comissao / 100,
            comissionTotalValue:  item.valorTotal * (1-res.descontoFinanceiro/100) * item.comissao / 100,
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
            fobBasePrice:         item.precoFOB,
            unitPrice:            item.valorUnitario,
            totalPrice:           item.valorTotal,
            tes:                  item.tes,
            comissionPercentage:  item.comissao,
            comissionUnitValue:   item.valorUnitario * (1-res.descontoFinanceiro/100) * item.comissao / 100,
            comissionTotalValue:  item.valorTotal * (1-res.descontoFinanceiro/100) * item.comissao / 100,
            productNetWeight:     item.pesoNeto,
            productGrossWeight:   item.pesoBruto,
            packagingFormat:      item.formatoEmbalagem,
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
    const loadingLocation = this.headerData.loadingLocation ?? '01010001';
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/produtos/'+codigoProduto, loadingLocation));
      if (res) {
        this.rowData.productDescription = res.descricao;
        this.rowData.packagingType = res.unidade;
        this.rowData.packagingFormat = res.formatoEmbalagem;
        this.rowData.productNetWeight = res.pesoNeto;
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

  private async fillCustomerData(): Promise<void> {
    const customerData = await this.customerService.getCustomerData(this.headerData.customerId);
    if (customerData) {
      this.headerData.destinationState  = !this.isModifyMode() && !this.isCopyMode() ? customerData.destinationState : this.headerData.destinationState;
      this.headerData.destinationCity   = !this.isModifyMode() && !this.isCopyMode() ? customerData.destinationCity : this.headerData.destinationCity;
      this.headerData.customerHasIE     = customerData.customerHasIE;
      this.headerData.customerCategory  = customerData.customerCategory;
    } else {
      this.poNotification.warning('Erro ao carregar dados do cliente.');
    }
  }

  public get isQuotationBranch(): boolean {
    return this.headerData.loadingLocation === '01010001';
  }

  private updateColumnsProperties(): void {
    this.columns = this.columns.map(column => {
      if (column.property === 'fobBasePrice') {
        return {
          ...column,
          disabled: !this.isQuotationBranch,
          visible:  this.isQuotationBranch,
          required: this.isQuotationBranch,
        }
      }
      if (column.property === 'productId') {
        return { ...column, disabled: !!this.rowData.productId }
      }
      return column;
    });
  }

  private loadDefaultData(): void {
    this.headerData = {
      customerId:           '',
      customerIdDisabled:   '',
      paymentTerms:         '001',
      financialDiscount:    0,
      freightPaymentTerms:  '001',
      cargoType:            'BT',
      freightCost:          0,
      maxLoad:              0,
      palletPattern10x1:    150,
      palletPattern30x1:    50,
      palletPattern25kg:    50,
      transportationMode:   'R',
      freightResponsible:   false,
      customerVehicle:      false,
      palletReturn:         false,
    };
    this.rows = [
    {
      item: '01',
      amount: 1,
      fobBasePrice: 0,
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

  private async saveRows2Copy(): Promise<any> {
    if (!this.copyModalHeaderData.loadingLocation || !this.copyModalHeaderData.customerId) {
      this.poNotification.warning('Preencha todos os campos obrigatórios: Unidade de Carregamento, Cliente.')
      return null;
    }
    this.headerData.loadingLocation = this.copyModalHeaderData.loadingLocation;
    this.headerData.customerId = this.copyModalHeaderData.customerId;
    this.headerData.budgetStatus = this.copyModalHeaderData.loadingLocation === '01010001' ? 'CP' : 'PP';
    if (this.tableCopy.getSelectedRows().length <= 0) {
      this.modalCopy.close();
      return null;
    }
    this.isHideLoading = false;
    let item = 0;
    const bkpRows = this.rows.map(item => ({ ...item }));
    this.rows = [];
    for (const row of this.tableCopy.getSelectedRows()) {
      const newPriceRow = await this.getItemPriceInfo(row);
      if (!newPriceRow) {
        continue;
      }
      item++;
      newPriceRow.item = item.toString().padStart(2, '0');
      delete newPriceRow.$selected;
      delete newPriceRow.tes;
      this.rows = [...this.rows, newPriceRow];
    }
    await this.saveForm(true,bkpRows);
    await this.fillCustomerData();
    this.modalCopy.close();
    if (this.rows.length === 0) {
      this.rows = bkpRows.map(item => ({ ...item }));
    }
    this.isHideLoading = true;
  }

  public destinationState(): string {
    return this.headerData.destinationState ?? '';
  }

  public cityServiceWrapper = {
    getFilteredItems: (filteredParams: PoLookupFilteredItemsParams): Observable<any> => {
      const enhancedParams = {
        ...filteredParams,
        filterParams: {
          ...filteredParams.filterParams,
          state: this.headerData.destinationState || ''
        }
      };
      return this.cityService.getFilteredItems(enhancedParams);
    },  
    getObjectByValue: (value: string): Observable<any> => {
      return this.cityService.getObjectByValue(this.headerData.destinationState+value);
    }
  };

  private async updateFreightCost(silent: boolean = false): Promise<void> {
    const loadingLocation = this.headerData.loadingLocation;
    const destinationState = this.headerData.destinationState;
    const destinationCity = this.headerData.destinationCity;
    const totalWeight = this.totalLoadWeight;
    const body = {
      filialOrigem: loadingLocation,
      cidadeDestino: destinationCity,
      estadoDestino: destinationState,
      pesoTotal: totalWeight,
    }
    const transportationMode = this.headerData.transportationMode === 'M' ? 'maritimo' : 'rodoviario';
    if (this.headerData.freightType !== 'C' || this.headerData.freightResponsible) {
      return;
    }
    try {
      const res: any = await firstValueFrom(this.api.post(`portal-do-representante/frete/valor/` + transportationMode, body, loadingLocation));
      if (res.success) {
        if (this.headerData.freightCost !== res.valorFrete) {
          this.headerData.freightCost = res.valorFrete;
          //if (!silent) {
          //  this.poNotification.success('Custo de frete atualizado.');
          //}
        }
        if (this.headerData.transportationMode === 'M') {
          this.headerData.maxLoad = res.pesoMaximo ?? this.headerData.maxLoad;
          this.headerData.containerType = res.tipoContainer ?? this.headerData.containerType;
        }
      } else {
        this.headerData.freightCost = 0;
        if (!silent) {
          this.poNotification.warning('Custo de frete não encontrado: ' + res.message);
        }
      }
    } catch (error: any) {
      if (!silent) {
        this.poNotification.error('Erro ao atualizar custo de frete: ' + error.message);
      }
    }
  }

}
