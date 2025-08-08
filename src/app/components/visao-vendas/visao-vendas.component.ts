import { Component, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { PoPageModule, PoLoadingModule, PoChartModule, PoChartSerie, PoChartType, PoWidgetModule, PoChartLabelFormat, PoPopupAction, PoDatepickerModule, PoButtonModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { LOCALE_ID } from '@angular/core';

@Component({
  selector: 'app-visao-vendas',
  imports: [
    PoPageModule,
    PoLoadingModule,
    PoFieldModule,
    PoChartModule,
    PoWidgetModule,
    PoDatepickerModule,
    PoButtonModule
],
  templateUrl: './visao-vendas.component.html',
  styleUrl: './visao-vendas.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }
  ]
})
export class VisaoVendasComponent {

  constructor(private api: ApiService) {}

  public isHideLoading: boolean = true;
  public loadingText: string = 'Carregando';
  public today: Date = new Date();
  public startDate: Date = new Date(this.today.getFullYear()-1, 0, 1);
  public endDate: Date = this.today;
  public sellingEvolution: any = {
    title: 'Evolução de Faturamento (R$)',
    type: PoChartType.Line,
    options: {
      axis: {
        gridLines: 6,
        labelType: PoChartLabelFormat.Currency
      },
      dataZoom: true,
      legend: true,
    },
    dataLabel: { fixed: false },
    categories: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    series: [
      { label: '2024', data: [0, 32000, 28000, 35000, 40000.35, 32000, 38000, 42000, 45000, 48000, 50000, 52000] },
      { label: '2025', data: [45000, 30000, 25000, 30000, 35000, 37000, 35000, 40000, 42000, 45000, 47000, 49000] } 
    ],
    customActions: [
      { label: 'Visão anual',   action: this.setYearlyVision.bind(this),  visible: true },
      { label: 'Visão mensal',  action: this.setMonthlyVision.bind(this), visible: false }
    ]
  }
  public sellingByProduct: any = {
    title: 'Faturamento Top Produtos (R$)',
    options: {
      roseType: true,
      borderRadius: 8,
      legend: true,
    },
    series: [
      { label: 'SAL REFINADO IODADO 30X1KG - ITA'.slice(13,33),         data: 2500.10,  tooltip: 'SAL REFINADO IODADO 30X1KG - ITA' },
      { label: 'SAL REFINADO IODADO 30X1KG - DUNORTE'.slice(13,33),     data: 2135.99,  tooltip: 'SAL REFINADO IODADO 30X1KG - DUNORTE' },
      { label: 'SAL REFINADO IODADO 30X1KG - PEREIRA'.slice(13,33),     data: 1894.57,  tooltip: 'SAL REFINADO IODADO 30X1KG - PEREIRA' },
      { label: 'SAL REFINADO IODADO 10X1KG - DUNORTE'.slice(13,33),     data: 1554.50,  tooltip: 'SAL REFINADO IODADO 10X1KG - DUNORTE' },
      { label: 'SAL REFINADO IODADO 10X1KG - ITA'.slice(13,33),         data: 1334.35,  tooltip: 'SAL REFINADO IODADO 10X1KG - ITA' },
      { label: 'SAL REFINADO IODADO 10X1KG - ITA / PAPEL'.slice(13,33), data: 1300.35,  tooltip: 'SAL REFINADO IODADO 10X1KG - ITA' },
      { label: 'SAL REFINADO IODADO 25KG - ITA'.slice(13,33),           data: 1235.35,  tooltip: 'SAL REFINADO IODADO 10X1KG - ITA' },
      { label: 'SAL REFINADO S/IODO 25KG - ITA'.slice(13,33),           data: 1100.35,  tooltip: 'SAL REFINADO IODADO 10X1KG - ITA' },
      { label: 'SAL REFINADO S/IODO 10x1kg - ITA'.slice(13,33),         data: 1001.35,  tooltip: 'SAL REFINADO IODADO 10X1KG - ITA' },
      { label: 'Outros',                                                data: 1500.65,   tooltip: 'Outros', color: 'gray'},
    ]
  };

  public sellingByCustomer: any = {
    title: 'Faturamento Top Clientes (R$)',
    options: {
      roseType: true,
      borderRadius: 8,
    },
    series: [
      { label: 'M C SERVICOS TECNOLOGIA'.slice(0,20),                       data: 8750.10,  tooltip: 'M C SERVICOS TECNOLOGIA' },
      { label: 'SUPERMERCADO SAO JUDAS III LTDA'.slice(0,20),               data: 6842.99,  tooltip: 'SUPERMERCADO SAO JUDAS III LTDA' },
      { label: 'JW SANTOS E BARRETO MINIMERCADO UMUARAMA LTDA'.slice(0,20), data: 6752.57,  tooltip: 'JW SANTOS E BARRETO MINIMERCADO UMUARAMA LTDA' },
      { label: 'SERV SAL LTDA'.slice(0,20),                                 data: 6500.50,  tooltip: 'SERV SAL LTDA' },
      { label: 'PFM COMERCIAL LTDA'.slice(0,20),                            data: 6200.35,  tooltip: 'PFM COMERCIAL LTDA' },
      { label: 'MCONSULT LTDA'.slice(0,20),                                 data: 4500.35,  tooltip: 'MCONSULT LTDA' },
      { label: 'EMPRESA COMERCIAL LTDA'.slice(0,20),                        data: 4200.35,  tooltip: 'EMPRESA COMERCIAL LTDA' },
      { label: 'EXEMPLO SA SAIS IODADOS LTDA'.slice(0,20),                  data: 4000.35,  tooltip: 'EXEMPLO SA SAIS IODADOS LTDA' },
      { label: 'ULTIMA SAIS LTDA'.slice(0,20),                              data: 3954.35,  tooltip: 'ULTIMA SAIS LTDA' },
      { label: 'Outros',                                                    data: 3542.65,   tooltip: 'Outros', color: 'gray'},
    ]
  };

  
  ngOnInit() {
    
  }

  private setYearlyVision() {
    this.sellingEvolution.categories = ['2021', '2022', '2023', '2024', '2025'];
    this.sellingEvolution.series = [
      { label: 'Vendas', data: [250000, 300000, 350000, 400000, 450000] }
    ];
    this.sellingEvolution.customActions[0].visible = false;
    this.sellingEvolution.customActions[1].visible = true;
  }

  private setMonthlyVision() {
    this.sellingEvolution.categories = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.sellingEvolution.series = [
      { label: '2024', data: [0, 32000, 28000, 35000, 40000.35, 32000, 38000, 42000, 45000, 48000, 50000, 52000] },
      { label: '2025', data: [45000, 30000, 25000, 30000, 35000, 30000, 35000, 40000, 42000, 45000, 47000, 49000] } 
    ];
    this.sellingEvolution.customActions[0].visible = true;
    this.sellingEvolution.customActions[1].visible = false;
  }

  onChangeDate(event: any) {
    console.log('Data selecionada:', this.today.toString());
  }

  public stringToDate(dateString: string): Date {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(5, 7);
    const day = dateString.slice(8, 10);
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
}
