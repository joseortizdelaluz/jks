import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { IEstado, IPais, IDivisa, IFormaPago } from '../models/generic.models';
import { IBank } from '../models/bank.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private _urlApi: string = '/proveedores';
  constructor(
    private _apiService: ApiService
  ) { }

  getList(filter: any = {}){
    return this._apiService.getRequest(this._urlApi, filter);
  }

  create(proveedor: any){
    return this._apiService.postRequest(this._urlApi, proveedor, false);
  }

  getProveedor(id: number){
    return this._apiService.getRequest(`${this._urlApi}/${id}?id=${id}`);
  }

  update(id: number, proveedor: any){
    return this._apiService.patchRequest(`${this._urlApi}/${id}`, proveedor);
  }

  delete(id: number){
    return this._apiService.deleteRequest(`${this._urlApi}/${id}`);
  }

  loadCombosCE(): Observable<any>{
    return this._apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(
      map((resp: any) => {
        const respuesta: any = {
          paises: (resp.paises || []).map((pais: IPais) => pais),
          bancos: (resp.bancos || []).map((banco: IBank) => banco),
          categorias: (resp.categorias || []).map((clase: any) => clase),
          divisas: (resp.divisas || []).map((divisa: IDivisa) => divisa),
          forma_pagos: (resp.forma_pagos || []).map((fp: IFormaPago) => fp),
        };
        return respuesta;
      })
    );
  }

  /*public listaRol(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/crear_rol/`).pipe(
        map(resp => resp.map((element: any) => element))
    )
  }
  public crearRol(rol: any): Observable<any>{
      return this.http.post<any>(`${this.url}/crear_rol/`, rol).pipe(
          map(resp => resp.status == "ok" ? true : resp.desc)
      );
  }*/

  saveCategoria(categoria: any){
    if(typeof categoria.id != "undefined" && categoria.id > 0){
      return this._apiService.patchRequest(`${this._urlApi}/categoria/${categoria.id}`, categoria);
    }else{
      return this._apiService.postRequest(`${this._urlApi}/categoria`, categoria);
    }
  }
}
