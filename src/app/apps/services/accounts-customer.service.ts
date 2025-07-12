import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CompanySelect } from '../models/company.model';
import { IBank } from '../models/bank.model';
import { IDivisa } from '../models/generic.models';
@Injectable({
    providedIn: 'root'
})

export class AccountCustomerService {
    private _urlApi: string = '/cuentas_cliente';
    constructor(
        private apiService: ApiService
    ) { }

    getAccounts(params: any = {}): Observable<any>{
        return this.apiService.getRequest(this._urlApi, params);
    }

    createAccount(bank: any){
        return this.apiService.postRequest(this._urlApi, bank);
    }

    getAccount(bankId: number): Observable<any>{
        return this.apiService.getRequest(`${this._urlApi}/${bankId}?bank_id=${bankId}`);
    }

    updateAccount(bankId: number, bank: any){
        return this.apiService.patchRequest(`${this._urlApi}/${bankId}`, bank);
    }

    deleteAccount(bankId: number){
        return this.apiService.deleteRequest(`${this._urlApi}/${bankId}`);
    }

    loadCombosCE(){
        return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((data: any) => {
            const context: any = {
                "clientes": data.empresas.map((e: CompanySelect) => e),
                "bancos": data.bancos.map((b: IBank) => b),
                "divisas": data.divisas.map((d: IDivisa) => d),
            };
            return context;
        }));
    }
}