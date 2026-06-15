import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PoLookupFilter, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { PoNotificationService } from '@po-ui/ng-components';

@Injectable({
  providedIn: 'root'
})
export class PaymentTermsService implements PoLookupFilter {

  constructor(private api: ApiService, private poNotification: PoNotificationService) { }

  getFilteredItems(filteredParams: PoLookupFilteredItemsParams): Observable<any> {
    const { filterParams, advancedFilters, ...restFilteredItemsParams } = filteredParams;
    const params = { ...restFilteredItemsParams, ...filterParams, ...advancedFilters };
    let endpoint = 'condicoes?page=' + params.page + '&pageSize=' + params.pageSize;
    endpoint += !!params.filter ? '&filter=' + params.filter : '';
    return this.api.get(endpoint);
  }

  getObjectByValue(value: string): Observable<any> {
    const endpoint = `condicoes/${value}`;
    return this.api.get(endpoint).pipe(
      tap((res: any) => {
        if (!res.success) {
          this.poNotification.warning(res.message + ': ' + res.fix);
        }
      })
    );
  }

}
