import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}
  
  public baseUrl = 'http://192.168.100.249:8500';

  private defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'charset=utf8',
  };

  get<T>(endpoint: string, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    options.headers = this.processHeaders(options.headers, tenantId);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  post<T>(endpoint: string, body: any, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    options.headers = this.processHeaders(options.headers, tenantId);
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  put<T>(endpoint: string, body: any, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    options.headers = this.processHeaders(options.headers, tenantId);
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  delete<T>(endpoint: string, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    options.headers = this.processHeaders(options.headers, tenantId);
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  private processHeaders(headers: { [header: string]: string | string[] } | undefined, tenantId: string): { [header: string]: string | string[] } {
    return {
      ...this.defaultHeaders,
      'tenantId': '10,'+tenantId,
      ...(headers || {})
    };
  }

}