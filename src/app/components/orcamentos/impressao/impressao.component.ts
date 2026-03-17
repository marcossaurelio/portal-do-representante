import { Component } from '@angular/core';
import { PoPageModule, PoInfoModule, PoNotification, PoNotificationService, PoImageModule, PoDividerModule, PoInfoOrientation, PoTableModule, PoTableColumn } from '@po-ui/ng-components';
import { PoLoadingModule, PoButtonModule } from '@po-ui/ng-components';
import { Router, ActivatedRoute } from '@angular/router';
import { FieldsService } from '../../../services/fields.service';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { CustomerService } from '../../../services/domain/customer.service';

@Component({
  selector: 'app-impressao',
  imports: [
    PoPageModule,
    PoInfoModule,
    PoImageModule,
    PoDividerModule,
    PoLoadingModule,
    PoTableModule,
    PoButtonModule,
],
  templateUrl: './impressao.component.html',
  styleUrl: './impressao.component.css'
})
export class ImpressaoComponent {

  constructor(private router: Router, private route: ActivatedRoute, private fieldsService: FieldsService, private api: ApiService, private poNotification: PoNotificationService, private customerService: CustomerService) {}
  
  public title: string = 'Proposta';
  public subtitle: string = 'Detalhes do orçamento para impressão';
  public budgetId: string = '';
  public branchId: string = '';
  public budgetData: any = {};
  public infoOrientation: PoInfoOrientation = PoInfoOrientation.Vertical;
  public isHideLoading: boolean = true;

  private pbrPalletWeight: number = 35;
  private disposablePalletWeight: number = 19;

  public itemsFields: Array<PoTableColumn> = [
    //{ property: 'item',                 label: 'Item',        type: 'string', width: '5%' },
    { property: 'productDescription',   label: 'Produto',     type: 'string'    },
    { property: 'amount',               label: 'Quant.',      type: 'number'    },
    { property: 'unitPrice',            label: 'Valor Unit.', type: 'currency'  },
    { property: 'totalPrice',           label: 'Valor Total', type: 'currency'  },
  ];

  private async ngOnInit(): Promise<void> {
    this.isHideLoading = false;
    this.route.queryParams.subscribe(params => {
      this.budgetId = params['budget'] || '';
      this.branchId = params['branch'] || '';
    });
    this.title = `Proposta ${this.budgetId}`;
    this.subtitle = `Unidade de Carregamento ${this.fieldsService.getLoadingLocationNameById('SS')}`;
    if (!(await this.loadBudgetData(this.branchId, this.budgetId))) {
      this.isHideLoading = true;
      return;
    }
    await this.fillCustomerData();
    this.isHideLoading = true;
    await new Promise(resolve => setTimeout(resolve, 1000)); // aguarda 1,0s
    window.print();
  }

