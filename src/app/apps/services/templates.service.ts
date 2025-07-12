import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private _urlApi: string = '/plantillas';
  constructor(private apiService: ApiService,) { }

  gets(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  create(template: any){
    return this.apiService.postRequest(this._urlApi, template, false);
  }

  get(id: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${id}?id=${id}`);
  }

  update(id: number, template: any){
    return this.apiService.patchRequest(`${this._urlApi}/${id}`, template);
  }

  delete(id: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${id}`);
  }

  copy(id: number){
    return this.apiService.postRequest(`${this._urlApi}/copiar/${id}`, {id: id}, false);
  }
}
