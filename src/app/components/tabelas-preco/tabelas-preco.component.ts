import { Component, ViewChild } from '@angular/core';
import { PoTableColumn, PoTableModule, PoTagType, PoLoadingModule, PoTableAction, PoNotificationModule, PoNotificationService, PoPageModule } from '@po-ui/ng-components';
import { PoPageDynamicTableModule, PoPageDynamicSearchFilters, PoPageDynamicTableFilters, PoPageDynamicTableComponent } from '@po-ui/ng-templates';
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
    PoPageModule
],
  templateUrl: './tabelas-preco.component.html',
  styleUrl: './tabelas-preco.component.css'
})
export class TabelasPrecoComponent {

  constructor(private api: ApiService, private fieldsService: FieldsService, private poNotification: PoNotificationService) { }

  public isHideLoading: boolean = true;
  public isShowMoreLoading: boolean = false;
  public isShowMoreDisabled: boolean = false;
  public apiService: string = 'precificacao/tabelas';
  public items: Array<any> = [];
  public tableHeight: number = 576;

  public columns: Array<PoTableColumn> = [
    { property: 'branchId',       visible: false,                 type: 'string',   width: '150px'  },
    { property: 'branchName',     label: 'Filial',                type: 'string',   width: '150px'  },
    { property: 'tableId',        label: 'Código',                type: 'string',   width: '100px'  },
    { property: 'locationId',     visible: false,                 type: 'string',   width: '150px'  },
    { property: 'locationName',   label: 'Unidade Carregamento',  type: 'string',   width: '200px'  },
    { property: 'description',    label: 'Descrição',             type: 'string',   width: '300px'  },
    { property: 'lastUpdate',     label: 'Última alteração',      type: 'date',     width: '150px'  },
    { property: 'hasFile',        visible: false,                 type: 'boolean',  width: '100px'  },
  ];

  public tableActions: Array<PoTableAction> = [
    { label: 'Download',    action: this.downloadFile.bind(this),   icon: 'an an-download-simple',  disabled: (item: any) => !item.hasFile  },
  ];

  public async ngOnInit() {
    this.isHideLoading = false;
    await this.getItems()
    this.isHideLoading = true;
  }

  private async getItems(): Promise<any> {
    const res: any = await firstValueFrom(this.api.get(this.apiService));
    this.items = res.items;
  }

  private async downloadFile(item: any): Promise<void> {
    this.isHideLoading = false;
    const endpoint = `precificacao/tabelas/download/${item.branchId + item.tableId}`;
    const response = await firstValueFrom(this.api.getFile(endpoint));
    const file = response.body ?? new Blob([], { type: 'application/pdf' });
    const pdf = file.type === 'application/pdf' ? file : new Blob([file], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getFileName(response) ?? `${item.branchId + item.tableId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    this.isHideLoading = true;
  }

  private getFileName(response: any): string | null {
    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition) {
      return null;
    }

    const encodedName = contentDisposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i)?.[1];
    if (encodedName) {
      return decodeURIComponent(encodedName.trim().replace(/^"|"$/g, ''));
    }

    return contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1].trim() ?? null;
  }

}
