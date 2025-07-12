import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import Swal, { SweetAlertIcon } from "sweetalert2";
import {} from './validations';
import { DateType, Exportacion, StatusCfdiFilter, TasaCuota, TipoImpuesto, TrasladoRetencion, TypeDocument, ServiceEmail } from "../apps/enums";
import { LIST_SERVERS } from "../apps/const";
import { WorkBook, WorkSheet, read, utils } from "xlsx";

export const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

export function presicion(number: number, decimal: number = 2): number{
    return Number(Number(number).toFixed(decimal));
}

export function getTypeTax(): any[]{
    var result: any[] = [];
    const keys = Object.keys(TipoImpuesto);
    const values = Object.values(TipoImpuesto);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getTasaCuota(): any[]{
    var result: any[] = [];
    const keys = Object.keys(TasaCuota);
    const values = Object.values(TasaCuota);
    for(var i in keys){
        result.push({
            label: keys[i], 
            value: values[i],
        });
    }
    return result;
}

export function getTrasladoRetencion(): any[]{
    var result: any[] = [];
    const keys = Object.keys(TrasladoRetencion);
    const values = Object.values(TrasladoRetencion);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getTypeDocument(): any[] {
    var result: any[] = [];
    const keys = Object.keys(TypeDocument);
    const values = Object.values(TypeDocument);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getStatusCfdi(): any[] {
    var result: any[] = [];
    const keys = Object.keys(StatusCfdiFilter);
    const values = Object.values(StatusCfdiFilter);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getDateType(): any[] {
    var result: any[] = [];
    const keys = Object.keys(DateType);
    const values = Object.values(DateType);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getExportacion(): any[] {
    var result: any[] = [];
    const keys = Object.keys(Exportacion);
    const values = Object.values(Exportacion);
    for(var i in keys){
        result.push({label: keys[i], value: values[i]});
    }
    return result;
}

export function getServiceEmail(): any[] {
    var result: any[] = [];
    const keys = Object.keys(ServiceEmail);
    const values = Object.values(ServiceEmail);
    for(var i in keys){
        result.push({
            label: String(keys[i]).charAt(0).toUpperCase() + String(keys[i]).slice(1),
            value: values[i], 
            server: LIST_SERVERS[keys[i]],
        });
    }
    return result;
}


export function getRowsSelected(grid: jqxGridComponent):any[] {
    var indexs: number[] = grid.getselectedrowindexes();
    if (indexs.length <= 0) return [];
    var result = [];
    for(var i in indexs){
        result.push(grid.getrowdata(indexs[i]))
    }
    return result;
}

export function getRowIndex(index: number): any {
    
}

export function alertOk(message: string, title: string="Ok"){
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        showCloseButton: true,
    });
}

export function alertWarning(message: string, title: string="Alerta"){
    Swal.fire({
        title: title,
        text: message,
        icon: 'warning',
        showCloseButton: true,
    });
}

export function alertError(message: string, title: string="Error"){
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        showCloseButton: true,
    });
}

export function dialog(message: string, icon: SweetAlertIcon = "success", timer: number = 2000){
    Swal.fire({
        position: "top-right",
        icon: icon,
        title: message,
        showConfirmButton: false,
        timer: timer
    });
}


export function alertConfirm(message: string, callback: any, title: string="Confirmar"):void{
    Swal.fire({
        title: title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar',
    }).then(callback);
}

export function getFormArray(key: string, formGroup: FormGroup): FormArray{
    return formGroup.get(key) as FormArray;
}

export function clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
        formArray.removeAt(0)
    }
}

export function createFormArrayEmpty(formBuilder: FormBuilder): FormArray{
    const form = formBuilder.group({
        array: formBuilder.array([])
    });
    return form.get('array') as FormArray;
}

export function getFormControl(key: string, formGroup: FormGroup){
    return formGroup.get(key);
}

export function hasKeyInForm(form: FormGroup, key: string): boolean{
    const control = form.get(key);
    if (control) return true;
    return false;
}

export function getAllErrors(message: string){
    const err = JSON.parse(message);
    return err['__all__'];
}

export function dateToString(date: Date, flag: boolean = false): String{
    if (date == null) return '';
    if (flag) return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
}

export function readFileWriteUrl(input_file: any, callback: Function): void{
    if (input_file.files && input_file.files.length > 0 ){
        const reader: FileReader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>)=>{
            return callback(null, e.target!.result);
        };
        reader.onerror = (error)=>{
            return callback(error, null);
        }
        reader.readAsDataURL(input_file.files[0]);
    }
}
export const listaPreciosDisponibles = [
    {key: 1, label: "Menudeo"},
    {key: 2, label: "Medio mayoreo"},
    {key: 3, label: "Mayoreo"},
    {key: 4, label: "Precio 4"},
];

export enum Precio {
    Menudeo = 1,
    Medio_Mayoreo = 2,
    Mayoreo = 3,
    Precio4 = 4
}

function buildFormData(formData: FormData, data: any, parentKey: any= {}) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {

        Object.keys(data).forEach(key => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = data == null ? '' : data;
        formData.append(parentKey, value);
    }
}

export function jsonToFormData(data: any) {
    const formData = new FormData();
    buildFormData(formData, data);
    return formData;
}

export function generatePassword(){
    var pass = (Math.random()*1646565156824808504654).toString(36).slice(-10);
    var especial = "$%&@/#!_?¿=)]{+*-";
    const mayus = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var randomstring = '';
    var ran = Math.floor((Math.random() * (6 - 3 + 1)) + 3);
    for (var i=0; i< ran; i++) {
        var rnum = Math.floor(Math.random() * especial.length);
        randomstring += especial.substring(rnum, rnum + 1);
    }
    pass = pass + randomstring;
    var ran = Math.floor((Math.random() * (4 - 2 + 1)) + 2);
    var randommayus = '';
    for (var i=0; i< ran; i++) {
        var rnum = Math.floor(Math.random() * mayus.length);
        randommayus += mayus.substring(rnum,rnum+1);
    }
    for(var i = 0; i < randommayus.length; i++){
        var pos = Math.floor((Math.random() * (pass.length-1) + 1) + 0);
        pass = pass.substring(0, pos) + randommayus[i] + pass.substring(pos, pass.length);
    }
    return pass;
}

export function sheet_to_json(workBook: WorkBook, sheetName: string, callback: Function){
    var siEsta = false;
    for(var i = 0; i < workBook.SheetNames.length; i++){
        if(workBook.SheetNames[i] == sheetName){
            siEsta = true;
        }
    }
    if (!siEsta){
        return callback('No se ha encontrado la hoja: ['+sheetName+']');
    }
    var result: any = {};
    const data = utils.sheet_to_json(workBook.Sheets[sheetName], {header: 1});
    if(data.length <= 0){
        return callback('No se han encontrado datos en la hoja ' + sheetName);
    }
    result[sheetName] = data;
    return callback(null, result[sheetName]);
};

export function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


export function getFilter(fil: any = {}) {
    const filter = JSON.parse(JSON.stringify(fil));
    for(var att in filter){
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0){
        delete filter[att];
      }
    }
    return filter;
};