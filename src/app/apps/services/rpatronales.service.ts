import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IEstado } from '../models/generic.models';
import { ApiService } from 'src/app/services/api.service';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class RpatronalesService {
  private _urlApi: string = '/rps';
  constructor(private apiService: ApiService,) { }
  list(filter: any): Observable<any> {
    return this.apiService.getRequest(this._urlApi, filter);
  }

  get(id: number): Observable<any> {
    return this.apiService.getRequest(`${this._urlApi}/${id}`)
  }
  create(rp: any): Observable<any>{
    return this.apiService.postRequest(this._urlApi, rp);
  }
  update(rp: any): Observable<any>{
    return this.apiService.patchRequest(`${this._urlApi}/${rp.id}`, rp);
  }
  delete(id: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${id}`);
  }
  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        empresas: (response.empresas || []).map((e: Company) => e),
        estados: (response.estados || []).map((e: IEstado) => e),
        areas: (response.areas || []),
        clases: (response.clases || []),
      };
      return result;
    }));
  }

  loadCombosRoot(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_root`).pipe(map((response: any) => {
      const result: any = {
        empresas: (response.empresas || []).map((e: Company) => e),
      };
      return result;
    }));
  }
}
