import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { IColonia, IEstado, IMunicipio, IPais } from '../models/generic.models';
import { ApiService } from 'src/app/services/api.service';
import { IProductoServicio, ITax, IUnidadMedida } from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class GeneralService {
    private _urlApi: string = '/general';
    constructor(private apiService: ApiService) { }
    paises(): Observable<IPais[]>{
        return this.apiService.getRequest(`${this._urlApi}/paises`).pipe(
            map((resp: any) => resp.map((pais: IPais) => pais))
        );
    }

    estados(contry_key: string, contry_id: number = 0): Observable<IEstado[]>{
        return this.apiService.getRequest(`${this._urlApi}/estados`, {contry_key: contry_key, contry_id: contry_id}).pipe(
            map((resp: any) => resp.map((estado: IEstado) => estado))
        );
    }

    municipios(state_key: string, state_id: number = 0): Observable<IMunicipio[]>{
        return this.apiService.getRequest(`${this._urlApi}/municipios`, {state_key: state_key, state_id: state_id}).pipe(
            map((resp: any) => resp.map((municipio: IMunicipio) => municipio))
        );
    }

    findCp(cp: string): Observable<IColonia[]> {
        return this.apiService.getRequest(`${this._urlApi}/cps`, {cp: cp}).pipe(
            map((resp: any) => resp.map((colonia: IColonia) => colonia))
        );
    }

    findProductoServicio(query: string, clave: string=""): Observable<IProductoServicio[]> {
        const params: any = {query: query};
        if (clave.trim().length > 0){
            params.clave = clave;
        }
        return this.apiService.getRequest(`${this._urlApi}/producto_servicio`, params).pipe(
            map((resp: any) => resp.map((item: IProductoServicio) => item))
        );
    }

    findUnidadMedida(query: string, clave: string=""): Observable<IUnidadMedida[]> {
        const params: any = {query: query};
        if (clave.trim().length > 0){
            params.clave = clave;
        }
        return this.apiService.getRequest(`${this._urlApi}/unidad_medida`, params).pipe(
            map((resp: any) => resp.map((item: IUnidadMedida) => item))
        );
    }

    getTax(type: string='F'): Observable<ITax[]> {
        return this.apiService.getRequest(`${this._urlApi}/taxes`, {type: type}).pipe(
            map((resp: any) => resp.map((item: IUnidadMedida) => item))
        );
    }
}
