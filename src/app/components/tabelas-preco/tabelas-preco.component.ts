import { Component } from '@angular/core';
import { PoTableColumn, PoTableModule, PoTagType, PoLoadingModule, PoTableAction, PoNotificationModule, PoNotificationService } from '@po-ui/ng-components';
import { PoPageDynamicTableModule, PoPageDynamicSearchFilters, PoPageDynamicTableFilters } from '@po-ui/ng-templates';
import { PoPageDynamicTableCustomTableAction } from '@po-ui/ng-templates';
import { ApiService } from '../../services/api.service';
import { FieldsService } from '../../services/fields.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tabelas-preco',
  imports: [
    PoTableModule,
    PoPageDynamicTableModule,
    PoLoadingModule,
    PoNotificationModule,
  ],
  templateUrl: './tabelas-preco.component.html',
  styleUrl: './tabelas-preco.component.css'
})
export class TabelasPrecoComponent {

  constructor(private api: ApiService, private fieldsService: FieldsService, private poNotification: PoNotificationService) { }

  public isHideLoading: boolean = true;
  public isShowMoreLoading: boolean = false;
  public isShowMoreDisabled: boolean = false;
  public apiService: string = this.api.baseUrl + '/portal-do-representante/precificacao/tabelas';
  public tableHeight: number = 490;

  private activeDisclaimers: any = {};

  public columns: Array<PoPageDynamicTableFilters> = [
    { property: 'branchId',       visible: false,                 type: 'string',   width: '150px'  },
    { property: 'branchName',     label: 'Filial',                type: 'string',   width: '150px'  },
    { property: 'tableId',        label: 'Código',                type: 'string',   width: '100px'  },
    { property: 'locationId',     visible: false,                 type: 'string',   width: '150px'  },
    { property: 'locationName',   label: 'Unidade Carregamento',  type: 'string',   width: '200px'  },
    { property: 'description',    label: 'Descrição',             type: 'string',   width: '300px'  },
    { property: 'lastUpdate',     label: 'Última alteração',      type: 'date',     width: '150px'  },
    { property: 'hasFile',        visible: false,                 type: 'boolean',  width: '100px'  },
  ];

  public tableActions: Array<PoPageDynamicTableCustomTableAction> = [
    { label: 'Download',    action: this.downloadFile.bind(this),   icon: 'an an-download-simple',  disabled: (item: any) => !item.hasFile  },
  ];

  private async ngOnInit(): Promise<void> {
  }

  private async downloadFile(item: any): Promise<void> {
    const url = `${this.api.baseUrl}/portal-do-representante/precificacao/tabelas/download/${item.branchId + item.tableId}`;
    window.open(url, '_blank');
  }

}
