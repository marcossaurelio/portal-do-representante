import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PoLookupFilter, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PoNotificationService } from '@po-ui/ng-components';

@Injectable({
  providedIn: 'root'
})
export class CityService implements PoLookupFilter {

  constructor(private api: ApiService, private poNotification: PoNotificationService) { }

  getFilteredItems(filteredParams: PoLookupFilteredItemsParams): Observable<any> {
    const { filterParams, advancedFilters, ...restFilteredItemsParams } = filteredParams;
    const params = { ...restFilteredItemsParams, ...filterParams, ...advancedFilters };
    let endpoint = 'portal-do-representante/cidades?page=' + params.page + '&pageSize=' + params.pageSize + '&state=' + params.state;
    endpoint += !!params.filter ? '&filter=' + params.filter : '';
    return this.api.get(endpoint);
  }

  getObjectByValue(value: string): Observable<any> {
    const endpoint = `portal-do-representante/cidades/${value}`;
    return this.api.get(endpoint).pipe(
      tap((res: any) => {
        if (!res.success) {
          this.poNotification.warning(res.message + ': ' + res.fix);
        }
      })
    );
  }

}
