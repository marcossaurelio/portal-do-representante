import { Component, DEFAULT_CURRENCY_CODE, ViewChild } from '@angular/core';
import { PoPageModule, PoLoadingModule, PoChartModule, PoChartSerie, PoChartType, PoWidgetModule, PoChartLabelFormat, PoPopupAction, PoDatepickerModule, PoButtonModule, PoDynamicModule, PoPageSlideModule } from '@po-ui/ng-components';
import { PoChartOptions, PoChartDataLabel, PoNotificationService, PoDynamicFormField, ForceOptionComponentEnum, PoDynamicFormFieldChanged, PoDynamicFormValidation, PoPageSlideFooterComponent, PoComboFilter } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { FieldsService } from '../../services/fields.service';
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
    PoButtonModule,
    PoDynamicModule,
    PoPageSlideModule,
],
  templateUrl: './visao-vendas.component.html',
  styleUrl: './visao-vendas.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }
  ]
})
export class VisaoVendasComponent {

  constructor(private api: ApiService, private poNotification: PoNotificationService, private fieldsService: FieldsService) {}

  @ViewChild('pageSlide') pageSlide: any;

  public isHideLoading: boolean = true;
  public loadingText: string = 'Carregando';
  public today: Date = new Date();
  public startDate: Date = new Date(this.today.getFullYear()-1, 0, 1);
  public endDate: Date = this.today;
  public months: Array<string> = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  public pageSlideTitle: string = 'Filtros';
  public pageSlideSubtitle: string = 'Ajuste e salve os filtros para atualizar os gráficos.';
  public filtersFields: Array<PoDynamicFormField> = [];
  public validateFiltersFields: Array<string> = [];
  public yearsOptions: any = [];

  public pageActions: Array<PoPopupAction> = [
    { label: 'Filtros', action: () => { this.pageSlide.open() }, icon: 'an an-funnel' },
  ]

