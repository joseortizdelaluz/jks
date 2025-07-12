import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateNewService {
  private _urlApi: string = '/plantillas';
  constructor(
    private apiService: ApiService,
  ) { }

  getVars(){
    return this.apiService.getRequest(`${this._urlApi}/vars_templates`);
  }

  save(template: any){
    if (typeof template.id != "undefined" && template.id > 0){
      return this.apiService.patchRequest(`${this._urlApi}/${template.id}`, template);
    }else{
      return this.apiService.postRequest(this._urlApi, template, false);
    }
  }

  delete(id: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${id}`);
  }

  get(id: number){
    return this.apiService.getRequest(`${this._urlApi}/${id}?id=${id}`);
  }
}