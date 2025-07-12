import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CompanySelect } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoCompanysService {
  private _urlApi: string = '/departamentos_empresa';
  constructor(private apiService: ApiService) { }

  loadCombosCE(){
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((data: any) => {
      const context: any = {
        "empresas": data.empresas.map((e: CompanySelect) => e),
      };
      return context;
  }));
  }

  get_multi(filter: any = {}){
    return this.apiService.getRequest(this._urlApi, filter);
  }

  get_one(id: number){
    return this.apiService.getRequest(`${this._urlApi}/${id}/`);
  }

  save(departamento: any){
    if (typeof departamento.id != "undefined" && Number(departamento.id) > 0){
      return this.apiService.patchRequest(`${this._urlApi}/${departamento.id}`, departamento);
    }else{
      return this.apiService.postRequest(this._urlApi, departamento);
    }
  }

  delete(id: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${id}`);
  }

}
