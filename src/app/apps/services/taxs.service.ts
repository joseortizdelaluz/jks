import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})

export class TaxsService {
  private _urlApi: string = '/impuestos';
  constructor(
    private apiService: ApiService
  ) { }


  gets(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  create(tax: any){
    return this.apiService.postRequest(this._urlApi, tax, false);
  }

  get(id: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${id}?bank_id=${id}`);
  }

  update(id: number, tax: any){
    return this.apiService.patchRequest(`${this._urlApi}/${id}`, tax);
  }

  delete(id: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${id}`);
  }
}
