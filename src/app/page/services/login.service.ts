import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { IUser } from 'src/app/apps/models/user';
import { IEstado, IPais } from 'src/app/apps/models/generic.models';
@Injectable({ providedIn: 'root' })

export class LoginService{
    constructor(
        private apiService: ApiService,
    ){}

    login(username: string, password: string): Observable<any> {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return this.apiService.postRequest(`/oauth2/token`, formData);
    }

    public hasToken(): boolean{
        return localStorage.getItem("access_token") != null;
    }

    public isLoggedIn():boolean {
        const token = localStorage.getItem("access_token");
        const partes = token?.split(".")[1];
        try{
            const payload = JSON.parse(atob(partes!));
            var now = new Date();
            var expireDate = new Date(payload.exp * 1000);
            return now < expireDate;
        }catch(e){}
        return false;
    }
    
    isLoggedOut() {
        return !this.isLoggedIn();
    }

    register(registro: any): Observable<IUser>{
        return this.apiService.postRequest(`/usuarios/staff`, registro, false);
    }

    buscame(email_or_username: string): Observable<IUser>{
        return this.apiService.postRequest(`/usuarios/recuperar`, {email_or_username: email_or_username});
    }

    reenviarClave(id: number, email: string){
        return this.apiService.getRequest(`/usuarios/reenviar-clave`, {id: id, email: email});
    }

    changePassword(form: any){
        return this.apiService.postRequest(`/usuarios/change-password`, form);
    }

    loadCombosCE(): Observable<any>{
        return this.apiService.getRequest(`/empresas/load_combos_ce2`).pipe(map((response: any) => {
            const result: any = {
                regimenes: response.regimenes,
                paises: response.paises.map((p: IPais) => p),
                estados: response.estados.map((e: IEstado) => e),
            };
            return result;
        }));
    }
}