import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { IEstado, IPais } from '../models/generic.models';

@Injectable({
  providedIn: 'root'
})
export class CompanysService {
  private _urlApi: string = '/empresas';
  constructor(
    private apiService: ApiService,
  ) { }

  getCompanys(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  createCompany(company: any){
    return this.apiService.postRequest(this._urlApi, company);
  }

  getCompany(companyId: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${companyId}?company_id=${companyId}`);
  }

  updateCompany(companyId: number, customer: any){
    return this.apiService.patchRequest(`${this._urlApi}/${companyId}`, customer);
  }

  deleteCompany(companyId: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${companyId}`);
  }

  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        regimenes: response.regimenes,
        paises: response.paises.map((p: IPais) => p),
        estados: response.estados.map((e: IEstado) => e),
      };
      return result;
    }));
  }
}
