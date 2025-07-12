import { Injectable } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CompanySelect, CompanySelectExt } from '../models/company.model';
import { CustomerSelect } from '../models/customer.model';
import { IDocumentPay } from '../models/billing.model';
import { IProductCotizacion } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private _urlApi: string = '/documentos';
  constructor(
    private apiService: ApiService
  ) { }
  
  check(){
    return this.apiService.getRequest(`${this._urlApi}/check`);
  }

  gets(params: any = {}): Observable<any>{
    return this.apiService.getRequest(this._urlApi, params);
  }

  create(invoice: any){
    return this.apiService.postRequest(this._urlApi, invoice, false);
  }

  get(id: number): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/${id}?id=${id}`);
  }
 
  update(invoiceId: number, invoice: any){
    return this.apiService.patchRequest(`${this._urlApi}/${invoiceId}`, invoice);
  }

  delete(invoiceId: number){
    return this.apiService.deleteRequest(`${this._urlApi}/${invoiceId}`);
  }

  loadCombosRoot(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_root`).pipe(map((response: any) => {
      const result: any = {
        empresas: response.empresas.map((e: CompanySelectExt) => e),
        clientes: response.clientes.map((c: CustomerSelect) => c),
      };
      return result;
    }));
  }

  loadCombosCE(): Observable<any>{
    return this.apiService.getRequest(`${this._urlApi}/load_combos_ce`).pipe(map((response: any) => {
      const result: any = {
        empresas: response.empresas.map((e: CompanySelectExt) => e),
        clientes: response.clientes.map((c: CustomerSelect) => c),
        usos_cfdi: response.usos_cfdi,
        divisas: response.divisas,
        metodos_pago: response.metodos_pago,
        formas_pago: response.formas_pago,
        exportacion: response.exportacion,
      };
      return result;
    }));
  }

  generateXLSX(filter: any){
    return this.apiService.postRequest(`${this._urlApi}/xlsx`, filter);
  }

  generatePDF(ids: any, template: number){
    return this.apiService.postRequest(`${this._urlApi}/pdf`, {ids: ids.join(","), template: template});
  }

  generateXML(ids: any, template: number){
    return this.apiService.postRequest(`${this._urlApi}/xml`, {ids: ids.join(","), template: template});
  }
  
  donwload(file: any){
    return this.apiService.download(`/download/${file}`)
    .pipe(take(1))
    .subscribe((response) => {
      const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob([response.body!], { type: response.body!.type }));
        downloadLink.download = file;
        downloadLink.click();
    });
  }

  sign(id: number, fecha_emision: any){
    return this.apiService.postRequest(`${this._urlApi}/sign/${id}`, {fecha_emision: fecha_emision});
  }

  cancel(id: number, motivo: string, folio_sustituye: string){
    return this.apiService.postRequest(`${this._urlApi}/cancel/${id}`, {motivo: motivo || '', folio_sustituye: folio_sustituye || ''});
  }

  refoliar(id: number, folio: number){
    return this.apiService.patchRequest(`${this._urlApi}/refolio/${id}?folio=${folio}`, {folio: folio});
  }
  
  uploadXml(files: any[]){
    return this.apiService.uploadx(files);
  }

  procesarXml(path: string, files: any[]) {
    return this.apiService.postRequest(`${this._urlApi}/procesar_xml/`, {path: path, files: files});
  }

  getTemplates(type: number, subtype: string = '', email: number = 0, ids: any = "", model: string = 'cfdi'){
    return this.apiService.getRequest('/plantillas/get_template', {type: type, subtype: subtype, email: email, ids: ids, model: model});
  }

  /**
   * 
   * @param filter 
   *  company_id
   *  customer_id
   *  query: folio, serie o folio_fiscal
   * @returns 
   */
  findDocumentPay(filter: any = {}): Observable<IDocumentPay[]> {
    return this.apiService.getRequest(`${this._urlApi}/documents_pay`, filter).pipe(
        map((resp: any) => resp.map((item: IDocumentPay) => item))
    );
  }

  getDataImport(filtros: any){
    return this.apiService.postRequest(`${this._urlApi}/datos_importacion`, filtros, false);
  }

  sendEmail(data: any){
    return this.apiService.postRequest(`${this._urlApi}/email/`, data, false);
  }

  findProductAddInvoice(query: string): Observable<IProductCotizacion[]> {
    return this.apiService.getRequest(`${this._urlApi}/find_product_add_to_invoice`, {query: query}).pipe(
        map((resp: any) => resp.map((producto: IProductCotizacion) => producto))
    );
  }

}
