import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Const } from 'src/app/app.constants';
import { IDepartamento } from '../models/producto.model';

@Injectable({providedIn: 'root'})
export class ProductoDepartamentoService {
    private url: string = `${Const.url}/catalogos/productos/departamentos`;
    constructor(private http: HttpClient) { }

    public lista(): Observable<IDepartamento[]>{
        return this.http.get<any>(this.url + '/').pipe(
            map(resp => resp.data.map((element: IDepartamento)=> element))
        );
    }
    
    public save(deparment: IDepartamento): Observable<boolean | any>{
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
