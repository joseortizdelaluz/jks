import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { IEstado, IPais } from '../models/generic.models';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private _urlApi: string = '/clientes';
  constructor(
    private apiService: ApiService,
  ) { }

  getCustomers(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  createCustomer(customer: any){
    return this.apiService.postRequest(this._urlApi, customer);
  }

  getCustomer(customerId: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${customerId}?curtomer_id=${customerId}`);
  }

  updateCustomer(customerId: number, customer: any){
    return this.apiService.patchRequest(`${this._urlApi}/${customerId}`, customer);
  }

  deleteCustomer(customerId: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${customerId}`);
  }

  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        regimenes: response.regimenes,
        usos_cfdi: response.usos_cfdi,
        paises: response.paises.map((p: IPais) => p),
        estados: response.estados.map((e: IEstado) => e),
      };
      return result;
    }));
  }
}