  private async loadBudgetData(branchId: string, budgetId: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get('portal-do-representante/orcamentos/dados?branchId='+branchId+'&budget='+budgetId, branchId));
      if (res) {
        this.budgetData = {
          branchId:                       res.filial                ?? '',
          loadingLocation:                res.unidadeCarregamento   ?? '',
          budgetId:                       res.orcamento             ?? '',
          budgetStatus:                   res.situacao              ?? '',
          customerId:                     (res.cliente ?? '') + (res.loja ?? ''),
          sellerId:                       res.vendedor              ?? '',
          sellerName:                     res.nomeVendedor          ?? '',
          paymentTerms:                   res.condPag               ?? '',
          paymentTermsDescription:        res.condPagDesc           ?? '',
          observation:                    res.observacao.trim()     ?? '',
          freightType:                    res.tipoFrete             ?? '',
          freightTypeDescription:         res.tipoFrete === 'C' ? 'CIF' : res.tipoFrete === 'F' ? 'FOB' : '',
          freightPaymentTerms:            res.condPagFrete          ?? '',
          freightPaymentTermsDescription: res.condPagFreteDesc      ?? '',
          freightCost:                    res.valorFrete            ?? 0,
          cargoType:                      res.tipoCarga             ?? '',
          cargoTypeDescription:           this.fieldsService.getCargoTypeById(res.tipoCarga).toUpperCase() ?? '',
          unloadingType:                  res.tipoDescarga          ?? '',
          unloadingCost:                  res.valorDescarga         ?? 0,
          maxLoad:                        res.cargaMaxima           ?? 0,
          palletPattern10x1:              res.paletizacao10x1       ?? 150,
          palletPattern30x1:              res.paletizacao30x1       ?? 50,
          palletPattern25kg:              res.paletizacao25kg       ?? 50,
          transportationMode:             res.tipoVeiculo           ?? '',
          freightResponsible:             res.responsavelFrete      ?? false,
          customerVehicle:                res.veiculoProprio        ?? false,
          destinationState:               res.estadoDestino         ?? '',
          destinationCity:                res.cidadeDestino         ?? '',
          destinationCityName:            res.nomeCidadeDestino     ?? '',
          financialDiscount:              res.descontoFinanceiro    ?? 0,
          palletReturn:                   res.devolucaoPalete       ?? false,
          rows:                           res.itens.map((item: any) => ({
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
            //comissionUnitValue:   item.valorUnitario * item.comissao / 100,
            //comissionTotalValue:  item.valorTotal * item.comissao / 100,
            productNetWeight:     item.pesoNeto,
            productGrossWeight:   item.pesoBruto,
            packagingFormat:      item.formatoEmbalagem,
          }))
        };
      }
    } catch (error: any) {
      this.poNotification.error('Erro ao carregar orçamento: ' + error.message);
      return null;
    }
    return true;
  }

  private async fillCustomerData(): Promise<void> {
    const customerData = await this.customerService.getCustomerData(this.budgetData.customerId);
    if (customerData) {
      this.budgetData.customerHasIE     = customerData.customerHasIE;
      this.budgetData.customerCategory  = customerData.customerCategory;
      this.budgetData.freightICMSPauta  = customerData.freightICMSPauta;
      this.budgetData.customerName      = customerData.customerName;
    } else {
      this.poNotification.warning('Erro ao carregar dados do cliente.');
    }
  }

  public onPrintClick(): void {

    window.print();
  }

  public get budgetTotalValue(): number {
    const totalValue = this.budgetData.rows.reduce((sum: number, row: any) => {
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
    const freightCost   = isNaN(Number(this.budgetData.freightCost))    ? 0 : this.budgetData.freightCost
    const unloadingCost = isNaN(Number(this.budgetData.unloadingCost))  ? 0 : this.budgetData.unloadingCost
    const totalValue = freightCost + unloadingCost
    return totalValue;
  }

  private get totalProductsNetWeight(): number {
    return this.budgetData.rows.reduce((sum: number, row: any) => {
      const netWeight = row.productNetWeight ?? 0;
      const amount = row.amount ?? 0;
      const weight = netWeight * amount;
      return sum + (weight ?? 0);
    }, 0);
  }

  public get overweightCost(): number {
    const netWeight = this.totalProductsNetWeight ?? 0;
    const maxLoad = this.budgetData.maxLoad ?? 0;
    const freightCostPerTon = this.budgetData.freightCost ?? 0;
    const overweightCost = netWeight >= maxLoad || netWeight <= 0 ? 0 : freightCostPerTon * (maxLoad/netWeight) - freightCostPerTon;
    return overweightCost;
  }

  public get budgetFreightTotalValue(): number {
    const maxLoad = this.budgetData.maxLoad ?? 0;
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
    const productsAmount10x1 = this.budgetData.rows.reduce((sum: number, row: any) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '10X1') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    const productsAmount30x1 = this.budgetData.rows.reduce((sum: number, row: any) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '30X1') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    const productsAmount25kg = this.budgetData.rows.reduce((sum: number, row: any) => {
      const packagingFormat = row.packagingFormat;
      if (packagingFormat === '25KG') {
        return sum + (Number(row.amount) ?? 0);
      }
      return sum;
    }, 0);
    return [productsAmount10x1, productsAmount30x1, productsAmount25kg];
  }

  public get palletsAmountPerPackagingFormat(): Array<number> {
    if (this.budgetData.cargoType === 'BT') {
      return [0,0,0];
    }
    const pallets10x1Amount = Math.ceil(this.productsAmountPerPackagingFormat[0]/(this.budgetData.palletPattern10x1 ?? 150));
    const pallets30x1Amount = Math.ceil(this.productsAmountPerPackagingFormat[1]/(this.budgetData.palletPattern30x1 ?? 50));
    const pallets25kgAmount = Math.ceil(this.productsAmountPerPackagingFormat[2]/(this.budgetData.palletPattern25kg ?? 50));
    return [pallets10x1Amount, pallets30x1Amount, pallets25kgAmount].map(item => isFinite(item) ? item : 0);
  }

  private get totalPalletsAmount(): number {
    return this.palletsAmountPerPackagingFormat[0] + this.palletsAmountPerPackagingFormat[1] + this.palletsAmountPerPackagingFormat[2];
  }

  private get totalPalletsWeight(): number {
    const palletUnitWeight = this.budgetData.cargoType.charAt(0) === 'P' ? this.pbrPalletWeight : this.budgetData.cargoType.charAt(0) === 'D' ? this.disposablePalletWeight : 0;
    const totalPalletsAmount = this.totalPalletsAmount;
    return totalPalletsAmount * palletUnitWeight;
  }

  private get totalProductsWeight(): number {
    return this.budgetData.rows.reduce((sum: number, row: any) => {
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

  public get budgetTotalValueWithFreightFormatted(): string {
    const totalValueWithFreight = this.budgetTotalValue + this.budgetFreightTotalValue;
    return totalValueWithFreight.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

}
