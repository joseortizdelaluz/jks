import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ISession } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  private _urlApi: string = '';
  constructor(
    private apiService: ApiService
  ) { }

  loadSession():Observable<ISession>{
    return this.apiService.getRequest(`${this._urlApi}/data_session`);
  }
}
