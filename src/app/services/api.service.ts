import { Injectable } from '@angular/core';
import { ApiSettings } from '../app.settings';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private __url_rest_api = ApiSettings.urlAPI;
  constructor(
    private http: HttpClient
  ) { }

  getRequest(url: any, params: any = undefined) { 
    return this.http.get(this.__url_rest_api+url, {params: params}).pipe(map(res => res)); 
  }

  postRequest(url: any, payload: any, flag: boolean = true) {
    var params = {};
    if (flag){
      params = {params: payload};
    }
    return this.http.post(this.__url_rest_api+url, payload, params).pipe(map(res => res));
  }

  patchRequest(url: any, payload: any) {
    return this.http.patch(this.__url_rest_api+url, payload).pipe(map(res => res));
  }

  putRequest(url: any, payload: any) {
    return this.http.put(this.__url_rest_api+url, payload).pipe(map(res => res));
  }

  deleteRequest(url: any) {
    return this.http.delete(this.__url_rest_api+url).pipe(map(res => res));
  }

  download(url: any): Observable<HttpResponse<Blob>>{
    return this.http.get<Blob>(this.__url_rest_api + url, { observe: 'response', responseType: 'blob' as 'json'});
  }

  upload(files: any, callback: Function, url: string= '/upload') {
    if (files.length <= 0){
      return callback(null, null);
    }else{
      const formData = new FormData();
      for(var i in files){
        formData.append("files", files[i]);
      }
      this.http.post(this.__url_rest_api + url, formData).pipe(
        map(resp => {
          return callback(resp, null);
        }
      ));
    }
  }

  uploadx(files: any, url: string= '/upload'): Observable<any>{
    if (files.length <= 0){
      return of(null);
    }else{
      const formData = new FormData();
      for(var i in files){
        formData.append("files", files[i]);
      }
      return this.http.post(this.__url_rest_api + url, formData).pipe(map(res => res));
    }
  }


}
