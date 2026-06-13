import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, firstValueFrom, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}
  
  public baseUrl = 'http://192.168.100.252:8080/rest/portal-do-representante';
  
  private restCredentials: any = {
    user: 'admin',
    password: 'SERVCONSULT25'
  }
  
  private defaultHeaders: any = {
    'Content-Type': 'application/json',
    'Accept': 'charset=utf8',
  };

  get<T>(endpoint: string, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    return from(this.getRestToken()).pipe(
      switchMap(token => {
        options.headers = this.processHeaders(options.headers, tenantId, token);
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
      })
    );
  }

  post<T>(endpoint: string, body: any, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    return from(this.getRestToken()).pipe(
      switchMap(token => {
        options.headers = this.processHeaders(options.headers, tenantId, token);
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options);
      })
    );
  }

  put<T>(endpoint: string, body: any, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    return from(this.getRestToken()).pipe(
      switchMap(token => {
        options.headers = this.processHeaders(options.headers, tenantId, token);
        return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options);
      })
    );
  }

  delete<T>(endpoint: string, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    return from(this.getRestToken()).pipe(
      switchMap(token => {
        options.headers = this.processHeaders(options.headers, tenantId, token);
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
      })
    );
  }

  postToken<T>(endpoint: string, body: any, tenantId: string = '01010001', options: {
    headers?: { [header: string]: string | string[] },
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  } = {}): Observable<T> {
    const baseUrl = this.baseUrl.replaceAll('/portal-do-representante', '');
    return this.http.post<T>(`${baseUrl}/${endpoint}`, body, options);
  }

  private processHeaders(headers: { [header: string]: string | string[] } | undefined, tenantId: string, token: string): { [header: string]: string | string[] } {
    return {
      ...this.defaultHeaders,
      'tenantId': '10,'+tenantId,
      'Authorization': `Bearer ${token}`,
      ...(headers || {})
    };
  }

  private async getRestToken(): Promise<any> {
    const currentToken = sessionStorage.getItem('restToken')
    const tokenExpirationDate = sessionStorage.getItem('restTokenExpirationDate') ?? '';
    const tokenExpirationTime = Number(sessionStorage.getItem('restTokenExpirationTime') ?? '0');
    const refreshToken = sessionStorage.getItem('restRefreshToken');
    const refreshTokenExpirationDate = sessionStorage.getItem('restRefreshTokenExpirationDate') ?? '';
    let response: any;
    if (!currentToken || (tokenExpirationDate < this.currentDateTime()[0] || (tokenExpirationDate === this.currentDateTime()[0] && tokenExpirationTime < this.currentDateTime()[1]))) {
      sessionStorage.removeItem('restToken');
      sessionStorage.removeItem('restTokenExpirationDate');
      sessionStorage.removeItem('restTokenExpirationTime');
      sessionStorage.removeItem('restRefreshToken');
      sessionStorage.removeItem('restRefreshTokenExpirationDate');
      if (!!refreshToken && refreshTokenExpirationDate === this.currentDateTime()[0]) {
        response = await firstValueFrom(this.postToken('api/oauth2/v1/token', {}, '01010001', {
          params: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }
        }));
      } else {
        response = await firstValueFrom(this.postToken('api/oauth2/v1/token', {}, '01010001', {
          params: {
            grant_type: 'password',
            username: this.restCredentials.user,
            password: this.restCredentials.password,
          }
        }));
      }
      if (response.access_token) {
        sessionStorage.setItem('restToken', response.access_token);
        sessionStorage.setItem('restTokenExpirationDate', this.currentDateTime()[0]);
        sessionStorage.setItem('restTokenExpirationTime', String(this.currentDateTime()[1] + response.expires_in));
        sessionStorage.setItem('restRefreshToken', response.refresh_token);
        sessionStorage.setItem('restRefreshTokenExpirationDate', this.currentDateTime()[0]);
      }
      return response.access_token;
    } else {
      return currentToken;
    }
  }

  private currentDateTime(): Array<any> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours() * 3600;
    const minutes = now.getMinutes() * 60;
    const seconds = now.getSeconds();
    const formattedDate = `${year}${month}${day}`;
    const formattedTime = hours + minutes + seconds;
    return [formattedDate, formattedTime];
  }

}