import { Injectable } from '@angular/core';
import { Observable, map, of, catchError, throwError, EMPTY } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { TypeProduct } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private _urlApi: string = '/productos';
  constructor(
    private _apiService: ApiService
  ) { }

  list(filter: any = undefined):Observable<any>{
    return this._apiService.getRequest(`${this._urlApi}`, filter);
  }

  save(product: any, callback: Function) {
    let files = [];
    if (typeof product.imagenes != "undefined" && product.imagenes.length > 0){
      for(var i in product.imagenes){
        if (product.imagenes[i].binary != "undefined" && product.imagenes[i].binary instanceof File){
          product.imagenes[i].filename = product.imagenes[i].binary.name;
          files.push(product.imagenes[i].binary)
          // product.imagenes[i].binary = true;
        }
      }
    }

    this._apiService.uploadx(files).subscribe((path: any) => {
      if (typeof path == "string" && path != null){
        for(var i in product.imagenes){
          if (product.imagenes[i].binary != "undefined" && product.imagenes[i].binary instanceof File){
            product.imagenes[i].path = `${path}/${product.imagenes[i].filename}`;
            // delete product.imagenes[i].base_64;
          }
        }
      }
      let impuestos: any[] = [];
      product.impuestos.map((tax: any) => {
        if (tax.seleccionado == true){
          impuestos.push(tax);
        }
      });
      product.impuestos = impuestos;
      if (typeof product.id != "undefined" && product.id > 0){
        this._apiService.patchRequest(`${this._urlApi}/${product.id}`, product).subscribe(data => {
          return callback(null);
        }, error => {
          callback(error);
        });
      }else{
        this._apiService.postRequest(`${this._urlApi}`, product, false).subscribe(data => {
          callback(null);
        }, error => {
          callback(error);
        });
      }
    }, error => {
      callback(error);
    });
  }

  getById(id: number){
    return this._apiService.getRequest(`${this._urlApi}/${id}?id=${id}`);
  }

  update(product: any){
    return this._apiService.patchRequest(`${this._urlApi}/${product.id}`, product);
  }

  delete(id: number){
    return this._apiService.deleteRequest(`${this._urlApi}/${id}?id=${id}`);
  }

  loadCombosIndex(): Observable<any>{
    return this._apiService.getRequest(`${this._urlApi}/load_combos_index`).pipe(
      map((resp: any) => {
        const respuesta: any = {
          departamentos: resp.departamentos || [],
          clases: resp.clases || [],
          categorias: resp.categorias || [],
        };
        return respuesta;
      })
    );
  }
  
  loadCombosCE(tipo_producto: TypeProduct): Observable<any>{
    return this._apiService.getRequest(`${this._urlApi}/load_combos_ce?tipo_producto=${tipo_producto}`).pipe(
      map((resp: any) => {
        const respuesta: any = {
          departamentos: resp.departamentos || [],
          clases: resp.clases || [],
          categorias: resp.categorias || [],
          unidades_medida: resp.unidades_medida || [],
          proveedores: resp.proveedores || [],
          impuestos: resp.impuestos || [],
          precios: resp.precios || [],
          sucursales: resp.sucursales || [],
          divisas: resp.divisas || [],
        };
        return respuesta;
      })
    );
  }
}
