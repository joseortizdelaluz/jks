import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { IEstado, IPais } from '../models/generic.models';
import { CompanySelect } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class BranchsCompanyService {
  private _urlApi: string = '/sucursales_empresa';
  constructor(
    private apiService: ApiService,
  ) { }


  getComboIndex(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_index`).pipe(map((response: any) => {
      const result: any = {
        empresas: response.empresas.map((e: CompanySelect) => e)
      };
      return result;
    }));
  }
  getBranchs(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  createBranch(branch: any){
    return this.apiService.postRequest(this._urlApi, branch);
  }

  getBranch(branchId: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${branchId}?branch_id=${branchId}`);
  }

  updateBranch(branchId: number, branch: any){
    return this.apiService.patchRequest(`${this._urlApi}/${branchId}`, branch);
  }

  deleteBranch(branchId: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${branchId}`);
  }

  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        regimenes: response.regimenes,
        empresas: response.empresas,
        paises: response.paises.map((p: IPais) => p),
        estados: response.estados.map((e: IEstado) => e),
      };
      return result;
    }));
  }

  uploadCsd(companyId: number, branchId: number, formData: FormData ): Observable<any>{
    return this.apiService.postRequest(`${this._urlApi}/csd_upload/${companyId}/${branchId}`, formData);
  }

  settingCsd(setting: any){
    return this.apiService.postRequest(`${this._urlApi}/csd_setting`, setting);
  }
}

