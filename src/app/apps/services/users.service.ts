import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser, User } from 'src/app/page/models/user';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _urlApi: string = '/usuarios';
  constructor(
    private apiService: ApiService,
  ) { }

  getUsers(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  createUser(user: any){
    return this.apiService.postRequest(this._urlApi, user, false);
  }

  getUser(userId: number): Observable<IUser>{
    return this.apiService.getRequest(`${this._urlApi}/${userId}`);
  }

  updateUser(userId: number, user: any) {
    return this.apiService.patchRequest(`${this._urlApi}/${userId}`, user);
  }

  deleteUser(userId: number) {
    return this.apiService.deleteRequest(`${this._urlApi}/${userId}`);
  }

  loadCombosCe(){
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`);
  }
}
