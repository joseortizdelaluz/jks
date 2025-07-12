import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, delay, map, of } from 'rxjs';
import { ApiSettings } from '../app.settings';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })

export class ValidationService{
    private subUrl: string = `${ApiSettings.urlAPI}/validators`;
    constructor(private http: HttpClient, private apiService: ApiService){}

    /**
     * 
     * @param email a buscar
     * @returns 
     * true => Disponible
     * false => Ocupado
     */
    
    checkEmail(email: string, id?: number): Observable<boolean>{
        if (String(email).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/user_check_email?email=${email}&id=${id||0}`).pipe(map(resp => resp));
    }

    /**
     * 
     * @param username 
     * @returns true or false
     * false if username not available
     * else true
     */
    checkUsername(username: string, id?: number){
        if (String(username).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/user_check_username?username=${username}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    checkStaffRfc(rfc: string, id?: number){
        if (String(rfc).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/staff_check_rfc?rfc=${rfc}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    checkStaffRazonSocial(razon_social: string, id?: number){
        if (String(razon_social).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/staff_check_razon_social?razon_social=${razon_social}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    /**
     * Validador del razon social para una EMPRESA en la DB
     * @param razon_social 
     * @param id 
     * @returns true | false
     */
    checkRSCompany(razon_social: string, id?: number){
        if (String(razon_social).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/company_check_razon_social?razon_social=${razon_social}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    /**
     * Validador del RFC para un EMPRESA en la DB
     * @param rfc 
     * @param id 
     * @returns true | false
     */
    checkRfcCompany(rfc: string, id?: number){
        if(String(rfc).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/company_check_rfc?rfc=${rfc}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    /**
     * Validador del razon social para una EMPRESA en la DB
     * @param razon_social 
     * @param id 
     * @returns true | false
     */
    checkNameBranch(companyId: number, name: string, id?: number){
        if(Number(companyId || 0) <= 0) return of(false);
        if(String(name).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/branch_company_check_name?company_id=${companyId}&name=${name}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    checkRP(companyId: number, rp: string, id?: number){
        if(Number(companyId || 0) <= 0) return of(false);
        if(String(rp).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/rp_company_check_numero_registro?company_id=${companyId}&rp=${rp}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }



    /**
     * Validador del razon social para un CLIENTE en la DB
     * @param razon_social 
     * @param id 
     * @returns true | false
     */
    checkRSCliente(razon_social: string, id?: number): Observable<boolean>{
        if (String(razon_social).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/customer_check_razon_social?razon_social=${razon_social}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    /**
     * Validador del RFC para un CLIENTE en la DB
     * @param rfc 
     * @param id 
     * @returns true | false
     */
    checkRfcCliente(rfc: string, id?: number): Observable<boolean>{
        if(String(rfc).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/customer_check_rfc?rfc=${rfc}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    /**
     * 
     * @param name 
     * @param id 
     * @returns 
     */
    checkNameBank(name: string, id?: number): Observable<boolean>{
        if(String(name).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/bank_check_name?name=${name}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    /**
     * 
     * @param rfc 
     * @param id 
     * @returns 
     */
    checkRFCBank(rfc: string, id?: number): Observable<boolean>{
        if(String(rfc).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/bank_check_rfc?rfc=${rfc}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    checkRSProveedor(razon_social: string, id?: number): Observable<boolean>{
        if (String(razon_social).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/proveedor_check_razon_social?razon_social=${razon_social}&id=${id||0}`).pipe(
            map(resp => resp)
        )
    }

    checkRFCProveedor(rfc: string, id?: number): Observable<boolean>{
        if(String(rfc).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/proveedor_check_rfc?rfc=${rfc}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    // Validadores PRODUCTOS
    checkNombreProducto(nombre: string, id?: number): Observable<boolean>{
        if(String(nombre).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/producto_check_nombre?nombre=${nombre}&id=${id||0}`).pipe(map(resp => resp));
    }
    checkClaveProducto(clave: string, id?: number): Observable<boolean>{
        if(String(clave).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/producto_check_clave?clave=${clave}&id=${id||0}`).pipe(map(resp => resp));
    }
    checkCodigoBarrasProducto(codigo_barras: string, id?: number): Observable<boolean>{
        if(String(codigo_barras).trim().length <= 0) return of(false);
        return this.http.get<any>(`${this.subUrl}/producto_check_codigo_barras?codigo_barras=${codigo_barras}&id=${id||0}`).pipe(map(resp => resp));
    }

    // Validadores para CUENTAS CLIENTE
    customerCheckCuenta(cuenta: string, id?: number): Observable<boolean>{
        if(String(cuenta).trim().length <= 0 || cuenta == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_customer_check_cuenta?cuenta=${cuenta}&id=${id||0}`).pipe(map(resp => resp));
    }

    customerCheckClabe(clabe: string, id?: number): Observable<boolean>{
        if(String(clabe).trim().length <= 0 || clabe == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_customer_check_clabe?clabe=${clabe}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    customerCheckTarjeta(tarjeta: string, id?: number): Observable<boolean>{
        if(String(tarjeta).trim().length <= 0 || tarjeta == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_customer_check_tarjeta?tarjeta=${tarjeta}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    // Validadores para CUENTAS EMPRESA
    companyCheckCuenta(cuenta: string, id?: number): Observable<boolean>{
        if(String(cuenta).trim().length <= 0 || cuenta == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_company_check_cuenta?cuenta=${cuenta}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    companyCheckClabe(clabe: string, id?: number): Observable<boolean>{
        if(String(clabe).trim().length <= 0 || clabe == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_company_check_clabe?clabe=${clabe}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    companyCheckTarjeta(tarjeta: string, id?: number): Observable<boolean>{
        if(String(tarjeta).trim().length <= 0 || tarjeta == null) return of(false);
        return this.http.get<any>(`${this.subUrl}/account_company_check_tarjeta?tarjeta=${tarjeta}&id=${id||0}`).pipe(
            map(resp => resp)
        );
    }

    
    
    
    
    
    
}