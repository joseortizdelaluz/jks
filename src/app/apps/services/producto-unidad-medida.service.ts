import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Const } from 'src/app/app.constants';
import { IUnidadMedida } from '../models/producto.model';

@Injectable({providedIn: 'root'})
export class ProductoUnidadMedidaService {
    private url: string = `${Const.url}/catalogos/productos/unidades_medida`;
    
    constructor(private http: HttpClient) { }

    public lista(): Observable<IUnidadMedida[]>{
        return this.http.get<any>(this.url + '/').pipe(
            map(resp => resp.data.map((element: IUnidadMedida)=> element))
        );
    }

    public save(deparment: IUnidadMedida): Observable<boolean | any>{
        if (deparment.id != null && deparment.id > 0){
            return this.http.put<any>(`${this.url}/editar/${deparment.id}/`, deparment).pipe(
                map(resp => (resp.status == "ok") ? true : resp.desc)
            );
        }else{
            return this.http.post<any>(`${this.url}/crear/`, deparment).pipe(
                map(resp => (resp.status == "ok") ? true : resp.desc)
            );
        }
    }

    public delete(id: number){
        this.http.delete<any>(`${this.url}/eliminar/${id}/`).pipe(
            map(resp => (resp.status == "ok") ? true : resp.desc)
        );
    }
}
