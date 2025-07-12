import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { catchError, debounceTime, delay, distinctUntilChanged, first, map, Observable, of, switchMap } from "rxjs";
import { ValidationService } from "../services/validation.service";

export class Validations{
    static checkRFC(aceptarGenerico: boolean = true){
        return (control: AbstractControl) => {
            const rfc = String(<string>control.value).trim().toUpperCase();
            if (rfc.length <= 0) return true;
            const re       = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
            var validado = String(rfc || "").match(re);
            if (!validado){
                return {rfcInvalid: true};
            }

            //Separar el dígito verificador del resto del RFC
            const digitoVerificador = validado.pop(),
            rfcSinDigito = validado.slice(1).join(''),
            len = rfcSinDigito.length,
            //Obtener el digito esperado
            diccionario       = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ",
            indice            = len + 1;
            var suma, digitoEsperado;

            if (len == 12) suma = 0
            else suma = 481; //Ajuste para persona moral

            for(var i=0; i<len; i++){
                suma += diccionario.indexOf(rfcSinDigito.charAt(i)) * (indice - i);
            }
            digitoEsperado = 11 - suma % 11;
            if (digitoEsperado == 11) digitoEsperado = 0;
            else if (digitoEsperado == 10) digitoEsperado = "A";

            /**
             * El dígito verificador coincide con el esperado?
             * o es un RFC Genérico (ventas a público general)?
            **/
            var flagRfc = true;
            if ((digitoVerificador != digitoEsperado) && (!aceptarGenerico || rfcSinDigito + digitoVerificador != "XAXX010101000")){
                flagRfc = false;
            }
            else if (!aceptarGenerico && rfcSinDigito + digitoVerificador == "XEXX010101000"){
                flagRfc = false;
            }
            flagRfc = rfc == (rfcSinDigito + digitoVerificador);
            return flagRfc ? null : {rfcInvalid: true};
        }
    }

    static checkPassword(source: string, target: string) {
        return (control: AbstractControl) => {
            const sourceCtrl = control.get(source);
            const targetCtrl = control.get(target);
            return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
            ? { mismatch: true }
            : null;
        }
    }

    static checkEmail(validationService: ValidationService): AsyncValidatorFn {
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkEmail(value, id).pipe(
                    map((flag: boolean) => flag ? {emailAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkUsername(validationService: ValidationService): AsyncValidatorFn {
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkUsername(value, id).pipe(
                    map((flag: boolean) => flag ? {usernameAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkStaffRfc(validationService: ValidationService): AsyncValidatorFn {
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkStaffRfc(value, id).pipe(
                    map((flag: boolean) => flag ? {usernameAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkStaffRazonSocial(validationService: ValidationService): AsyncValidatorFn {
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkStaffRazonSocial(value, id).pipe(
                    map((flag: boolean) => flag ? {usernameAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRFCCliente(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRfcCliente(value, id).pipe(
                    map((flag: boolean) => flag ? {rfcAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRazonSocialCliente(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRSCliente(value, id).pipe(
                    map((flag: boolean) => flag ? {razonSocialAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRFCCompany(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRfcCompany(value, id).pipe(
                    map((flag: boolean) => flag ? {rfcAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRazonSocialCompany(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRSCompany(value, id).pipe(
                    map((flag: boolean) => flag ? {razonSocialAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkNameBranch(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            const companyId = control.parent?.get('company_id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkNameBranch(companyId, value, id).pipe(
                    map((flag: boolean) => flag ? {sucursalAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkNameBank(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkNameBank(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {bankNameAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRFCBank(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRFCBank(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {bankRFCAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRazonSocialProveedor(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRSProveedor(value, id).pipe(
                    map((flag: boolean) => flag ? {razonSocialAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRFCProveedor(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRFCProveedor(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {rfcAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    //Validadores de PRODUCTOS
    static checkNombreProducto(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.checkNombreProducto(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {nombreAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )
        }
    }

    static checkClaveProducto(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.checkClaveProducto(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {claveAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )
        }
    }

    static checkCodigoBarrasProducto(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.checkCodigoBarrasProducto(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {cbAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )
        }
    }

    // Verifica si la cuenta en cuentas cliente no se ha agregado anteriormente
    static accountCustomerCheckCuenta(s: ValidationService): AsyncValidatorFn {
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.customerCheckCuenta(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {cuentaAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    // Verifica si la clabe en cuentas cliente no se ha agregado anteriormente
    static accountCustomerCheckClabe(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.customerCheckClabe(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {clabeAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    // Verifica si la tarjeta en cuentas cliente no se ha agregado anteriormente
    static accountCustomerCheckTarjeta(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.customerCheckTarjeta(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {tarjetaAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    // Verifica si la cuenta en cuentas empresa no se ha agregado anteriormente
    static accountCompanyCheckCuenta(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.companyCheckCuenta(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {cuentaAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    // Verifica si la clabe en cuentas empresa no se ha agregado anteriormente
    static accountCompanyCheckClabe(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.companyCheckClabe(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {clabeAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    // Verifica si la tarjeta en cuentas empresa no se ha agregado anteriormente
    static accountCompanyCheckTarjeta(s: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => s.companyCheckTarjeta(value, control.parent?.get('id')?.value).pipe(
                    map((flag: boolean) => flag ? {tarjetaAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }

    static checkRP(validationService: ValidationService): AsyncValidatorFn{
        return (control: AbstractControl): {[key: string]: boolean} | any => {
            const id = control.parent?.get('id')?.value;
            const companyId = control.parent?.get('company_id')?.value;
            return of(control.value).pipe(
                delay(500),
                switchMap((value: any) => validationService.checkRP(companyId, value, id).pipe(
                    map((flag: boolean) => flag ? {RPAvailable: false} : null),
                    catchError(async (err) => null),
                )),
            )};
    }
}