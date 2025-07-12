import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CompanySelectExt } from '../models/company.model';
import { CustomerSelect } from '../models/customer.model';
import { IProductCotizacion } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private _urlApi: string = '/ventas';
  constructor(
    private apiService: ApiService
  ) { }

  gets(params: any = {}){
    return this.apiService.getRequest(this._urlApi, params);
  }

  get(id: number){
    return this.apiService.getRequest(`${this._urlApi}/${id}`);
  }

  loadCombosRoot(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_root`).pipe(map((response: any) => {
      const result: any = {
        empresas: response.empresas.map((e: CompanySelectExt) => e),
        clientes: response.clientes.map((c: CustomerSelect) => c),
      };
      return result;
    }));
  }
  
  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        empresas: response.empresas.map((e: CompanySelectExt) => e),
        clientes: response.clientes.map((c: CustomerSelect) => c),
        formas_pago: response.formas_pago || [],
        divisas: response.divisas || [],
      };
      return result;
    }));
  }

  get_view_by_id(id: number){
    return this.apiService.getRequest(`${this._urlApi}/view/${id}`)
  }

  save(cotizacion: any){  
    if (typeof cotizacion.id === "undefined" || cotizacion.id === null){
      return this.apiService.postRequest(`${this._urlApi}`, cotizacion, false);
    }
    return this.apiService.patchRequest(`${this._urlApi}/${cotizacion.id}`, cotizacion);
  }

  findProductCotizacion(query: string): Observable<IProductCotizacion[]> {
    return this.apiService.getRequest(`/productos/find_producto_cotizacion`, {query: query}).pipe(
        map((resp: any) => resp.map((colonia: IProductCotizacion) => colonia))
    );
  }
}
