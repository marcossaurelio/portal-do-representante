import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PoLookupFilter, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PoNotificationService } from '@po-ui/ng-components';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService implements PoLookupFilter {

  constructor(private api: ApiService, private poNotification: PoNotificationService, private http: HttpClient) { }

  getFilteredItems(filteredParams: PoLookupFilteredItemsParams): Observable<any> {
    const { filterParams, advancedFilters, ...restFilteredItemsParams } = filteredParams;
    const params = { ...restFilteredItemsParams, ...filterParams, ...advancedFilters };
    let endpoint = 'portal-do-representante/clientes?page=' + params.page + '&pageSize=' + params.pageSize + '&sellerId=' + localStorage.getItem('sellerId');
    endpoint += !!params.filter ? '&filter=' + params.filter : '';
    return this.api.get(endpoint);
  }

  getObjectByValue(value: string): Observable<any> {
    const endpoint = `portal-do-representante/clientes/${value}?sellerId=${localStorage.getItem('sellerId')}`;
    return this.api.get(endpoint).pipe(
      tap((res: any) => {
        if (!res.success) {
          this.poNotification.warning(res.message + ': ' + res.fix);
        }
      })
    );
  }

  public async getCustomerData(customerId: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(this.api.get( `portal-do-representante/clientes/${customerId}?sellerId=${localStorage.getItem('sellerId')}`));
      if (res?.success) {
        return {
          destinationState: res.estado,
          destinationCity: res.municipio,
          customerHasIE: !!res.ie,
          customerCategory: res.categoria,
        }
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }

  public async getCustomerPublicData(cnpj: string): Promise<any> {
    const endpoint: string = 'portal-do-representante/clientes/dados-publicos/';
    try {
      const res: any = await firstValueFrom(this.api.get( endpoint + cnpj));
      return res;
    } catch (error: any) {
      return {message: error};
    }
  }

  public async createCustomer(customerData: any): Promise<any> {
    const endpoint: string = 'portal-do-representante/clientes/incluir';
    const body: any = {
      cnpj:             customerData.cnpj                   ?? '',
      razaoSocial:      customerData.name                   ?? '',
      nomeFantasia:     customerData.fantasyName            ?? '',
      endereco:         customerData.address                ?? '',
      estado:           customerData.state                  ?? '',
      municipio:        customerData.city                   ?? '',
      bairro:           customerData.neighborhood           ?? '',
      cep:              customerData.zipCode                ?? '',
      ddd:              customerData.ddd                    ?? '',
      telefone:         customerData.phone                  ?? '',
      email:            customerData.email                  ?? '',
      categoria:        customerData.category               ?? '',
      observacao:       customerData.observation            ?? '',
      vendedor:         localStorage.getItem('sellerId')    ?? '',
      ie:               customerData.ie                     ?? '',
      tipo:             customerData.type                   ?? '',
      simplesNacional:  customerData.simplesNacional        ? '1' : '2',
      contribuinte:     customerData.hasIe                  ? '1' : '2',
    };
    try {
      const res: any = await firstValueFrom(this.api.post(endpoint, body));
      return res;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

}
