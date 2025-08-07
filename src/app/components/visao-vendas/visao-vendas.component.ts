import { Component, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { PoPageModule, PoLoadingModule, PoChartModule, PoChartSerie, PoChartType, PoChartOptions, PoChartLabelFormat, PoPopupAction } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

@Component({
  selector: 'app-visao-vendas',
  imports: [
    PoPageModule,
    PoLoadingModule,
    PoChartModule,
  ],
  templateUrl: './visao-vendas.component.html',
  styleUrl: './visao-vendas.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-VR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }
  ]
})
export class VisaoVendasComponent {

  constructor(private api: ApiService) {}

  public isHideLoading: boolean = true;
  public loadingText: string = 'Carregando';
  public sellingEvolution: any = {
    title: 'Evolução de Vendas (R$)',
    type: PoChartType.Line,
    options: {
      axis: {
        minRange: 6,
        maxRange: 40,
        gridLines: 6,
        labelType: PoChartLabelFormat.Currency
      },
    },
    dataLabel: { fixed: false },
    categories: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    series: [
      { label: '2024', data: [0, 32000, 28000, 35000, 40000.35, 32000, 38000, 42000, 45000, 48000, 50000, 52000] },
      { label: '2025', data: [45000, 30000, 25000, 30000, 35000, 30000, 35000, 40000, 42000, 45000, 47000, 49000] } 
    ]
  }

  ngOnInit() {

  }

}
