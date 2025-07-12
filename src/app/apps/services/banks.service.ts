import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})

export class BanksService {
  private _urlApi: string = '/bancos';
  constructor(
    private apiService: ApiService
  ) { }
  
  getBanks(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  createBank(bank: any){
    return this.apiService.postRequest(this._urlApi, bank);
  }

  getBank(bankId: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${bankId}?bank_id=${bankId}`);
  }

  updateBank(bankId: number, bank: any){
    return this.apiService.patchRequest(`${this._urlApi}/${bankId}`, bank);
  }

  deleteBank(bankId: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${bankId}`);
  }
}
