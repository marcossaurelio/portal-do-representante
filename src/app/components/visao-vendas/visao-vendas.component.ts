import { Component, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { PoPageModule, PoLoadingModule, PoChartModule, PoChartSerie, PoChartType, PoWidgetModule, PoChartLabelFormat, PoPopupAction, PoDatepickerModule, PoButtonModule } from '@po-ui/ng-components';
import { PoChartOptions, PoChartDataLabel, PoNotificationService } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { LOCALE_ID } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

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

  constructor(private api: ApiService, private poNotification: PoNotificationService) {}

  public isHideLoading: boolean = true;
  public loadingText: string = 'Carregando';
  public today: Date = new Date();
  public startDate: Date = new Date(this.today.getFullYear()-1, 0, 1);
  public endDate: Date = this.today;
  public months: Array<string> = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  public years: Array<string> = this.getYearsBetween(new Date('2023-01-01'), new Date('2025-12-31'));;

  // Faturamento x Período
  public revenueOverTimeTitle: string = 'Faturamento x Período (R$)';
  public revenueOverTimeOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    }
  };
  public revenueOverTime: Array<PoChartSerie> = [];


  // Histórico de Faturamento
  public revenueHistoryTitle: string = 'Histórico de Faturamento (R$)';
  public revenueHistoryOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    },
    legend: false
  };
  public revenueHistory: Array<PoChartSerie> = [];


  // Categorias de Clientes
  public customerCategoriesTitle: string = 'Categorias de Clientes (%)';
  public customerCategoriesOptions: PoChartOptions = {
    roseType: false,
    borderRadius: 6,
  };
  public customerCategoriesDataLabel: PoChartDataLabel = {
    fixed: true,
  }
  public customerCategories: Array<PoChartSerie> = [
    { label: 'Varejo',            data: 22, color: '#045B8F' },
    { label: 'Atacado',           data: 16  },
    { label: 'Atacarejo',         data: 15  },
    { label: 'Cesta Básica',      data: 14  },
    { label: 'Charqueadas',       data: 13  },
    { label: 'Distribuidor',      data: 13  },
    { label: 'Ind Alimentos',     data: 9   },
    { label: 'Ind Limpeza',       data: 8   },
    { label: 'Food Service',      data: 8   },
    { label: 'Ind Ração Animal',  data: 5   },
    { label: 'Ind Geral',         data: 4   },
    { label: 'Ind Textil',        data: 3   },
    { label: 'Agua/Efluentes',    data: 2   },
    { label: 'Pecuaristas/Avicultores',  data: 1   },
  ];


  // Crescimento das Categorias por Produto
  public productCategoriesEvolutionTitle: string = 'Crescimento da Categoria por Produto (R$)';
  public productCategoriesEvolutionItems: Array<string> = [
    'Water',
    'Fruit Juice',
    'Coffee',
    'Cola drinks',
    'Pils',
    'Tea',
  ];
  public productCategoriesEvolution: Array<PoChartSerie> = [
    { label: '2024', data: [86.5, 51.3, 44.6, 39.5, 27.6, 27.3], color: '#045B8F' },
    { label: '2025', data: [86.1, 52.1, 47.3, 37.8, 29.8, 28.5] }
  ];
  public productCategoriesEvolutionOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    },
  };
  public productCategoriesEvolutionType: PoChartType = PoChartType.Bar;
  

  async ngOnInit() {
    this.isHideLoading = false;
    this.revenueOverTime      = await this.loadRevenueOverTimeData()
    this.revenueHistory       = await this.loadRevenueHistoryData()
    this.customerCategories   = await this.loadCustomerCategoriesData()
    this.isHideLoading = true;
  }


  public onChangeDate(event: any) {
    console.log('Data selecionada:', this.today.toString());
  }

  public stringToDate(dateString: string): Date {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(5, 7);
    const day = dateString.slice(8, 10);
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  private getYearsBetween(startDate: Date, endDate: Date): Array<string> {
    const years: string[] = [];
    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  }

  private async loadRevenueOverTimeData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = {}
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/dashboard/faturamento-x-periodo', body))
      data = res.anos.map((ano: any) => {
        return {
          label: ano.ano,
          data: ano.meses,
          type: PoChartType.Column,
        }
      });
      data[0].color = '#045B8F'
    } catch (error) {
      this.poNotification.error('Erro ao carregar os dados de Faturamento x Período.');
    }
    return data
  }
  
  private async loadRevenueHistoryData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = {}
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/dashboard/historico-faturamento', body))
      data = [
        { data: res.valores, type: PoChartType.Column, color: '#045B8F'},
        { data: res.valores, type: PoChartType.Line},
      ];
    } catch (error) {
      this.poNotification.error('Erro ao carregar os dados de Histórico de Faturamento.');
    }
    return data
  }

  private async loadCustomerCategoriesData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = {}
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/dashboard/categorias-clientes', body))
      data = res.categorias.map((categoria: any) => {
        return {
          label: categoria.categoria,
          data: categoria.percentual,
        }
      });
      data[0].color = '#045B8F'
    } catch (error) {
      this.poNotification.error('Erro ao carregar os dados de Categorias de Clientes.');
    }
    return data
  }
  
}