  // Faturamento x Período
  public revenueOverTimeTitle: string = 'Faturamento x Período (R$)';
  public revenueOverTimeOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    }
  };
  private revenueTimeDefaultData: Array<PoChartSerie> = [
    { label: '2025', data: [0,0,0,0,0,0,0,0,0,0,0,0], type: PoChartType.Column, color: '#045B8F' },
  ];
  public revenueOverTime: Array<PoChartSerie> = this.revenueTimeDefaultData;


  // Histórico de Faturamento
  public revenueHistoryTitle: string = 'Histórico de Faturamento (R$)';
  public revenueHistoryOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    },
    legend: false
  };
  public revenueHistoryCategories: Array<string> = []
  private revenueHistoryDefaultData: Array<PoChartSerie> = [
    { data: [0,0,0,0,0,0,0,0,0,0,0,0], type: PoChartType.Column, color: '#045B8F'},
    { data: [0,0,0,0,0,0,0,0,0,0,0,0], type: PoChartType.Line},
  ];
  public revenueHistory: Array<PoChartSerie> = this.revenueHistoryDefaultData


  // Categorias de Clientes
  public customerCategoriesTitle: string = 'Categorias de Clientes (%)';
  public customerCategoriesOptions: PoChartOptions = {
    roseType: false,
    borderRadius: 6,
  };
  public customerCategoriesDataLabel: PoChartDataLabel = {
    fixed: true,
  }
  private customerCategoriesDefaultData: Array<PoChartSerie> = [
    { label: 'Categoria', data: 0, color: '#045B8F' },
  ];
  public customerCategories: Array<PoChartSerie> = this.customerCategoriesDefaultData;


  // Crescimento das Categorias por Produto
  public productCategoriesEvolutionTitle: string = 'Crescimento da Categoria por Produto (R$)';
  public productCategoriesEvolutionItems: Array<string> = [];
  private productCategoriesEvolutionDefaultData: Array<PoChartSerie> = [
    { label: '2025', data: [0,0,0,0,0,0,0,0,0,0,0,0], type: PoChartType.Column, color: '#045B8F' },
  ];
  public productCategoriesEvolution: Array<PoChartSerie> = this.productCategoriesEvolutionDefaultData;
  public productCategoriesEvolutionOptions: PoChartOptions = {
    axis: {
      labelType: PoChartLabelFormat.Currency,
    },
  };
  public productCategoriesEvolutionType: PoChartType = PoChartType.Bar;

  public filters: any = {
    years: [new Date().getFullYear().toString(), (new Date().getFullYear() - 1).toString()],
    months: ['01','02','03','04','05','06','07','08','09','10','11','12'],
    branches: this.fieldsService.getBranches.map((branch: any) => branch.id),
  };

  async ngOnInit() {
    this.isHideLoading = false;
    this.filtersFields = this.getFiltersFields();
    this.validateFiltersFields = this.filtersFields
      .map(field => field.property);
    await this.refreshChartsData();
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
    const body: any = this.buildFiltersBody();
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
      this.poNotification.warning('Não foram encontrados dados com os filtros selecionados.');
      this.pageSlide.open();
      //data = this.revenueTimeDefaultData;
    }
    return data
  }
  
  private async loadRevenueHistoryData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = this.buildFiltersBody();
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/dashboard/historico-faturamento', body))
      this.revenueHistoryCategories = res.anos;
      data = [
        { data: res.valores, type: PoChartType.Column, color: '#045B8F'},
        { data: res.valores, type: PoChartType.Line},
      ];
    } catch (error) {
      //data = this.revenueHistoryDefaultData;
    }
    return data
  }

  private async loadCustomerCategoriesData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = this.buildFiltersBody();
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
      //data = this.customerCategoriesDefaultData;
    }
    return data
  }

  private async loadProductCategoriesEvolutionData(): Promise<Array<PoChartSerie>> {
    let data: Array<PoChartSerie> = [];
    const body: any = this.buildFiltersBody();
    try {
      const res: any = await firstValueFrom(this.api.post('portal-do-representante/dashboard/categorias-produtos', body))
      this.productCategoriesEvolutionItems = res.produtos;
      data = res.anos.map((ano: any) => {
        return {
          label: ano.ano,
          data: ano.valores,
        }
      });
      data[0].color = '#045B8F'
    } catch (error) {
      //data = this.productCategoriesEvolutionDefaultData;
    }
    return data;
  }

  public getFiltersFields(): Array<PoDynamicFormField> {
    const fields: Array<PoDynamicFormField> = [
      {
        property: 'years',
        label: 'Anos',
        visible: true,
        required: false,
        showRequired: false,
        disabled: false,
        noAutocomplete: true,
        gridColumns: 12,
        optionsService: this.api.baseUrl + '/portal-do-representante/dashboard/filtros/anos',
        optionsMulti: true,
        hideSearch: true,
      },
      {
        property: 'months',
        label: 'Meses',
        visible: true,
        required: false,
        showRequired: false,
        disabled: false,
        noAutocomplete: true,
        gridColumns: 12,
        options: [
          { value: '01', label: 'Janeiro'   },
          { value: '02', label: 'Fevereiro' },
          { value: '03', label: 'Março'     },
          { value: '04', label: 'Abril'     },
          { value: '05', label: 'Maio'      },
          { value: '06', label: 'Junho'     },
          { value: '07', label: 'Julho'     },
          { value: '08', label: 'Agosto'    },
          { value: '09', label: 'Setembro'  },
          { value: '10', label: 'Outubro'   },
          { value: '11', label: 'Novembro'  },
          { value: '12', label: 'Dezembro'  },
        ],
        optionsMulti: true,
        hideSearch: true,
      },
      {
        property: 'branches',
        label: 'Filiais',
        visible: true,
        required: false,
        showRequired: false,
        disabled: false,
        noAutocomplete: true,
        gridColumns: 12,
        options: this.fieldsService.getBranches,
        optionsMulti: true,
        fieldLabel: 'name',
        fieldValue: 'id',
      },
      {
        property: 'sellers',
        label: 'Vendedores',
        visible: this.fieldsService.isInternalUser,
        required: false,
        showRequired: false,
        disabled: !this.fieldsService.isInternalUser,
        noAutocomplete: true,
        gridColumns: 12,
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
      {
        property: 'products',
        label: 'Produtos',
        visible: true,
        required: false,
        showRequired: false,
        disabled: false,
        noAutocomplete: true,
        gridColumns: 12,
        searchService: this.api.baseUrl + '/portal-do-representante/produtos',
        columns: [
          { property: 'codigo',   label: 'Código' },
          { property: 'descricao',label: 'Descrição' },
          { property: 'grupo',    label: 'Grupo' },
        ],
        multiple: true,
        fieldLabel: 'descricao',
        fieldValue: 'codigo',
      }
    ]
    return fields;
  }

  public onChangeFilters(changedValue: PoDynamicFormFieldChanged): PoDynamicFormValidation  {
    let validation: PoDynamicFormValidation = { fields: this.getFiltersFields() };
    return validation;
  }

  private async refreshChartsData() {
    [
      this.revenueOverTime,
      this.revenueHistory,
      this.customerCategories,
      this.productCategoriesEvolution
    ] = await Promise.all([
      this.loadRevenueOverTimeData(),
      this.loadRevenueHistoryData(),
      this.loadCustomerCategoriesData(),
      this.loadProductCategoriesEvolutionData()
    ]);
  }

  public async applyFilters() {
    this.pageSlide.close();
    await this.refreshChartsData();
  }

  private buildFiltersBody(): any {
    const body: any = {
      anos:       this.filters.years      ?? [],
      meses:      this.filters.months     ?? [],
      filiais:    this.filters.branches   ?? [],
      produtos:   this.filters.products   ?? [],
      vendedores: !this.fieldsService.isInternalUser ? [localStorage.getItem('sellerId')] : (this.filters.sellers ?? []),
    };
    return body;
  }

}
