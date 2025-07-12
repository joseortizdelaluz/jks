import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _urlApi: string = '/dashboard';
  constructor(
    private apiService: ApiService,
  ) { }

  loadInit(): Observable<any>{
    let now = new Date();
    return this.apiService.getRequest(this._urlApi, {year: now.getFullYear()}).pipe(map((resp: any) => resp));
  }

  dataChartYear(year: number){
    return this.apiService.getRequest(`${this._urlApi}/data_chart`, {year: year});
  }
}
