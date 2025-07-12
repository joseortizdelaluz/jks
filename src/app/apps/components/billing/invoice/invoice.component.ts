import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Observable, OperatorFunction, catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap, of } from 'rxjs';

import { DateType, Exportacion, ObjetoImpuesto, StatusCfdiFilter, StatusCfdi, TypeDocument, Status } from 'src/app/apps/enums';
import { IDocumentPay, IProductoServicio, IUnidadMedida } from 'src/app/apps/models/billing.model';
import { GeneralService } from 'src/app/apps/services/general.service';
import { InvoicesService } from 'src/app/apps/services/invoices.service';
import Swal from "sweetalert2";

import { 
  alertConfirm, alertError, alertOk, getFormControl, getRowsSelected, 
  getTasaCuota, getTrasladoRetencion, getTypeTax, presicion, getTypeDocument,
  getStatusCfdi, getDateType, getExportacion, getFormArray, hasKeyInForm, clearFormArray, alertWarning,
  sheet_to_json, uuidv4,
  dialog
} from 'src/app/utils/utils';
import { Router } from '@angular/router';
import { ISession } from 'src/app/apps/models/user';
import { WorkBook, read, utils } from 'xlsx';
import { IProductCotizacion } from 'src/app/apps/models/product.model';
import { CotizacionesService } from 'src/app/apps/services/cotizaciones.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxGridDocumentos', { static: false }) jqxGridDocumentos: jqxGridComponent;
  @ViewChild('jqxGridFacturasImportar', { static: false }) jqxGridFacturasImportar: jqxGridComponent;

  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  @ViewChild("modalDetalle", {static: false}) modalDetalle: TemplateRef<any>;
  @ViewChild("modalSignDocument", {static: false}) modalSignDocument: TemplateRef<any>;
  @ViewChild("modalCancelDocument", {static: false}) modalCancelDocument: TemplateRef<any>;
  @ViewChild("modalTemplates", {static: false}) modalTemplates: TemplateRef<any>;
  @ViewChild("modalComplementImplocal", {static: false}) modalComplementImplocal: TemplateRef<any>;
  @ViewChild("modalComplementPays", {static: false}) modalComplementPays: TemplateRef<any>;
  @ViewChild("modalComplementPayCe", {static: false}) modalComplementPayCe: TemplateRef<any>;
  @ViewChild("modalImportadorXmls", {static: false}) modalImportadorXmls: TemplateRef<any>;
  @ViewChild("modalImportadorXlsx", {static: false}) modalImportadorXlsx: TemplateRef<any>;
  @ViewChild("modalErroresImportacion", {static: false}) modalErroresImportacion: TemplateRef<any>;
  @ViewChild("modalViewDocImport", {static: false}) modalViewDocImport: TemplateRef<any>;
  @ViewChild("modalEmail", {static: false}) modalEmail: TemplateRef<any>;
  
  public filter: any = {tipo_fecha: DateType['Fecha certificación'], status_cfdi: StatusCfdiFilter.Todos,};
  public form: FormGroup;
  public formDetail: FormGroup;
  public formTemplate: FormGroup;
  public formImplocal: FormGroup;
  public formEmail: FormGroup;
  public seleccionados: number = 0;
  public getFormControl: Function = getFormControl;
  public getFormArray: Function = getFormArray;
  public hasKeyInForm: Function = hasKeyInForm;
  private dp: number = 6;
  public ndecimal: number = 2;
  public searchingPS = false;
  public searchFailedPS = false;
  public searchingUM = false;
  public searchFailedUM = false;
  public searchingDocs = false;
  public searchFailedDocs = false;

  public selectedTaxMd: any = {};
  public htmlEmail: string = "";
  public list_root_emisor: any[] = [];
  public list_root_receptor: any[] = [];
  public list_root_sucursal: any[] = [];
  public list_root_tipo_comprobante: any[] = [];
  public list_root_status_cfdi: any[] = [];
  public list_root_type_date: any[] = [];

  public list_taxs: any[] = [];
  public list_tasa_cuota: any[] = [];
  public list_tipos: any[] = [];

  public list_ce_companys: any[] = [];
  public list_ce_branchs: any[] = [];
  public list_ce_customers: any[] = [];
  public list_ce_tipo_comprobante: any[] = [];
  public list_ce_usos_cfdi: any[] = [];
  public list_ce_divisas: any[] = [];
  public list_ce_metodo_pago: any[] = [];
  public list_ce_forma_pago: any[] = [];
  public list_ce_exportacion: any[] = [];
  public list_ce_detalle_impuestos: any[] = [];

  public list_ce_cuentas_cliente: any[] = [];
  public list_ce_cuentas_empresa: any[] = [];

  public list_templates_generate: any[] = [];
  public factura: any = {};


  public list_department_serves_company: any[] = [];
  public list_users_contac: any[] = [];
  public list_users_cco: any[] = [];


  public importador_xlsx: any = {
    obligatorios: [
      "TIPO", "TIPO COMPROBANTE", "RFC EMISOR", "SUCURSAL", "RFC RECEPTOR", "USO CFDI", "EXPORTACION", "DIVISA", "TIPO CAMBIO",
      "FORMA DE PAGO", "METODO DE PAGO", "CONCEPTO", "CANTIDAD", "PRECIO UNITARIO", "DESCUENTO", 
      "PRODUCTO SERVICIO", "CLAVE UNIDAD"
    ],
    opcionales: [
      "CONDICIONES DE PAGO", "SERIE", "OBSERVACIONES", "IMPUESTOS LOCALES", "IMPUESTOS FEDERALES"
    ],
  };

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'company_id', type: 'int' },
      { name: 'client_id', type: 'int' },
      { name: 'status_cfdi', type: 'int' },
      { name: 'tipo_comprobante', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'folio', type: 'string' },
      { name: 'serie', type: 'int' },
      { name: 'pagada', type: 'bool' },
      { name: 'emisor', type: 'string' },
      { name: 'receptor', type: 'string' },
      { name: 'sucursal', type: 'string' },
      { name: 'forma_pago', type: 'string' },
      { name: 'metodo_pago', type: 'string' },
      { name: 'uso_cfdi', type: 'string' },
      { name: 'divisa', type: 'string' },
      { name: 'tipo_cambio', type: 'float' },
      { name: 'fecha_emision', type: 'string' },
      { name: 'fecha_certificacion', type: 'string' },
      { name: 'folio_fiscal', type: 'string' },
      { name: 'fecha_cancelacion', type: 'string' },
      { name: 'subtotal', type: 'float' },
      { name: 'descuento', type: 'float' },
      { name: 'traslado_federal', type: 'float' },
      { name: 'retencion_federal', type: 'float' },
      { name: 'traslados_local', type: 'float' },
      { name: 'retencion_local', type: 'float' },
      { name: 'total', type: 'float' },
      { name: 'created_at', type: 'string' },
      { name: 'importada', type: 'bool' },
      { name: 'email', type: 'bool' },
    ]
  };

  public dataAdapter: any = new jqx.dataAdapter(this.source);
  public sourceImport: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      {name: "uuid", type: "string"},
      {name: "company_id", type: "number"},
      {name: "company", type: "string"},
      {name: "company_rfc", type: "string"},
      
      {name: "branch_company_id", type: "number"},
      {name: "branch_company", type: "string"},
      {name: "client_id", type: "number"},
      {name: "client", type: "string"},
      {name: "client_rfc", type: "string"},
      {name: "uso_cfdi_id", type: "number"},
      {name: "uso_cfdi", type: "string"},
      {name: "forma_pago_id", type: "number"},
      {name: "forma_pago", type: "string"},
      {name: "metodo_pago_id", type: "number"},
      {name: "metodo_pago", type: "string"},
      {name: "divisa_id", type: "number"},
      {name: "divisa", type: "string"},
      {name: "tipo_cambio", type: "number"},
      {name: "serie", type: "string"},
      {name: "condiciones_pago", type: "string"},
      {name: "subtotal", type: "number"},
      {name: "retencion", type: "number"},
      {name: "traslados", type: "number"},
      {name: "retencion_local", type: "number"},
      {name: "traslados_local", type: "number"},
      {name: "descuento", type: "number"},
      {name: "total", type: "number"},
      {name: "observaciones", type: "string"},
      {name: "pagada", type: "bool"},
      {name: "un_solo_pago", type: "bool"},
      {name: "fecha_pago", type: "string"},
      {name: "account_company_id", type: "number"},
      {name: "account_company", type: "string"},
      {name: "account_customer_id", type: "number"},
      {name: "account_customer", type: "string"},
      {name: "tipo_comprobante", type: "string"},
      {name: "exportacion", type: "string"},
      {name: "version", type: "number"},
      {name: "importada", type: "bool"},
      {name: "is_active", type: "bool"},
    ]
  };
  public dataAdapterImport: any = new jqx.dataAdapter(this.sourceImport);
  public columnsImport: any[] = [
    {text: "Tipo comprobante", datafield: "tipo_comprobante", width: 100},
    {text: "Version", datafield: "version", width: 80},
    {text: "RFC Emisor", datafield: "company_rfc", width: 180},
    {text: "Emisor", datafield: "company", width: 300},
    {text: "Sucursal", datafield: "branch_company", width: 180},
    {text: "RFC Receptor", datafield: "client_rfc", width: 180},
    {text: "Receptor", datafield: "client", width: 300},
    {text: "Uso CFDI", datafield: "uso_cfdi", width: 100},
    {text: "Forma de pago", datafield: "forma_pago", width: 100},
    {text: "Metodo de pago", datafield: "metodo_pago", width: 100},
    {text: "Divisa", datafield: "divisa", width: 100},
    {text: "Tipo cambio", datafield: "tipo_cambio", width: 80},
    {text: "Serie", datafield: "serie", width: 120},
    {text: "Condiciones de pago", datafield: "condiciones_pago", width: 180},
    {text: "Subtotal", datafield: "subtotal", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Retencion", datafield: "retencion", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Traslados", datafield: "traslados", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Retención local", datafield: "retencion_local", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Traslados local", datafield: "traslados_local", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Descuento", datafield: "descuento", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Total", datafield: "total", width: 110, cellsalign: 'right', cellsformat: 'c2'},
    {text: "Observaciones", datafield: "observaciones"},
  ];

  private modalRefCE: any = null;
  private modalRefDetail: any = null;
  private modalRefSignInvoice: any = null;
  private modalRefCancelInvoice: any = null;
  private modalRefTemplates: any = null;
  private modalRefLocalTax: any = null;
  private modalRefPays: any = null;
  private modalRefPay: any = null;
  private modalRefImportadorXML: any = null;
  private modalRefImportadorXLSX: any = null;
  private modalRefErrorImportadorXLSX: any = null;
  private modalRefViewImportadorXLSX: any = null;
  private modalRefViewEmail: any = null;
  private session: ISession = {};
  private flag: Boolean = false;

  public columns: any[] = [
    // {text: 'Id', datafield: 'id', width: 90, pinned: true },
    {text: '', datafield: 'status_cfdi', width: 40, pinned: true, cellsrenderer: (row: number, datafield: string, value: number) => {
      let class_ = "text-danger";
      if(value == 0)
        class_ = 'text-warning';
      else if(Number(value) == 1)
        class_ = 'text-success';
      else if (Number(value) == 4)
        class_ = 'text-warning';
      else
        class_ = 'text-danger';

      return `<div class="text-center align-middle py-2">
        <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
      </div>`;
    }},
    {text: 'T.C.', datafield: 'tipo_comprobante', width: 35, pinned: true, cellsalign: 'center'},
    {text: 'V', datafield: 'version', width: 30, pinned: true, cellsalign: 'center', cellsrenderer: (row: number, datafield: string, value: number) =>{
      return `<div class="text-center align-middle py-2">
        ${Number(value).toFixed(1)}
      </div>`;
    }},
    {text: 'Serie / Folio', datafield: 'folio', width: 100, cellsrenderer: (row: number, datafield: string, value: number, a: any, b: any, c: any) => {
      return `<div class="text-center align-middle py-2">
        ${(typeof c.serie == "undefined" || c.serie == null || String(c.serie).trim() == "") ? '' : `${c.serie}-` }${ (typeof value == "undefined" || value == null) ? '' : value }
      </div>`;
    }},
    {text: 'Pagada', datafield: 'pagada', columntype: "checkbox", width: 67, pinned: true},
    {text: 'MP', datafield: 'metodo_pago', width: 40, pinned: true },
    {text: 'IMP', datafield: 'importada', width: 40, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      if (value)
        return `<div class="text-center align-middle py-2">
          <i class="fas fa-angle-double-down fa-sm fa-fw text-center text-success"></i>
        </div>`;
      return '';
    }, pinned: true },
    {text: 'Enviado', datafield: 'email', width: 45, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      if (value)
        return `<div class="text-center align-middle py-2">
          <i class="fas fa-paper-plane fa-lg fa-fw text-center text-success"></i>
        </div>`;
      return '';
    }, pinned: true },
    {text: 'Emisor', datafield: 'emisor', width: 300 },
    {text: 'Receptor', datafield: 'receptor', width: 260 },
    {text: 'Sucursal', datafield: 'sucursal', width: 160 },
    {text: 'Forma pago', datafield: 'forma_pago', width: 200 },
    {text: 'Uso cfdi', datafield: 'uso_cfdi', width: 80 },
    {text: 'Divisa', datafield: 'divisa', width: 80 },
    {text: 'Tipo cambio', datafield: 'tipo_cambio', width: 80, cellsalign: 'right', cellsformat: 'c2', align: 'right' },
    {text: 'F. emisión', datafield: 'fecha_emision', width: 140, cellsformat: 'D'},
    {text: 'F. certificación', datafield: 'fecha_certificacion', width: 140, cellsformat: 'D'},
    {text: 'F. cancelación', datafield: 'fecha_cancelacion', width: 140, cellsformat: 'D'},
    {text: 'Folio Fiscal', datafield: 'folio_fiscal', width: 300 },
    {text: '(+)Subtotal', datafield: 'subtotal', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(+)T. federal', datafield: 'traslado_federal', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-)R. federal', datafield: 'retencion_federal', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(+)T. local', datafield: 'traslados_local', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-)R. local', datafield: 'retencion_local', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-)Descuento', datafield: 'descuento', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(=)Total', datafield: 'total', width: 150, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: 'Fecha creacion', datafield: 'created_at', width: 170, cellsformat: 'D'},
  ];
  constructor(
    private service: InvoicesService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private generalService: GeneralService,
    private router: Router
  ){}
  ngAfterViewInit(): void {
    
  }
  
  ngOnInit(): void {
    const s = localStorage.getItem("session");
    try{
      this.session = JSON.parse(s!);

      if(this.session.is_superuser){
        this.source.datafields.push({ name: 'staff', type: 'string' });
        this.columns.push({text: 'Staff', datafield: 'staff', width: 200, pinned: true });
      }
    }catch(e){}

    this.list_root_tipo_comprobante = getTypeDocument();
    this.list_root_status_cfdi = getStatusCfdi();
    this.list_root_type_date = getDateType();
    this.service.loadCombosRoot().subscribe(data => {
      this.list_root_emisor = data.empresas;
      this.list_root_receptor = data.clientes;
    });
    this.load();

    /*this.service.check().subscribe((resp: any) => {
      if (typeof resp != "boolean"){
        if (resp.type == "alert"){
          alertWarning(resp.detail);
        }else if (resp.type == "message"){
          alertOk(resp.detail);
        }
      }
      this.list_root_tipo_comprobante = getTypeDocument();
      this.list_root_status_cfdi = getStatusCfdi();
      this.list_root_type_date = getDateType();
      this.service.loadCombosRoot().subscribe(data => {
        this.list_root_emisor = data.empresas;
        this.list_root_receptor = data.clientes;
      });
      this.load();
    }, error => {
      alertError(error.error.detail || "");
      this.router.navigate(['/app']);
    });*/
    
    
  }

  getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter)
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0)
        delete filter[att];
    return filter;
  }

  load(): void{
    this.service.gets(this.getFilter()).subscribe((result: any) => {
      if (typeof result["data"] != "undefined" && !this.flag){
        this.source.localdata = result["data"];
        dialog(result.detail, 'success', 2500);
      }else{
        this.source.localdata = result;
      }
      this.jqxGridDocumentos.updatebounddata();
    }, error => {
      alertError(error.error.detail || "");
      this.router.navigate(['/app']);
    });
  }

  selectedCompanyCE(event: any){
    this.form.controls["branch_company_id"].setValue(null);
    this.form.controls["serie"].setValue(null);
    this.list_ce_branchs = [];
    this.list_ce_cuentas_empresa = [];
    if (typeof event !== "undefined"){
      this.list_ce_branchs = event.sucursales || [];
      this.list_ce_cuentas_empresa = event.cuentas || [];
      for(var i in this.list_ce_branchs){
        if(String(this.list_ce_branchs[i].nombre).trim().toUpperCase() == "MATRIZ"){
          this.form.controls["branch_company_id"].setValue(this.list_ce_branchs[i].id);
          this.form.controls["serie"].setValue(this.list_ce_branchs[i].serie || '');
          break;
        }
      }
    }
  }

  selectedCustomerCE(event: any){
    this.list_ce_cuentas_cliente = [];
    if(this.form.controls['tipo_comprobante'].value != TypeDocument.Pago){
      this.form.controls["uso_cfdi_id"].setValue(null);
      if (typeof event != "undefined"){
        this.form.controls["uso_cfdi_id"].setValue(event.uso_cfdi_id || null);
      }
    }
    if (typeof event != "undefined"){
      this.list_ce_cuentas_cliente = event.cuentas || [];
    }
  }

  public buildForm(): void{
    this.list_taxs = getTypeTax();
    this.list_tasa_cuota = getTasaCuota();
    this.list_tipos = getTrasladoRetencion();
    this.form = this.formBuilder.group({
      id: [null],
      company_id: [null, [Validators.required]],
      branch_company_id: [null, [Validators.required]],
      client_id: [null, [Validators.required]],
      uso_cfdi_id: [null, [Validators.required]],
      forma_pago_id: [null, [Validators.required]],
      metodo_pago_id: [null, [Validators.required]],
      divisa_id: [null, [Validators.required]],
      tipo_cambio: [1, [Validators.required]],
      serie: [null],
      condiciones_pago: [null],
      subtotal: [0],
      retencion: [0],
      traslados: [0],
      retencion_local: [0],
      traslados_local: [0],
      descuento: [0],
      total: [0],
      observaciones: [null],
      relacionados: this.formBuilder.array([]),
      detalles: this.formBuilder.array([]),
      pagada: [false],
      un_solo_pago: [false],
      fecha_pago: [null],
      account_company_id: [null],
      account_customer_id: [null],
      tipo_comprobante: [TypeDocument.Ingreso, [Validators.required]],
      decimales: [6],
      exportacion: [Exportacion['No aplica'], [Validators.required]],
      version: [4.0],
      importada: [false],
      is_active: [true],
      complementos: this.formBuilder.group({}),
    });
  };

  setDecimal(event: any){
    if(typeof event.target.value !== "undefined"){
      this.dp = event.target.value;
      this.recalculaDocumento();
    }
  }

  changeTypeDocument(event: any){
    if(typeof event != "undefined"){
      clearFormArray(this.getFormArray('detalles', this.form));
      this.form.controls["metodo_pago_id"].setValidators([Validators.required]);
      this.form.controls["forma_pago_id"].setValidators([Validators.required]);
      this.form.controls["metodo_pago_id"].updateValueAndValidity();
      this.form.controls["forma_pago_id"].updateValueAndValidity();

      switch(event){
        case TypeDocument.Ingreso:
        case TypeDocument.Egreso:
          for(var i in this.list_ce_divisas){
            if(this.list_ce_divisas[i].clave === "MXN"){
              this.ndecimal = this.list_ce_divisas[i].ndecimal;
              this.form.controls["divisa_id"].setValue(this.list_ce_divisas[i].id);
              break;
            }
          }
          for(var i in this.list_ce_metodo_pago){
            if(this.list_ce_metodo_pago[i].clave === "PUE"){
              this.form.controls["metodo_pago_id"].setValue(this.list_ce_metodo_pago[i].id);
              break;
            }
          }
          for(var i in this.list_ce_forma_pago){
            if(this.list_ce_forma_pago[i].clave === "03"){
              this.form.controls["forma_pago_id"].setValue(this.list_ce_forma_pago[i].id);
              break;
            }
          }
        break;
        case TypeDocument.Pago:
          let detail: any = {
            concepto: 'Pago',
            precio_unitario: 0,
            cantidad: 1,
            descuento: 0,
            subtotal: 0,
            total: 0,
            objeto_impuesto: ObjetoImpuesto.no_objeto_impuesto,
            producto_servicio_id: null,
            unidad_medida_id: null,
            impuestos: [],
          };
          for(var i in this.list_ce_usos_cfdi){
            if(this.list_ce_usos_cfdi[i].clave == "CP01"){
              this.form.controls["uso_cfdi_id"].setValue(this.list_ce_usos_cfdi[i].id);
              break;
            }
          }
          this.form.controls["metodo_pago_id"].setValue(null);
          this.form.controls["forma_pago_id"].setValue(null);
          this.form.controls["metodo_pago_id"].clearValidators();
          this.form.controls["forma_pago_id"].clearValidators();
          this.form.controls["metodo_pago_id"].updateValueAndValidity();
          this.form.controls["forma_pago_id"].updateValueAndValidity();
          for(var i in this.list_ce_divisas){
            if(this.list_ce_divisas[i].clave === "XXX"){
              this.form.controls["divisa_id"].setValue(this.list_ce_divisas[i].id);
              break;
            }
          }
          this.generalService.findProductoServicio("84111506", "84111506").subscribe((data: IProductoServicio[]) => {
            if (data.length == 1){
              detail.producto_servicio_id = data[0].id;
              this.generalService.findUnidadMedida("ACT", "ACT").subscribe((unidades: IUnidadMedida[]) => {
                if (unidades.length == 1){
                  detail.unidad_medida_id = unidades[0].id;
                  const form = this.buildFormDetalle();
                  form.patchValue(detail);
                  this.getFormArray('detalles', this.form).push(form);
                  this.recalculaDocumento();
                }
              });
            }
          });
        break;
      }
    }
  }

  buildFormDetalle(){
    return this.formBuilder.group({
      id: [0],
      producto_id: [null],
      concepto: ['', [Validators.required]],
      precio_unitario: [0, [Validators.required]],
      cantidad: [1, [Validators.required]],
      descuento: [0],
      subtotal: [0],
      total: [0],
      objeto_impuesto: [ObjetoImpuesto.no_objeto_impuesto],
      producto_servicio_id: [null],
      producto_servicio: [null],
      unidad_medida_id: [null],
      unidad_medida: [null],
      impuestos: this.formBuilder.array([]),
    });
  }

  buildFormImpuesto(){
    const form = this.formBuilder.group({
      tax_id: [null],
      nombre: [''],
      impuesto: [null],
      tasa_cuota: [null],
      valor: [0],
      tipo: [null],
      base: [0],
      total: [0],
    });
    return form;
  }

  getCombosDetail(callback: Function){
    if(this.list_ce_detalle_impuestos.length > 0){
      return callback();
    }else{
      this.generalService.getTax().subscribe(impuestos => {
        this.list_ce_detalle_impuestos= impuestos;
        return callback();
      });
    }
  }

  selectedTax(event: any = {}){
    if(typeof event == "undefined") return;
    for(var i in this.list_ce_detalle_impuestos){
      if(this.list_ce_detalle_impuestos[i].tax_id == event){
        event = this.list_ce_detalle_impuestos[i];
        break;
      }
    }


    if (Object.keys(event || {}).length <= 0) return;
    const tax = JSON.parse(JSON.stringify(event));
    const impuestos = this.getFormArray('impuestos', this.formDetail).value;
    let flag = false;
    for(var i in impuestos){
      if(impuestos[i].tax_id == tax.tax_id){
        flag = true;
        break;
      }
    }
    if (!flag){
      let tasa = null;
      if (tax.tasa_cuota != "Exento"){
        tasa = tax.valor;
      }else{
        tasa = null;
      }

      var precio_unitario = this.formDetail.controls['precio_unitario'] .value || 0;
      var cantidad = this.formDetail.controls['cantidad'].value || 0;
      var descuento = this.formDetail.controls['descuento'].value || 0;

      cantidad = presicion(cantidad, this.dp);
      precio_unitario = presicion(precio_unitario, this.dp);

      var subtotal = precio_unitario * cantidad;
      subtotal = presicion(subtotal, this.dp);
      this.formDetail.controls["subtotal"].setValue(subtotal);
      tax.total = null;
      if (tax.tasa_cuota != "Exento"){
        tax.total = presicion(tasa * subtotal, this.dp);
      }
      tax.base = presicion(subtotal - descuento, this.dp);
      const formGroupTax = this.buildFormImpuesto();
      formGroupTax.patchValue(tax);
      this.getFormArray('impuestos', this.formDetail).push(formGroupTax);
      this.formDetail.controls["objeto_impuesto"].setValue(ObjetoImpuesto.si_objeto_impuesto); 
      this.recalcularDesglose();
    }
  }

  recalculaGeneralesDesglose(){
    const precio_unitario = this.formDetail.controls['precio_unitario'] .value || 0;
    const cantidad = this.formDetail.controls['cantidad'].value || 0;
    this.formDetail.controls['subtotal'].setValue(presicion(precio_unitario * cantidad, this.dp));
    this.recalcularDesglose();
  }

  recalcularDesglose(){
    const impuestos = this.getFormArray('impuestos', this.formDetail).controls;
    var sum = 0;
    const subtotal = this.formDetail.controls['subtotal'] .value || 0;
    const descuento = this.formDetail.controls['descuento'].value || 0;
    var base = presicion(subtotal - descuento, this.dp);
    for(var index in impuestos){
      var value = impuestos[index].value;
      value.base = base;
      var total = null;
      if (value.tasa_cuota != "Exento"){
        total = presicion(value.valor * base, this.dp);
      }
      value.total = total;
      if (String(value.tipo).trim().toLowerCase() == "retencion"){
        sum = sum - value.total;
      }else if(String(value.tipo).trim().toLowerCase() == "traslado"){
        sum = sum + value.total;
      }
      impuestos[index].setValue(value);
    }
    this.formDetail.controls['total'].setValue(presicion((subtotal + sum - descuento), this.dp));
  }

  removeTax(index:number){
    alertConfirm("¿Realmente desea eliminar el registro?", (result: any) => {
      if (result.isConfirmed){
        this.getFormArray('impuestos', this.formDetail).removeAt(index);
        this.recalcularDesglose();
      }
    });
  }
  // Regresar
  openCreateEditDetail(modal: any, index: number = -1){
    if (index >= 0){
      const detalle = getFormArray('detalles', this.form).value[index];
      this.formDetail = this.buildFormDetalle();
      this.formDetail.patchValue(detalle);

      const formGroupTax = (detalle.impuestos || []).map((tax: any) => {
        const form = this.buildFormImpuesto();
        form.patchValue(tax);
        return form;
      });
      this.formDetail.setControl('impuestos', this.formBuilder.array(formGroupTax));
    }else{
      this.formDetail = this.buildFormDetalle();
    }

    this.getCombosDetail(()=>{
      this.modalRefDetail = this.modalService.open(modal, {size: 'lg', backdrop: "static", animation:true});
      this.modalRefDetail.closed.subscribe((result: any | boolean) => {
        if (typeof result != "undefined"){
          if(typeof result == 'boolean' && result == false){}
          else{
            if(index < 0){
              this.getFormArray('detalles', this.form).push(result);
            }else{
              this.getFormArray('detalles', this.form).removeAt(index);
              this.getFormArray('detalles', this.form).insert(index, result);
            }
            this.recalculaDocumento();
          }
          this.modalRefDetail.close();
        }
      });
    });
  }

  deleteDetail(index: number){
    alertConfirm("¿Realmente desea eliminar el registro seleccinado?", (result: any) =>{
      if (result.isConfirmed){
        this.getFormArray('detalles', this.form).removeAt(index);
        this.recalculaDocumento();
      }
    });
  }

  saveDetail(event: Event){
    event.preventDefault();
    if(this.formDetail.invalid){
      return this.form.markAllAsTouched();
    }
    this.modalRefDetail.close(this.formDetail);
  }

  searchProductoServicio: OperatorFunction<string, readonly IProductoServicio[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 5
    }),
    debounceTime(600),
    distinctUntilChanged(),
    tap(() => (this.searchingPS = true)),
    switchMap((term: string) => this.generalService.findProductoServicio(term).pipe(
      tap(() => this.searchFailedPS = false),
      catchError(() => {
        this.searchFailedPS = true;
        return []
      })
    )),
    tap(() => (this.searchingPS = false)),
  );

  searchUnidadMedida: OperatorFunction<string, readonly IUnidadMedida[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 2
    }),
    debounceTime(600),
    distinctUntilChanged(),
    tap(() => (this.searchingUM = true)),
    switchMap((term: string) => this.generalService.findUnidadMedida(term).pipe(
      tap(() => this.searchFailedUM = false),
      catchError(() => {
        this.searchFailedUM = true;
        return []
      })
    )),
    tap(() => (this.searchingUM = false)),
  );
  resultFormatterProductoServicioClaveUnidad(value: any) {
    return `${value.clave} - ${value.descripcion}`;
  }

  inputFormatterProductoServicioClaveUnidad(value: any){
    if (value.clave)
    return `${value.clave} - ${value.descripcion}`;
    return value;
  }

  selectedProductoServicio(result: any){
    this.formDetail.controls['producto_servicio_id'].setValue(result.id);
    this.formDetail.controls['producto_servicio'].setValue(`${result.clave} - ${result.descripcion}`);
  }

  selectedUnidadMedida(result: any) {
    this.formDetail.controls['unidad_medida_id'].setValue(result.id);
    this.formDetail.controls['unidad_medida'].setValue(`${result.clave} - ${result.descripcion}`);
  }

  changeDesglose(){
    this.recalculaDocumento();
  }

  recalculaDocumento(){
    if(this.form.controls['tipo_comprobante'].value != TypeDocument.Traslado){
      var sumSubtotal = 0, sumDecuento = 0, granTotal = 0, totalTraslado = 0, totalRetencion = 0;
      const detalles = this.getFormArray('detalles', this.form).controls;
      for (var i in detalles){
        var detalle = detalles[i].value;

        var precio_unitario = detalle.precio_unitario || 0;
        var cantidad = detalle.cantidad || 0;
        const descuento = detalle.descuento || 0;
        detalle.subtotal = presicion(precio_unitario * cantidad, this.dp);
        var totalTrasladoXC = 0, totalRetencionXC = 0;
        var base = presicion(detalle.subtotal - descuento, this.dp);
        const impuestos = detalle.impuestos || [];
        
        for(var j in impuestos){
          impuestos[j].base = base;
          var total = null;
          if (impuestos[j].tasa_cuota != "Exento"){
            total = presicion(base * impuestos[j].valor, this.dp);
            impuestos[j].total = total;
          }

          if (String(impuestos[j].tipo).trim().toLowerCase() == "retencion"){
            totalRetencion += Number(impuestos[j].total || 0);
            totalRetencionXC += Number(impuestos[j].total || 0);
          }else if(String(impuestos[j].tipo).trim().toLowerCase() == "traslado"){
            totalTraslado += Number(impuestos[j].total || 0);
            totalTrasladoXC += Number(impuestos[j].total || 0);
          }
        }
        sumDecuento += detalle.descuento || 0;
        sumSubtotal += detalle.subtotal || 0;
        detalle.total = Number(detalle.subtotal) + totalTrasladoXC - (totalRetencionXC + detalle.descuento);
        detalle.total = presicion(detalle.total, this.dp);
        detalles[i].setValue(detalle);
      }

      const complementos = this.getFormControl("complementos", this.form);
      let implocal = [];
      if(this.checkExitComplement('implocal')){
        const complementos = this.getFormControl('complementos', this.form);
        const localTax = complementos.get("implocal");
        implocal = localTax.value;
      }
      var totalTrasladoLocales = 0, totalRetencionLocales = 0;

      for(var i in implocal){
        if(String(implocal[i].tipo).toLowerCase() == "retencion"){
          totalRetencionLocales += Number(implocal[i].importe);
        }
        if(String(implocal[i].tipo).toLowerCase() == "traslado"){
          totalTrasladoLocales += Number(implocal[i].importe);
        }
      }

      sumSubtotal = presicion(sumSubtotal, this.ndecimal);
      totalTraslado = presicion(totalTraslado, this.ndecimal);
      totalRetencion = presicion(totalRetencion, this.ndecimal);
      sumDecuento = presicion(sumDecuento, this.ndecimal);
      totalTrasladoLocales = presicion(totalTrasladoLocales, this.ndecimal);
      totalRetencionLocales = presicion(totalRetencionLocales, this.ndecimal);

      granTotal = sumSubtotal + totalTraslado - (totalRetencion + sumDecuento) + totalTrasladoLocales - totalRetencionLocales;
      granTotal = presicion(granTotal, this.dp);
      this.form.controls["subtotal"].setValue(sumSubtotal);
      this.form.controls["retencion"].setValue(totalRetencion);
      this.form.controls["traslados"].setValue(totalTraslado);
      this.form.controls["retencion_local"].setValue(totalRetencionLocales);
      this.form.controls["traslados_local"].setValue(totalTrasladoLocales);
      this.form.controls["descuento"].setValue(sumDecuento);
      this.form.controls["total"].setValue(granTotal);
    }
  }

  toEditStudentControl: any;
  editIndex: number = 0;
  openModal(modal: any, index: number){
    this.editIndex = index;
    this.toEditStudentControl = this.getFormArray('detalles', this.form).controls[index];
    this.modalService.open(modal, {size: 'lg', backdrop: "static", animation:true});
  }

  openCreate(){
    this.buildForm();
    this.loadCombosCE(() =>{
      // Ponemos los combos default para evitar algunos errores de validación
      // Si solo hay una empresa la seleccionamos y su MATRIZ
      if(this.list_ce_companys.length == 1){
        this.form.controls["company_id"].setValue(this.list_ce_companys[0].id);
        this.list_ce_branchs = this.list_ce_companys[0].sucursales || [];
        this.list_ce_cuentas_empresa = this.list_ce_companys[0].cuentas || [];
        for(var i in this.list_ce_branchs){
          if(String(this.list_ce_branchs[i].nombre).trim().toUpperCase() == "MATRIZ"){
            this.form.controls["branch_company_id"].setValue(this.list_ce_branchs[i].id);
            this.form.controls["serie"].setValue(this.list_ce_branchs[i].serie || '');
            break;
          }
        }
      }
      for(var i in this.list_ce_tipo_comprobante){
        if (this.list_ce_tipo_comprobante[i] === 'I'){
          this.form.controls["tipo_comprobante"].setValue(this.list_ce_tipo_comprobante[i].value);
          break;
        }
      }
      for(var i in this.list_ce_divisas){
        if(this.list_ce_divisas[i].clave === "MXN"){
          this.form.controls["divisa_id"].setValue(this.list_ce_divisas[i].id);
          this.ndecimal = this.list_ce_divisas[i].ndecimal;
          break;
        }
      }
      for(var i in this.list_ce_metodo_pago){
        if(this.list_ce_metodo_pago[i].clave === "PUE"){
          this.form.controls["metodo_pago_id"].setValue(this.list_ce_metodo_pago[i].id);
          break;
        }
      }
      for(var i in this.list_ce_forma_pago){
        if(this.list_ce_forma_pago[i].clave === "03"){
          this.form.controls["forma_pago_id"].setValue(this.list_ce_forma_pago[i].id);
          break;
        }
      }
      this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: "static", animation:true, size: "xl"});
    });
  }

  loadCombosCE(callback: Function): void{
    this.service.loadCombosCE().subscribe(data => {
      this.list_ce_companys = data.empresas;
      this.list_ce_customers = data.clientes;
      this.list_ce_tipo_comprobante = getTypeDocument();
      this.list_ce_usos_cfdi = data.usos_cfdi;
      this.list_ce_divisas = data.divisas;
      this.list_ce_metodo_pago = data.metodos_pago;
      this.list_ce_forma_pago = data.formas_pago;
      this.list_ce_exportacion = getExportacion();
      return callback();
    });
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridDocumentos);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    if (seleccionado[0].status_cfdi != StatusCfdi.Pendiente){
      return alertError(`Seleccione registros con estatus: Pendiente`);
    }
    this.buildForm();
    this.loadCombosCE(() =>{
      this.service.get(seleccionado[0].id).subscribe((documento: any) => {

        for(var i in this.list_ce_customers){
          if(this.list_ce_customers[i].id == documento.client_id){
            this.list_ce_cuentas_cliente = this.list_ce_customers[i].cuentas || [];
            break;
          }
        }

        for(var i in this.list_ce_companys){
          if (this.list_ce_companys[i].id == documento.company_id){
            this.list_ce_branchs = this.list_ce_companys[i].sucursales;
            this.list_ce_cuentas_empresa = this.list_ce_companys[i].cuentas || [];
            break;
          }
        }

        const detalles = JSON.parse(JSON.stringify(documento.detalles || []));
        const relacionados = JSON.parse(JSON.stringify(documento.relacionados || []));
        const complementos = JSON.parse(JSON.stringify(documento.complementos || {}));

        delete documento.detalles;
        delete documento.relacionados;
        delete documento.complementos;

        if (detalles.length > 0){
          const formGruops = detalles.map((detalle: any)=> {
            const form = this.buildFormDetalle();
            const impuestos = JSON.parse(JSON.stringify(detalle.impuestos || []));
            delete detalle.impuestos;
            if(impuestos.length > 0){
              const formGroupArray = impuestos.map((impuesto: any) => {
                const form = this.buildFormImpuesto();
                form.patchValue(impuesto);
                return form;
              });
              form.setControl('impuestos', this.formBuilder.array(formGroupArray));
            }
            form.patchValue(detalle);
            return form;
          });
          this.form.setControl('detalles', this.formBuilder.array(formGruops));
        }

        if(relacionados.length > 0){
          const formGroupsRelacionados = relacionados.map((relacionado: any) => {
            const form = this.formBuilder.group({
              tipo_relacion: [relacionado.tipo_relacion, [Validators.required]],
              folio_fiscal: [relacionado.folio_fiscal, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]],
            });
            return form;
          });
          this.form.setControl("relacionados", this.formBuilder.array(formGroupsRelacionados));
        }

        this.form.patchValue(documento);
        if (documento.tipo_comprobante == TypeDocument.Pago){
          this.form.controls["metodo_pago_id"].clearValidators();
          this.form.controls["forma_pago_id"].clearValidators();
          this.form.controls["metodo_pago_id"].updateValueAndValidity();
          this.form.controls["forma_pago_id"].updateValueAndValidity();
        }
        if(Object.keys(complementos).length > 0){
          if (typeof complementos["implocal"] != "undefined"){
            this.setImplocal(complementos["implocal"]);
          }
          if(typeof complementos["pays"] != "undefined"){
            this.setPays(complementos["pays"]);
          }
        }
        this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: "static", animation:true, size: "xl"});
      }, error => {
        alertError(error.error.detail|| "No se pudo editar el registro.");
      });
    });
  }

  save(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.update(model.id, model).subscribe(data => {
        dialog("Registro modificado correctamente.", 'success', 2500);
        this.modalRefCE.close();
        this.load();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.create(model).subscribe(data => {
        dialog("Registro agregado correctamente.", 'success', 2500);
        this.modalRefCE.close();
        this.load();
      }, error => {
        alertError(error);
      });
    }
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridDocumentos);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.delete(seleccionado[0].id).subscribe(data => {
          dialog("Registro eliminado correctamente!", "success", 2500);
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar el registro.");
        });
      }
    });
  }

  addRowDetail(){
    let detail: any = {
      concepto: '',
      precio_unitario: 0,
      cantidad: 1,
      descuento: 0,
      subtotal: 0,
      total: 0,
      objeto_impuesto: ObjetoImpuesto.no_objeto_impuesto,
      producto_servicio_id: null,
      unidad_medida_id: null,
      impuestos: [],
    };
    const form = this.buildFormDetalle();
    form.patchValue(detail);
    this.getFormArray('detalles', this.form).push(form);
    this.recalculaDocumento();
  }


  selectedCompanyRoot(event: any){
    this.filter.branch_id = undefined;
    this.list_root_sucursal = event.sucursales || [];
  }
  
  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridDocumentos);
    this.seleccionados = seleccionado.length;
  }

  report(){
    this.service.generateXLSX(this.filter).subscribe((file:any) => {
      this.service.donwload(file);
    }, error => {
      alertError("No se ha podido generar el reporte!");
    });
  }

  sellador: any = {};
  openSignDocument(){
    const seleccionados = getRowsSelected(this.jqxGridDocumentos);
    if(seleccionados.length <= 0){
      return alertError("No ha seleccionado algun registro aun");
    }
    for(var i in seleccionados){
      if (seleccionados[i].status_cfdi != StatusCfdi.Pendiente){
        return alertError('Recuerde seleccionar registros con estatus Pendiente.');
      }
    }
    this.sellador = {
      title: 'Sellar documentos',
      current: 0,
      total: seleccionados.length,
      errores: 0,
      exito: 0,
      erroresDesc: [],
      porcentaje: 0,
      visible: 0,
      registros: seleccionados,
      fecha_emision: (new Date()).toLocaleString("sv-SE").split(" ").join("T"),
    };
    this.modalRefSignInvoice = this.modalService.open(this.modalSignDocument, {backdrop: "static", animation:true});
  }

  signInvoice(){
    if(typeof this.sellador.fecha_emision == "undefined"){
      return alertError("Seleccione la fecha de emisión");
    }
    this.sellador.title = "Sellando documentos";
    this.sellador.visible = 1;
    this.sellador.fecha_emision = this.sellador.fecha_emision.toLocaleString("sv-SE").split(" ").join("T")
    const signOneByOne = (index:number)=>{
      if (index >= this.sellador.registros.length){
        if(this.sellador.errores > 0){
          this.sellador.visible = 2;
        }else{
          dialog('Todos los registros fueron sellados correctamente.', "success", 2500);
          this.modalRefSignInvoice.close();
          this.load();
        }
      }else{
        var x = ((index + 1) * 100) / this.sellador.registros.length;
        this.sellador.current = index + 1;
        this.sellador.porcentaje = Number(Number(x).toFixed(2));
        this.service.sign(this.sellador.registros[index].id, this.sellador.fecha_emision).subscribe(result => {
          this.sellador.exito = this.sellador.exito + 1;
          index++;
          signOneByOne(index);
        }, error => {
          this.sellador.errores = this.sellador.errores + 1;
          this.sellador.erroresDesc.push({
            folio: this.sellador.registros[index].folio,
            serie: this.sellador.registros[index].serie,
            error: (error.error.detail || 'Error al sellar el CFDI')
          });
          index++;
          signOneByOne(index);
        });
      }
    };
    signOneByOne(0);
  }

  public cancelador: any = {};
  abreCancelador(){
    const seleccionado = getRowsSelected(this.jqxGridDocumentos);
    if (seleccionado.length <= 0){
      return alertError('No ha seleccionado registros aun.');
    }
    for(var i = 0; i < seleccionado.length; i++){
      if(seleccionado[i].status_cfdi != StatusCfdi.Sellado){
        return alertError('Recuerde seleccionar registros que esten sellados.');
      }
    }
    this.cancelador = {
        visible: 0,
        current: 0, 
        total: seleccionado.length,
        errores: 0,
        exito: 0,
        erroresDesc: [],
        porcentaje: 0,
        registros: seleccionado
    };
    this.modalRefCancelInvoice = this.modalService.open(this.modalCancelDocument, {backdrop: "static", animation:true, size: "xl"});
  }

  procedeCancelacion(){
    for(var i in this.cancelador.registros){
      if(String(this.cancelador.registros[i].motivo || "").length <= 0){
        return alertError(`El folio ${this.cancelador.registros[i].folio} de la empresa ${this.cancelador.registros[i].emisor} favor de seleccionar su motivo.`);
      }
      if(String(this.cancelador.registros[i].motivo) == "01"){
        if(String(this.cancelador.registros[i].folio_fiscal_sustituye || "").length <= 0){
          return alertError(`El folio ${this.cancelador.registros[i].folio} de la empresa ${this.cancelador.registros[i].emisor} cuando selecciona la opcion 01 debe de proporcionar el UUID que sustituye.`);
        }else{
          if(String(this.cancelador.registros[i].folio_fiscal_sustituye || "") == String(this.cancelador.registros[i].folio_fiscal || "")){
            return alertError(`El folio ${this.cancelador.registros[i].folio} de la empresa ${this.cancelador.registros[i].emisor} no puede agregar el mismo folio fiscal de la factura que intenta cancelar.`);
          }
          if(!/[a-f0-9A-F]{8}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{12}/.test(this.cancelador.registros[i].folio_fiscal_sustituye)){
            return alertError(`En folio ${this.cancelador.registros[i].folio} de la empresa ${this.cancelador.registros[i].emisor} el UUID propcionado no es tiene una estructura valido.`);
          }
        }
      }
    }
    this.cancelarFactura();
  }

  cancelarFactura(){
    if((this.cancelador.registros || []).length > 0){
      this.cancelador.visible = 1;
      const canceladorIndividual = (index: number) => {
        if(index >= this.cancelador.registros.length){
          if(this.cancelador.errores > 0){
            this.cancelador.visible = 2;
          }else{
            this.modalRefCancelInvoice.close();
            dialog('Todos los registros fueron CANCELADOS correctamente.', 'success', 2500);
            this.load();
          }
        }else{
          var x = ((index + 1) * 100) / this.cancelador.registros.length;
          this.cancelador.current = index + 1;
          this.cancelador.porcentaje = Number(Number(x).toFixed(2));
          this.service.cancel(
            this.cancelador.registros[index].id, 
            this.cancelador.registros[index].motivo, 
            this.cancelador.registros[index].folio_fiscal_sustituye
          ).subscribe(resp => {
            this.cancelador.exito++;
            index++;
            canceladorIndividual(index);
          }, error => {
            this.cancelador.errores++;
            this.cancelador.erroresDesc.push({
              folio: this.cancelador.registros[index].folio,
              serie: this.cancelador.registros[index].serie,
              error: ((error.error || {}).detail || 'Error al cancelar el CFDI')
            });
            index++;
            canceladorIndividual(index);
          });
        }
      }
      canceladorIndividual(0);
    }
}


  public generator: any = {
    registers:[],
  };

  openTemplates(opc: string='pdf'){
    const seleccionados = getRowsSelected(this.jqxGridDocumentos);
    if(seleccionados.length <= 0){
      return alertError("No ha seleccionado algun registro aun");
    }
    var primero = seleccionados[0];
    for(var i in seleccionados){
      if (primero.tipo_comprobante != seleccionados[i].tipo_comprobante){
        return alertError("Seleccione comprobamtes del mismo tipo");
      }
      if (primero.company_id != seleccionados[i].company_id){
        return alertError("Seleccione comprobamtes del mismo tipo");
      }
      if (primero.client_id != seleccionados[i].client_id){
        return alertError("Seleccione comprobamtes del mismo tipo");
      }
      if (opc == 'xml'){
        if (seleccionados[i].status_cfdi == StatusCfdi.Pendiente){
          return alertError("No puede seleccionar registros con estatus Pendiente.");
        }
      }
    }
    this.generator.registers = seleccionados;
    this.generator.opc = opc;

    this.formTemplate = this.formBuilder.group({
      template: [0, [Validators.required]]
    });
    this.service.getTemplates(1, primero.tipo_comprobante).subscribe((data: any) => {
      this.list_templates_generate = data.templates || [];
      this.formTemplate.controls["template"].setValue(this.list_templates_generate[0].id);
      this.modalRefTemplates = this.modalService.open(this.modalTemplates, {backdrop: "static", animation:true});
    }, error => {});
  }

  generatePdfOrXml(event: Event){
    if (this.formTemplate.invalid){
      this.formTemplate.markAllAsTouched();
    }
    let ids = [];
    for(var i in this.generator.registers){
      ids.push(this.generator.registers[i].id);
    }
    this.modalRefTemplates.close();
    if(this.generator.opc === 'pdf'){
      this.service.generatePDF(ids, this.formTemplate.controls["template"].getRawValue()).subscribe((file: any) => {
        this.service.donwload(file);
      }, error => {
        alertError(error.error.detail || "No se ha podido generar el archivo.");
      });
    }else if(this.generator.opc === 'xml'){
      this.service.generateXML(ids, this.formTemplate.controls["template"].getRawValue()).subscribe((file: any) => {
        this.service.donwload(file);
      }, error => {
        alertError(error.error.detail || "No se ha podido generar el archivo.");
      });
    }
  }

  list_local_tax: any [] = [];
  loadLocalTax(callback: Function){
    if(this.list_local_tax.length > 0){
      return callback();
    }else{
      this.generalService.getTax('L').subscribe(impuestos => {
        this.list_local_tax= impuestos;
        return callback();
      });
    }
  }

  buildFormImplocal(){
    this.formImplocal = this.formBuilder.group({
      impuestos: this.formBuilder.array([]),
    });
  }

  setImplocal(array: any[]){
    const implocalGroups = array.map((local: any) => {
      return this.buildFormLocalTax(local)
    });
    const complementos = this.getFormControl('complementos', this.form);
    complementos.removeControl('implocal');
    complementos.addControl('implocal', this.formBuilder.array(implocalGroups));
    this.form.addControl('complementos', complementos);
  }

  setPays(pays: any[]){
    this.buildFormPays();
    let total = 0;
    const paysGroups = (pays || []).map((pay: any) => {
      total += pay.total;
      const form = this.buildFormPay();
      form.patchValue(pay);
      const docsGroups = (pay.documentos || []).map((documento: any) => {
        return this.buildFormDocument(documento); 
      });
      form.setControl('documentos', this.formBuilder.array(docsGroups));
      return form;
    });
    const formArray = this.formBuilder.array(paysGroups);
    this.formPays.setControl("pays", formArray);
    this.formPays.controls["total"].setValue(total);

    const complementos = this.getFormControl('complementos', this.form);
    complementos.removeControl('pays');
    complementos.addControl('pays', formArray);
    this.form.addControl('complementos', complementos);
  }

  settingComplementImplocal(){
    this.buildFormImplocal();
    this.loadLocalTax(() =>{
      if(this.checkExitComplement('implocal')){
        const complementos = this.getFormControl('complementos', this.form);
        const localTax = complementos.get("implocal");
        const implocalGroups = (localTax.value || []).map((local: any) => {
          return this.buildFormLocalTax(local);
        })
        const formArray = this.formBuilder.array(implocalGroups);
        this.formImplocal.setControl("impuestos", formArray);
      }
      this.modalRefLocalTax = this.modalService.open(this.modalComplementImplocal, {size: 'lg', backdrop: "static", animation:true});
    });
  }

  buildFormLocalTax(value: any = {}){
    return this.formBuilder.group({
      tax_id: [value.tax_id || null],
      nombre: [value.nombre || null],
      impuesto: [value.impuesto || null],
      tasa_cuota: [value.tasa_cuota || null],
      valor: [value.valor || 0],
      tipo: [value.tipo || null],
      importe: [value.importe || 0, [Validators.required, Validators.min(0.01)]],
    });
  }

  selectedLocalTax(event: any){
    if (Object.keys(event || {}).length <= 0) return;
    const tax = JSON.parse(JSON.stringify(event));
    const impuestos = this.getFormArray('impuestos', this.formImplocal).value;
    let flag = false;
    for(var i in impuestos){
      if(impuestos[i].tax_id == tax.tax_id){
        flag = true;
        break;
      }
    }
    if (!flag){
      const formGroupTax = this.buildFormLocalTax(tax);
      this.getFormArray('impuestos', this.formImplocal).push(formGroupTax);
    }
  }

  deleteImplocal(index: number){
    alertConfirm("¿Realmente desea eliminar el registro seleccinado?", (result: any) =>{
      if (result.isConfirmed){
        this.getFormArray('impuestos', this.formImplocal).removeAt(index);
      }
    });
  }

  deleteComplement(key: string, name: string): void{
    alertConfirm(`¿Realmente desea eliminar el complemento ${name}?`, (result: any) => {
      if (result.isConfirmed){
        const complementos = this.getFormControl('complementos', this.form);
        complementos.removeControl(key);
        this.form.addControl('complementos', complementos);
      }
    });
  }

  saveImplocal(event: Event):void{
    event.preventDefault();
    if(this.formImplocal.invalid){
      return this.formImplocal.markAllAsTouched();
    }
    let implocal = this.getFormArray('impuestos', this.formImplocal);
    const complementos = this.getFormControl('complementos', this.form);
    complementos.removeControl('implocal');
    complementos.addControl('implocal', this.formBuilder.array(implocal.controls));
    this.form.addControl('complementos', complementos);
    this.modalRefLocalTax.close();
    this.recalculaDocumento();
  }

  savePays(event: Event): void{
    event.preventDefault();
    if(this.formPays.invalid){
      return this.formPays.markAllAsTouched();
    }
    let pays = getFormArray('pays', this.formPays);
    const complementos = this.getFormControl('complementos', this.form);
    complementos.removeControl('pays');
    complementos.addControl('pays', this.formBuilder.array(pays.controls));
    this.form.addControl('complementos', complementos);
    this.modalRefPays.close();
  }

  checkExitComplement(name: string): boolean{
    const form = this.getFormControl('complementos', this.form);
    return hasKeyInForm(form, name);
  }

  openSettingComplementPay(){
    if(this.checkExitComplement('pays')){
      const complementos = this.getFormControl('complementos', this.form);
      const pays = complementos.get("pays");
      const paysGroups = (pays.value || []).map((pay: any) => {
        const form = this.buildFormPay();
        form.patchValue(pay);
        const docsGroups = (pay.documentos || []).map((documento: any) => {
          return this.buildFormDocument(documento); 
        });
        form.setControl('documentos', this.formBuilder.array(docsGroups));
        return form;
      });
      const formArray = this.formBuilder.array(paysGroups);
      this.formPays.setControl("pays", formArray);
    }else{
      this.buildFormPays();
    }
    this.modalRefPays = this.modalService.open(this.modalComplementPays, {backdrop: "static", animation:true, size: "xl"});
  }

  openCreateEditPay(index: number = -1){
    this.formPay = this.buildFormPay();
    if (index >= 0){
      const pay = getFormArray('pays', this.formPays).at(index).value;
      this.formPay.patchValue(pay);

      const docsGroups = (pay.documentos || []).map((documento: any) => {
        return this.buildFormDocument(documento);
      });
      this.formPay.setControl('documentos', this.formBuilder.array(docsGroups));
      this.recalculaPago();
    }else{
      this.formPay.controls["fecha_pago"].setValue((new Date()).toLocaleString("sv-SE").split(" ").join("T"));
      for(var i in this.list_ce_forma_pago){
        if (this.list_ce_forma_pago[i].clave == "03"){
          this.formPay.controls["forma_pago_id"].setValue(this.list_ce_forma_pago[i].id);
          break;
        }
      }
      for(var i in this.list_ce_divisas){
        if(this.list_ce_divisas[i].clave == "MXN"){
          this.formPay.controls["divisa_id"].setValue(this.list_ce_divisas[i].id);
          this.formPay.controls["tipo_cambio"].setValue(1);
          this.ndecimal = this.list_ce_divisas[i].ndecimal;
          break;
        }
      }
    }
    this.modalRefPay = this.modalService.open(this.modalComplementPayCe, {backdrop: "static", animation:true, size: "xl"});
    this.modalRefPay.closed.subscribe((result: any | boolean) => {
      if (typeof result != "undefined"){
        if(typeof result == 'boolean' && result == false){}
        else{
          if(index < 0){
            this.getFormArray('pays', this.formPays).push(result);
          }else{
            this.getFormArray('pays', this.formPays).removeAt(index);
            this.getFormArray('pays', this.formPays).insert(index, result);
          }
          const pagos = getFormArray('pays', this.formPays).value;
          let total = 0;
          for(var i in pagos){
            total += pagos[i].total;
          }
          this.formPays.controls["total"].setValue(total);
        }
        this.modalRefPay.close();
      }
    });

  }

  deletePay(index: number){
    
  }

  public formPays: FormGroup;
  public formPay: FormGroup;
  public formPayDocument: FormGroup;
  buildFormPays(){
    this.formPays = this.formBuilder.group({
      total: [0],
      pays: this.formBuilder.array([]),
    });
  }

  buildFormPay(): FormGroup{
    return this.formBuilder.group({
      fecha_pago: [(new Date()), [Validators.required]],
      forma_pago_id: [null, [Validators.required]],
      divisa_id: [null, [Validators.required]],
      tipo_cambio: [1, [Validators.required]],
      total: [0, [Validators.required]],
      numero_operacion: [null],
      cuenta_ordenante_id: [null],
      cuenta_destino_id: [null],

      tipo_cad_pago: [null],
      cert_pago: [null],
      cad_pago: [null],
      sello_pago: [null],

      documentos: this.formBuilder.array([]),
    });
  }

  buildFormDocument(document: any = {}): FormGroup{
    let completo = true;
    if(document.max > (document.abono || 0)){
      completo = false;
    }
    const form = this.formBuilder.group({
      folio_fiscal: [document.folio_fiscal || null],
      total: [document.total || null],
      pagado: [document.pagado || null],
      equivalencia: [document.equivalencia || 1],
      max: [document.max || null],
      abono: [document.abono || 0, [Validators.min(0.01), Validators.max(document.max)]],
      completo: [completo],
      anterior: [document.anterior || 0],
      documento_id: [document.documento_id || null],
      divisa_id: [document.divisa_id || null],
      tipo_cambio: [document.tipo_cambio || null],
      porcentaje: [document.porcentaje || 0],
      desglose: this.formBuilder.array([]),
      impuestos: this.formBuilder.array([]),
    });

    // Llenamos el formArray DESGLOSE
    const formGroups = (document.desglose || []).map((detalle: any) => {
      const formDetail = this.buildFormDetalle();
      formDetail.patchValue(detalle);
      const formGroupTax = (detalle.impuestos || []).map((tax: any) => {
        const formTax = this.buildFormImpuesto();
        formTax.patchValue(tax);
        return formTax;
      });
      formDetail.setControl('impuestos', this.formBuilder.array(formGroupTax));
      return formDetail;
    });
    form.setControl('desglose', this.formBuilder.array(formGroups));

    // Por si se esta editando o trae ya los impuestos
    // los agregamos antes de calcular.
    if(typeof document.impuestos != "undefined" && document.impuestos.length > 0){
      const formGroupTax = (document.impuestos || []).map((tax: any) => {
        const formTax = this.buildFormImpuesto();
        formTax.patchValue(tax);
        return formTax;
      });
      form.setControl('impuestos', this.formBuilder.array(formGroupTax));
    }
    return form;
  }

  selectedDocumentToPay(result: any){
    if(typeof result != "undefined"){
      const documentos = getFormArray("documentos", this.formPay).value;
      let flag = false;
      for(var i in documentos){
        if(documentos[i].documento_id == result.id){
          flag = true;
          break;
        }
      }

      if(!flag){
        const form = this.buildFormDocument(result);
        this.getFormArray('documentos', this.formPay).push(form);
        this.recalculaPago();
      }
    }
  }

  recalculaPago(index: number = -1):void{
    var totalPago = 0;
    const documentos = getFormArray('documentos', this.formPay).value;
    for(var i in documentos)
      totalPago += Number(documentos[i].abono);
    this.formPay.controls["total"].setValue(presicion(totalPago, this.dp));
    this.calculaImpuestoPorcentaje(index);
  }

  activaDesactivaPagoCompleto(index:number){
    const current = getFormArray('documentos', this.formPay).at(index).value;
    if(current.completo){
      current.abono = current.max;
    }
    getFormArray('documentos', this.formPay).at(index).setValue(current);
    this.recalculaPago(index);
  }

  calculaImpuestoPorcentaje(index: number = -1):void{
    let documentos = [];
    if (index >= 0){
      // Solo un determinado documento
      documentos = [getFormArray('documentos', this.formPay).at(index).value];
    }else{
      // Todos los documentos relacionados al pago
      documentos = getFormArray('documentos', this.formPay).value;
    }
    /**
     * documentos[i].max => 100
     * documentos[i].abono => X
     * X = (documentos[i].abono * 100) / documentos[i].max
     * Porcentaje = X / 100
    **/
    for(var i in documentos){
      var X = (documentos[i].abono * 100) / documentos[i].total;
      var porc = X / 100;
      if(porc <= 0){
        porc = 0;
      }else if (porc >= 1){
        porc = 1;
      }
      var hash_idr:any = {};
      // documentos[i].porcentaje = porc;
      let formDocument: FormGroup;
      if(index >= 0){
        formDocument = getFormArray('documentos', this.formPay).at(index) as FormGroup;
      }else{
        formDocument = getFormArray('documentos', this.formPay).at(Number(i)) as FormGroup;
      }
      formDocument.controls["porcentaje"].setValue(porc);
      for(var j in documentos[i].desglose){
        for(var k in documentos[i].desglose[j].impuestos){
          if(typeof hash_idr[documentos[i].desglose[j].impuestos[k].tipo] == "undefined")
            hash_idr[documentos[i].desglose[j].impuestos[k].tipo] = {};
          if(typeof hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto] == "undefined")
            hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto] = {};
          if(typeof hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto][documentos[i].desglose[j].impuestos[k].valor] == "undefined")
            hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto][documentos[i].desglose[j].impuestos[k].valor] = {};
          if(typeof hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto][documentos[i].desglose[j].impuestos[k].valor][documentos[i].desglose[j].impuestos[k].tasa_cuota] == "undefined")
            hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto][documentos[i].desglose[j].impuestos[k].valor][documentos[i].desglose[j].impuestos[k].tasa_cuota] = [];
          
          hash_idr[documentos[i].desglose[j].impuestos[k].tipo][documentos[i].desglose[j].impuestos[k].impuesto][documentos[i].desglose[j].impuestos[k].valor][documentos[i].desglose[j].impuestos[k].tasa_cuota].push(
            documentos[i].desglose[j].impuestos[k]
          );
        }
      }
      var impuestos_doc_relacionado = [];
      for(var tipo in hash_idr){
        for(var impuesto in hash_idr[tipo]){
          for(var valor in hash_idr[tipo][impuesto]){
            for(var tasa_cuota in hash_idr[tipo][impuesto][valor]){
              var impuesto_add: any = {
                tax_id: 0, tipo: tipo, impuesto: impuesto,
                valor: valor, tasa_cuota: tasa_cuota,
                base: 0, total: 0, nombre: null
              };
              var impuestos_agrupados = hash_idr[tipo][impuesto][valor][tasa_cuota];
              for(var j in impuestos_agrupados){
                impuesto_add.base += Number(impuestos_agrupados[j].base);
                impuesto_add.tax_id = impuestos_agrupados[j].tax_id;
                impuesto_add.nombre = impuestos_agrupados[j].nombre;
              }
              impuesto_add.base = presicion(impuesto_add.base * porc, this.dp);
              impuesto_add.total = presicion(impuesto_add.base * impuesto_add.valor, this.dp);
              impuestos_doc_relacionado.push(impuesto_add);
            }
          }
        }
      }
      if (impuestos_doc_relacionado.length > 0){
        const formGroupTax = impuestos_doc_relacionado.map((tax: any) => {
          const formTax = this.buildFormImpuesto();
          formTax.patchValue(tax);
          return formTax;
        });
        formDocument.setControl('impuestos', this.formBuilder.array(formGroupTax));
      }
    }
  }
  
  savePay(event: Event){
    event.preventDefault();
    if (this.formPay.invalid){
      return this.formPay.markAllAsTouched();
    }
    this.modalRefPay.close(this.formPay);
  }

  searchDocumentToPay: OperatorFunction<string, readonly IDocumentPay[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 2
    }),
    debounceTime(500),
    distinctUntilChanged(),
    tap(() => (this.searchingDocs = true)),
    switchMap((term: string) => this.service.findDocumentPay({
      company_id: this.form.controls["company_id"].value,
      customer_id: this.form.controls["client_id"].value,
      query: term,
    }).pipe(
      tap(() => this.searchFailedDocs = false),
      catchError(() => {
        this.searchFailedDocs = true;
        return []
      })
    )),
    tap(() => (this.searchingDocs = false)),
  );

  resultFormatterDocs(value: any) {
    return '';
    return `${value.folio_fiscal}`;
  }

  inputFormatterDocs(value: any){
    return '';

    if (value.folio_fiscal)
    return `${value.folio_fiscal}`;
    return value;
  }

  deleteDocument(index: number){
    alertConfirm("¿Realmente desea eliminar el registro?", (result: any) => {
      if (result.isConfirmed){
        getFormArray('documentos', this.formPay).removeAt(index);
        this.recalculaPago();
      }
    });
  }

  addNewRowRelatedDocument(){
    getFormArray('relacionados', this.form).push(this.formBuilder.group({
      tipo_relacion: [null, [Validators.required]],
      folio_fiscal: [null, [Validators.required, Validators.minLength(36), Validators.maxLength(36)]],
    }));
  }
  deleteRowRelatedDocument(index: number){
    alertConfirm("¿Realmente desea eliminar el registro?", (result: any) => {
      if (result.isConfirmed){
        getFormArray('relacionados', this.form).removeAt(index);
      }
    });
  }

  openReFoliar(){
    const seleccionado = getRowsSelected(this.jqxGridDocumentos);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro antes de continuar.");

    if (seleccionado[0].status_cfdi != StatusCfdi.Pendiente){
      return alertError(`Seleccione registros con estatus: Pendiente`);
    }
    Swal.fire({
      title: "Refoliar ",
      input: "text",
      inputPlaceholder: "Agregue acá su nuevo folio",
      inputValidator: (result: string) => {
        if (!result || result.trim().length <= 0) return 'Proporcione el nuevo folio.';
        if (isNaN(Number(result))) return 'El Folio debe de ser de tipo numerico.';
        return null;
      },
      inputValue: seleccionado[0].folio,
      inputAttributes: {
        autocapitalize: "on"
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showLoaderOnConfirm: true,
      preConfirm: async (folio: any) => {},
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.service.refoliar(seleccionado[0].id, parseInt(result.value)).subscribe(resp => {
          dialog("Folio modificado correctamente", 'success', 2500);
          this.load();
        }, error => {
          alertError("No se ha podido modificar el folio del documento.");
        });
      }
    });
  }

  importador:any = {
    errores: {},
  };
  public formImportXML: FormGroup;
  public listFileXML: (File | null)[] = new Array<File>();
  buildFormImportXml(){
    this.formImportXML = this.formBuilder.group({
      documentos: this.formBuilder.array([]),
    });
  }

  buildFormDocumentImportXml(file: any){
    return this.formBuilder.group({
      name: [file.name, [Validators.required]],
      status: [Status.pendiente],
      message: [null],
    });
  }

  openImportadorXMLS(){
    this.buildFormImportXml();
    this.modalRefImportadorXML = this.modalService.open(this.modalImportadorXmls, {size: 'lg', backdrop: "static", animation:true});
  }


  public procesarXMLS(){
    this.uploader.total = this.listFileXML.length;
    this.importador.errores = {};

    const procesaPorLotes = (index: number) => {
      var files = this.getFiftyFile(index);
      if(files.length <= 0){
        const documentos = getFormArray('documentos', this.formImportXML).value;
        for(var i in documentos){
          const errores = this.importador.errores[documentos[i].name] || [];
          documentos[i].status = Status.pendiente;
          if (errores.length <= 0){
            documentos[i].status = Status.ok;
            documentos[i].message = null;
          }else{
            documentos[i].status = Status.no;
            documentos[i].message = errores.join("\n");
          }
          getFormArray('documentos', this.formImportXML).at(Number(i)).setValue(documentos[i]);
        }
      }else{
        this.service.uploadXml(files).subscribe((path: string) => {
          var files_: any[] = [];
          for(var i in files){
            files_.push(files[i]?.name);
          }
          this.service.procesarXml(path, files_).subscribe((resp: any) => {
            this.importador.errores = {...resp, ...this.importador.errores};
            index++;
            procesaPorLotes(index);
          }, error => {
            index++;
            procesaPorLotes(index);
          });
        }, error => {
          index++;
          procesaPorLotes(index);
        });
      }
    };
    procesaPorLotes(0);
  }

  public uploader: any = {
    percen: 0, 
    step: 50, 
    total: 0, 
    totalprocesados: 0,
  };

  private getFiftyFile(index: number){
    const subindex = index + 1;
    const begin = index * this.uploader.step;
    if(begin >= this.uploader.total) return [];
    var files = [];
    var end = subindex * this.uploader.step;
    if(end >= this.uploader.total){
      end = this.uploader.total;
    }
    this.uploader.totalprocesados = end;
    this.uploader.percen = presicion(end * 100 / this.uploader.total);
    for(var i = begin; i < end; i++){
      files.push(this.listFileXML[i]);
    }
    return files;
  }

  public loadFilesXMLS(event: any) {
    this.listFileXML = [];
    if(event.target.files.length <= 0){
      return alertError("Asegurece de seleccionar alguna archivo .XML!");
    }
    const length = event.target.files.length;
    let i = 0;
    while (i < length) {
      this.listFileXML[i] = event.target.files.item(i);
      i++;
    }
    const formGroups = this.listFileXML.map((file: any) => {
      return this.buildFormDocumentImportXml(file);
    });
    this.formImportXML.setControl('documentos', this.formBuilder.array(formGroups));
  }

  clearAllXmlImportador(){
    alertConfirm("¿Realmente desea eliminar todos los registros?", (result: any) => {
      if (result.isConfirmed){
        clearFormArray(this.getFormArray("documentos", this.formImportXML));
        this.importador = {};
        this.listFileXML = [];
      }
    });
  }

  openImportadorXLSX(grid: jqxGridComponent){
    this.importador_xlsx.data = [];
    this.error_importacion = [];
    this.comparador = {};
    this.modalRefImportadorXLSX = this.modalService.open(this.modalImportadorXlsx, {backdrop: "static", animation:true, size: "xl"});

    this.modalRefImportadorXLSX.closed.subscribe(() => {
      this.importador_xlsx.facturas = [];
    });
  }

  array_to_json(data: any[]){
    this.importador_xlsx.data = [];
    var enca = JSON.parse(JSON.stringify(data.splice(0, 1)));
    enca = enca[0];
    for(var i = 0; i < data.length; i++){
      var row: any = {};
      for(var j = 0; j < enca.length; j++){
        row[ String(enca[j]).trim().toUpperCase() ] = (data[i][j] != null) ? String(data[i][j]).trim() : '';
      }
      this.importador_xlsx.data.push(row);
    }
  };

  public error_importacion: string[] = [];

  loadXLSXImportador(event: any, grid: jqxGridComponent){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const ab: ArrayBuffer = e.target.result;
      const wb: WorkBook = read(ab);
      sheet_to_json(wb, 'facturas', (error: any, result: any[]) => {
        if (error) return alertError(error);

        this.array_to_json(result);

        this.validarExcelImportacion((error: any, next: any) => {
          if(error && error.length > 0){
              this.error_importacion = error;
              this.modalRefErrorImportadorXLSX = this.modalService.open(this.modalErroresImportacion, {backdrop: "static", animation:true, size: "lg"});
          }else{
            this.getDataDB((error: any) => {
              if(error){
                this.error_importacion = error;
                this.modalRefErrorImportadorXLSX = this.modalService.open(this.modalErroresImportacion, {backdrop: "static", animation:true, size: "lg"});
              }else{
                this.construirEstructuraFacturas(grid, ()=>{

                });
              }
            });
          }
        });
      });
    };
    reader.onprogress = (event: ProgressEvent) => {
      if(event.lengthComputable){
        var progress: any = (event.loaded / event.total) * 100;
      }
    };
    reader.readAsArrayBuffer(target.files[0]);

  };

  validarExcelImportacion(next: Function){
    //Validamos que el primer registro sea tipo FAC.
    if(typeof this.importador_xlsx.data[0]['TIPO'] != "undefined"){
        if(this.importador_xlsx.data[0]['TIPO'] != "FAC"){
            return next(['Asegurece de que el primero registro sea TIPO=> FAC']);
        }
    }
    var obligatorios = JSON.parse(JSON.stringify(this.importador_xlsx.obligatorios));
    var estos_faltan = [], index_delete = [];
    for(var i = 0; i < obligatorios.length; i++){
        var b_esta = false;
        for(var att in this.importador_xlsx.data[0]){
            if(String(att).trim().toUpperCase() == String(obligatorios[i]).trim().toUpperCase()){
                b_esta = true;
                index_delete.push(i);
                break;
            }
        }
        if(!b_esta){
            estos_faltan.push(String(obligatorios[i]).trim().toUpperCase());
        }
    }

    if(estos_faltan.length > 0){
        var error = [];
        for(var i = 0; i < estos_faltan.length; i++){
            error.push('Falta el campo ' + estos_faltan[i]);
        }
        return next(error);
    }

    var all = JSON.parse(JSON.stringify(this.importador_xlsx.obligatorios));
    all = all.concat(JSON.parse(JSON.stringify(this.importador_xlsx.opcionales)));
    var sobran = [];
    for(var att in this.importador_xlsx.data[0]){
        if(all.indexOf(att) < 0){
            sobran.push(String(att).trim().toUpperCase());
        }
    }
    if(sobran.length > 0){
        var error = [];
        for(var i = 0; i < sobran.length; i++){
            error.push('Sobra el campo ' + sobran[i]);
        }
        return next(error);
    }
    var errores = [];
    var tt_error = 0;
    for(var i = 0; i < this.importador_xlsx.data.length; i++){
        var type = this.importador_xlsx.data[i]['TIPO'];
        for(var j = 0; j < all.length; j++){
            var key = String(all[j]).trim().toUpperCase();
            var value = String(this.importador_xlsx.data[i][key]).trim().toUpperCase();

            if(type == 'FAC'){
                switch (key) {
                    case "TIPO COMPROBANTE":
                      if(value.length <= 0){
                        errores.push(`En [${i + 2}][${key}] = ${value}, es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                      }
                    break;
                    case 'RFC EMISOR':
                      if(value.length <= 0){
                        errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                        tt_error++;
                      }
                    break;
                    case 'SUCURSAL':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'RFC RECEPTOR':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'USO CFDI':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'EXPORTACION':
                        if (value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }else{
                            if(["01", "02", "03"].indexOf(value) < 0){
                                errores.push(`En [${i + 2}][${key}] valor no permitido, solo se permite 01=No aplica, 02=Definitiva y 03=Temporal.`);
                                tt_error++;
                            }
                        }
                    break;
                    case 'DIVISA':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'TIPO CAMBIO':
                        if(value.length > 0){
                            var divisa = String(this.importador_xlsx.data[i]['DIVISA']).trim().toUpperCase();
                            if(divisa == 'MXN'){
                                if(Number(value) != 0 && Number(value) != 1){
                                    errores.push(`En [${i + 2}][${key}], cuando la divisa es ${divisa} NO debe de agregar ${key}. ⟹ {${value}}.`);
                                    tt_error++;
                                }
                            }else{
                                if(isNaN(Number(value)) || Number(value) <= 0){
                                    errores.push(`En [${i + 2}][${key}], cuando la divisa es ${divisa} debe de agregar ${key} de tipo numerico mayor a cero. ⟹ {${value}}.`);
                                    tt_error++;
                                }
                            }
                        }
                    break;
                    case 'FORMA DE PAGO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'METODO DE PAGO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }else if(value != "PPD" && value != "PUE"){
                            errores.push(`En [${i + 2}][${key}], solo se aceptan los PUE|PPD. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'CONDICIONES DE PAGO':
                    case 'SERIE':
                    case 'OBSERVACIONES':
                    break;

                    case 'IMPUESTOS LOCALES':
                        if(value.length > 0){
                            var locales = value.split("|");
                            for(var k = 0; k < locales.length; k++){
                                var impuesto = String(locales[k]).trim().toUpperCase().split("/");
                                if(impuesto.length != 2){
                                    errores.push(`En [${i + 2}][${key}], asegurece de poner los impuestos NOMBRE IMPUESTOS/TOTAL IMPUESTO, donde total impuesto es valor numerico. ⟹ {${value}}.`);
                                    tt_error++;
                                }else{
                                    if(String(impuesto[0]).length <= 0){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el nombre del impuestos NOMBRE IMPUESTO. ⟹ {${value}}.`);
                                        tt_error++;
                                    }
                                    if(String(impuesto[1]).trim().length <= 0){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el nombre del impuestos TOTAL IMPUESTO. ⟹ {${value}}.`);
                                        tt_error++;
                                    }
                                    if(isNaN(Number(String(impuesto[1]).trim())) || Number(String(impuesto[1]).trim() || 0) <= 0){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el TOTAL IMPUESTO de tipo numerico y mayor a cero. ⟹ {${impuesto[1]}}.`);
                                        tt_error++;
                                    }
                                }
                            }
                        }
                    break;
                    case 'CONCEPTO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'CANTIDAD':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                        if(isNaN(Number(value)) || Number(value) <= 0){
                            errores.push(`En [${i + 2}][${key}], el valor debe de ser de tipo numerico y mayor a cero. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'PRECIO UNITARIO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                        if(isNaN(Number(value)) || Number(value) <= 0){
                            errores.push(`En [${i + 2}][${key}], el valor debe de ser de tipo numerico y mayor a cero. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'DESCUENTO':
                        if(value.length > 0 && isNaN(Number(value))){
                            errores.push(`En [${i + 2}][${key}], el valor es de tipo numerico o en su defecto dejelo en blanco. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'PRODUCTO SERVICIO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'CLAVE UNIDAD':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>FAC. ⟹ {${value}}.`);
                            tt_error++;
                        }
                    break;
                    case 'IMPUESTOS FEDERALES':
                        if(value.length > 0){
                            var locales = value.split("|");
                            for(var k = 0; k < locales.length; k++){
                                var impuesto = String(locales[k]).trim().toUpperCase().split("/");
                                if(impuesto.length != 2){
                                    errores.push(`En [${i + 2}][${key}], asegurece de poner los impuestos NOMBRE IMPUESTOS/TIPO, donde TIPO es TRASLADO o RETENCION. ⟹ {${String(locales[k]).trim()}}`);
                                    tt_error++;
                                }else{
                                    if(String(impuesto[0]).trim(). length <= 0){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el nombre del impuestos NOMBRE IMPUESTO. ⟹ {${String(impuesto[0]).trim()}}`);
                                        tt_error++;
                                    }
                                    if(String(impuesto[1]).trim().toUpperCase() != 'TRASLADO' && String(impuesto[1]).trim().toUpperCase() != 'RETENCION'){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el tipo impuesto TRASLADO o RETENCION. ⟹ {${String(impuesto[1]).trim()}}`);
                                        tt_error++;
                                    }
                                }
                            }
                        }
                    break;
                }
            }else if(type == "CON"){
                switch (key) {
                    case 'RFC EMISOR':
                    case 'TIPO COMPROBANTE':
                    case 'SUCURSAL':
                    case 'RFC RECEPTOR':
                    case 'USO CFDI':
                    case 'EXPORTACION':
                    case 'DIVISA':
                    case 'TIPO CAMBIO':
                    case 'FORMA DE PAGO':
                    case 'METODO DE PAGO':
                    case 'CONDICIONES DE PAGO':
                    case 'SERIE':
                    case 'OBSERVACIONES':
                    case 'IMPUESTOS LOCALES':
                        if(String(value).trim().length > 0){
                            errores.push(`Cuando el registro es TIPO=> CONCEPTO en [${i + 2}][${key}] no debe de existir valor ${value}.`);
                            tt_error++;
                        }
                    break;
                    case 'CONCEPTO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>CON`);
                            tt_error++;
                        }
                    break;
                    case 'CANTIDAD':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>CON`);
                            tt_error++;
                        }
                        if(isNaN(Number(value)) || Number(value) <= 0){
                            errores.push(`En [${i + 2}][${key}], el valor debe de ser de tipo numerico y mayor a cero.`);
                            tt_error++;
                        }
                    break;
                    case 'PRECIO UNITARIO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>CON`);
                            tt_error++;
                        }
                        if(isNaN(Number(value)) || Number(value) <= 0){
                            errores.push(`En [${i + 2}][${key}], el valor debe de ser de tipo numerico y mayor a cero.`);
                            tt_error++;
                        }
                    break;
                    case 'DESCUENTO':
                        if(value.length > 0 && isNaN(Number(value))){
                            errores.push(`En [${i + 2}][${key}], el valor es de tipo numerico o en su defecto dejelo en blanco.`);
                            tt_error++;
                        }
                    break;
                    case 'PRODUCTO SERVICIO':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>CON`);
                            tt_error++;
                        }
                    break;
                    case 'CLAVE UNIDAD':
                        if(value.length <= 0){
                            errores.push(`En [${i + 2}][${key}] es obligatorio en los registros TIPO=>CON`);
                            tt_error++;
                        }
                    break;
                    case 'IMPUESTOS FEDERALES':
                        if(value.length > 0){
                            var federales = value.split("|");
                            for(var k = 0; k < federales.length; k++){
                                var impuesto = String(federales[k]).trim().toUpperCase().split("/");
                                if(impuesto.length != 2){
                                    errores.push(`En [${i + 2}][${key}], asegurece de poner los impuestos NOMBRE IMPUESTOS/TIPO, donde TIPO es TRASLADO o RETENCION.`);
                                    tt_error++;
                                }else{
                                    if(String(impuesto[0]).trim().length <= 0){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el nombre del impuestos NOMBRE IMPUESTO.`);
                                        tt_error++;
                                    }
                                    if(String(impuesto[1]).trim().toUpperCase() != 'TRASLADO' && String(impuesto[1]).trim().toUpperCase() != 'RETENCION'){
                                        errores.push(`En [${i + 2}][${key}], asegurece de poner el tipo impuesto TRASLADO o RETENCION.`);
                                        tt_error++;
                                    }
                                }
                            }
                        }
                    break;
                }
            }
        }
        if(tt_error >= 10){
            break;
        }
    }

    if(errores.length > 0){
        return next(errores, null);
    }
    return next(null, 'ok');
  }

  public comparador: any = {};
  public getDataDB(callback: Function){
    var filtros: any = {
      emisor:[], 
      sucursales: {}, 
      receptor:[], 
      divisas:[], 
      uso_cfdi:[], 
      forma_pago: [], 
      metodo_pago: [],
      federales: [], 
      locales: [], 
      producto_servicio: [], 
      clave_unidad: [],
    };
    for(var i = 0; i < this.importador_xlsx.data.length; i++){
      if(String(this.importador_xlsx.data[i]['TIPO']).trim().toUpperCase() == 'FAC'){
        if(filtros.emisor.indexOf(String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()) < 0){
          filtros.emisor.push(String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase());
        }
        
        if(typeof filtros.sucursales[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()] == "undefined"){
          filtros.sucursales[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()] = {};
        }
        var sucursal = String(this.importador_xlsx.data[i]['SUCURSAL']).trim().length > 0 ? String(this.importador_xlsx.data[i]['SUCURSAL']).trim().toUpperCase() : 'MATRIZ';
        if(typeof filtros.sucursales[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()][sucursal] == "undefined"){
          filtros.sucursales[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()][sucursal] = sucursal;
        }

        if(filtros.receptor.indexOf(String(this.importador_xlsx.data[i]['RFC RECEPTOR']).trim().toUpperCase()) < 0){
          filtros.receptor.push(String(this.importador_xlsx.data[i]['RFC RECEPTOR']).trim().toUpperCase());
        }

        if(filtros.divisas.indexOf(String(this.importador_xlsx.data[i]['DIVISA']).trim().toUpperCase()) < 0){
          filtros.divisas.push(String(this.importador_xlsx.data[i]['DIVISA']).trim().toUpperCase());
        }

        if(filtros.uso_cfdi.indexOf(String(this.importador_xlsx.data[i]['USO CFDI']).trim().toUpperCase()) < 0){
          filtros.uso_cfdi.push(String(this.importador_xlsx.data[i]['USO CFDI']).trim().toUpperCase());
        }

        if(filtros.forma_pago.indexOf(String(this.importador_xlsx.data[i]['FORMA DE PAGO']).trim().toUpperCase()) < 0){
          filtros.forma_pago.push(String(this.importador_xlsx.data[i]['FORMA DE PAGO']).trim().toUpperCase());
        }

        if(filtros.metodo_pago.indexOf(String(this.importador_xlsx.data[i]['METODO DE PAGO']).trim().toUpperCase()) < 0){
          filtros.metodo_pago.push(String(this.importador_xlsx.data[i]['METODO DE PAGO']).trim().toUpperCase());
        }

        if(typeof this.importador_xlsx.data[i]['IMPUESTOS LOCALES'] != "undefined" && String(this.importador_xlsx.data[i]['IMPUESTOS LOCALES']).length > 0){
          var imp_local = String(this.importador_xlsx.data[i]['IMPUESTOS LOCALES']).split("|");
          for(var j = 0; j < imp_local.length; j++){
            var local = String(imp_local[j]).split("/");
            if(filtros.locales.indexOf(local[0]) < 0){
              filtros.locales.push(local[0]);
            }
          }
        }
        if(filtros.producto_servicio.indexOf(String(this.importador_xlsx.data[i]['PRODUCTO SERVICIO']).trim().toUpperCase()) < 0){
          filtros.producto_servicio.push(String(this.importador_xlsx.data[i]['PRODUCTO SERVICIO']).trim().toUpperCase());
        }
        if(filtros.clave_unidad.indexOf(String(this.importador_xlsx.data[i]['CLAVE UNIDAD']).trim().toUpperCase()) < 0){
          filtros.clave_unidad.push(String(this.importador_xlsx.data[i]['CLAVE UNIDAD']).trim().toUpperCase());
        }
        if(typeof this.importador_xlsx.data[i]['IMPUESTOS FEDERALES'] != "undefined" && String(this.importador_xlsx.data[i]['IMPUESTOS FEDERALES']).length > 0){
          var imp_federal = String(this.importador_xlsx.data[i]['IMPUESTOS FEDERALES']).split("|");
          for(var j = 0; j < imp_federal.length; j++){
            var federal = String(imp_federal[j]).split("/");
            if(filtros.federales.indexOf(federal[0]) < 0){
              filtros.federales.push(federal[0]);
            }
          }
        }
      }else if(String(this.importador_xlsx.data[i]['TIPO']).trim().toUpperCase() == 'CON'){
        if(typeof this.importador_xlsx.data[i]['IMPUESTOS FEDERALES'] != "undefined" && String(this.importador_xlsx.data[i]['IMPUESTOS FEDERALES']).length > 0){
          var imp_federal = String(this.importador_xlsx.data[i]['IMPUESTOS FEDERALES']).split("|");
          for(var j = 0; j < imp_federal.length; j++){
            var federal = String(imp_federal[j]).split("/");
            if(filtros.federales.indexOf(federal[0]) < 0){
              filtros.federales.push(federal[0]);
            }
          }
        }

        if(filtros.producto_servicio.indexOf(String(this.importador_xlsx.data[i]['PRODUCTO SERVICIO']).trim().toUpperCase()) < 0){
          filtros.producto_servicio.push(String(this.importador_xlsx.data[i]['PRODUCTO SERVICIO']).trim().toUpperCase());
        }
        if(filtros.clave_unidad.indexOf(String(this.importador_xlsx.data[i]['CLAVE UNIDAD']).trim().toUpperCase()) < 0){
          filtros.clave_unidad.push(String(this.importador_xlsx.data[i]['CLAVE UNIDAD']).trim().toUpperCase());
        }
      }
    }

    var sucursales = [];
    for(var rfc in filtros.sucursales){
      for(var suc in filtros.sucursales[rfc]){
        sucursales.push({rfc: rfc, sucursal: suc});
      }
    }
    filtros.sucursales = sucursales;
    this.service.getDataImport(filtros).subscribe((respuesta: any) => {
      this.comparador = {
        emisores:{},
        sucursales: {},
        receptores: {},
        divisas: {},
        uso_cfdi: {},
        forma_pago: {},
        metodo_pago: {},
        federales: {},
        locales: {},
        producto_servicio: {},
        clave_unidad: {}
      };
      for(var i = 0; i < (respuesta.empresas || []).length; i++){
        this.comparador.emisores[String(respuesta.empresas[i].rfc).trim().toUpperCase()] = respuesta.empresas[i];
      }
      for(var i = 0; i < (respuesta.sucursales || []).length; i++){
        if(typeof this.comparador.sucursales[ String(respuesta.sucursales[i].rfc).trim().toUpperCase() ] == "undefined"){
          this.comparador.sucursales[ String(respuesta.sucursales[i].rfc).trim().toUpperCase() ] = {};
        }
        this.comparador.sucursales[String(respuesta.sucursales[i].rfc).trim().toUpperCase()][String(respuesta.sucursales[i].sucursal).trim().toUpperCase()] = respuesta.sucursales[i];
      }
      for(var i = 0; i < (respuesta.receptor || []).length; i++){
        this.comparador.receptores[String(respuesta.receptor[i].rfc).trim().toUpperCase()] = respuesta.receptor[i];
      }
      for(var i = 0; i < (respuesta.divisas || []).length; i++){
        this.comparador.divisas[String(respuesta.divisas[i].clave).trim().toUpperCase()] = respuesta.divisas[i];
      }
      for(var i = 0; i < (respuesta.uso_cfdi || []).length; i++){
        this.comparador.uso_cfdi[String(respuesta.uso_cfdi[i].clave).trim().toUpperCase()] = respuesta.uso_cfdi[i];
      }
      for(var i = 0; i < (respuesta.forma_pago || []).length; i++){
        this.comparador.forma_pago[String(respuesta.forma_pago[i].clave).trim().toUpperCase()] = respuesta.forma_pago[i];
      }
      for(var i = 0; i < (respuesta.metodo_pago || []).length; i++){
        this.comparador.metodo_pago[String(respuesta.metodo_pago[i].clave).trim().toUpperCase()] = respuesta.metodo_pago[i];
      }
      for(var i = 0; i < (respuesta.federales || []).length; i++){
        this.comparador.federales[String(respuesta.federales[i].nombre).trim().toUpperCase()] = respuesta.federales[i];
      }
      for(var i = 0; i < (respuesta.locales || []).length; i++){
        this.comparador.locales[String(respuesta.locales[i].nombre).trim().toUpperCase()] = respuesta.locales[i];
      }
      for(var i = 0; i < (respuesta.producto_servicio || []).length; i++){
        this.comparador.producto_servicio[String(respuesta.producto_servicio[i].clave).trim().toUpperCase()] = respuesta.producto_servicio[i];
      }
      for(var i = 0; i < (respuesta.clave_unidad || []).length; i++){
        this.comparador.clave_unidad[String(respuesta.clave_unidad[i].clave).trim().toUpperCase()] = respuesta.clave_unidad[i];
      }
      var all = JSON.parse(JSON.stringify(this.importador_xlsx.obligatorios));
      all = all.concat(JSON.parse(JSON.stringify(this.importador_xlsx.opcionales)));

      var errores = [];
      for(var i = 0; i < this.importador_xlsx.data.length; i++){
        var type = String(this.importador_xlsx.data[i]['TIPO']).trim().toUpperCase();
        for(var j = 0; j < all.length; j++){
          var key = String(all[j]).trim().toUpperCase();
          var value = String(this.importador_xlsx.data[i][key]).trim().toUpperCase();
          switch (key) {
            case "TIPO COMPROBANTE":
              if(type == "FAC"){
                if(["I", "E", "T"].indexOf(value) < 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, solo se aceptan los valores I|E|T.`);
                }
              }
            break;
            case "RFC EMISOR":
              if(type == 'FAC')
                if(typeof this.comparador.emisores[value] == "undefined" || Object.keys(this.comparador.emisores[value]).length <= 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
            break;
            case "SUCURSAL":
              if(type == 'FAC'){
                var rfc_emisor = String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase();
                this.comparador.sucursales[rfc_emisor] = this.comparador.sucursales[rfc_emisor] || {};
                if(typeof this.comparador.sucursales[rfc_emisor][value] == "undefined" || Object.keys(this.comparador.sucursales[rfc_emisor][value] || {}).length <= 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado relacionada al rfc emisor ${rfc_emisor}.`);
                }
              }
            break;
            case "RFC RECEPTOR":
              if(type == 'FAC'){
                if(typeof this.comparador.receptores[value] == "undefined" || Object.keys(this.comparador.receptores[value]).length <= 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
              }
            break;
            case "USO CFDI":
              if(type == 'FAC'){
                if(typeof this.comparador.uso_cfdi[value] == "undefined" || Object.keys(this.comparador.uso_cfdi[value]).length <= 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
              }
            break;
            case "DIVISA":
              if(type == 'FAC'){
                if(typeof this.comparador.divisas[value] == "undefined" || Object.keys(this.comparador.divisas[value]).length <= 0){
                  errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
              }
            break;
            case "TIPO CAMBIO":
              if(type == 'FAC'){
                var divisa = String(this.importador_xlsx.data[i]['DIVISA']).trim().toUpperCase();
                if(divisa != 'MXN'){
                  if(String(value).length <= 0 || isNaN(Number(value))){
                    errores.push(`[${i + 2}][${key}] = ${value}, el tipo de cambio tiene que ser numerico y mayor a cero.`);
                  }
                }
              }
            break;
            case "FORMA DE PAGO":
              if(type == 'FAC'){
                if(typeof this.comparador.forma_pago[value] == "undefined" || Object.keys(this.comparador.forma_pago[value]).length <= 0){
                  errores.push(`La clave [${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
              }
            break;
            case "METODO DE PAGO":
              if(type == 'FAC'){
                if(typeof this.comparador.metodo_pago[value] == "undefined" || Object.keys(this.comparador.metodo_pago[value]).length <= 0){
                  errores.push(`La clave [${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
                }
              }
            break;
            case "IMPUESTOS LOCALES":
              if(value.length > 0){
                var locales = value.split("|");
                for(var k = 0; k < locales.length; k++){
                  var local = String(locales[k]).split("/");
                  var impuesto = String(local[0]).trim().toUpperCase();
                  if(typeof this.comparador.locales[impuesto] == "undefined" || Object.keys(this.comparador.locales[impuesto]).length <= 0){
                    errores.push(`[${i + 2}][${key}], no se ha encontrado el impuesto local en la base de datos. ⟹ {${impuesto}}`);
                  }
                  if(isNaN(Number(local[1])) || Number(local[1]) <= 0){
                    errores.push(`[${i + 2}][${key}], el total del impuesto local ${local[0]} debe de ser de tipo numerico y mayor a cero.`);
                  }
                }
              }
            break;
            /**
             * Estas opciones aplica para todos los registros.
             */
            case "PRODUCTO SERVICIO":
              if(typeof this.comparador.producto_servicio[value] == "undefined" || Object.keys(this.comparador.producto_servicio[value]).length <= 0){
                errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
              }
            break;
            case "CLAVE UNIDAD":
              if(typeof this.comparador.clave_unidad[value] == "undefined" || Object.keys(this.comparador.clave_unidad[value]).length <= 0){
                errores.push(`[${i + 2}][${key}] = ${value}, no se ha encontrado en la base de datos.`);
              }
            break;
            case "IMPUESTOS FEDERALES":
              //IVA AL 16%/TRASLADO|
              if(value.length > 0){
                var federales = value.split("|");
                for(var k = 0; k < federales.length; k++){
                  // IVA AL 6%/RETENCION
                  var federal = String(federales[k]).split("/");
                  var impuesto = String(federal[0]).trim().toUpperCase();
                  var tipo = String(federal[1]).trim().toUpperCase();
                  if(typeof this.comparador.federales[impuesto] == "undefined" || Object.keys(this.comparador.federales[impuesto]).length <= 0 || tipo != String(this.comparador.federales[impuesto].tipo || "").trim().toUpperCase()){
                    errores.push(`En [${i + 2}][${key}], no se ha encontrado el impuesto federal en la base de datos. ⟹ {${impuesto}} de tipo {${tipo}}`);
                  }
                }
              }
            break;
          }
        }
        if(errores.length >= 20){
          break;
        }
      }
      if(errores.length > 0){
        return callback(errores);
      }
      return callback(null);
    });
  }

  construirEstructuraFacturas(grid: jqxGridComponent, callback: Function){
    this.importador_xlsx.facturas = [];
    var factura: any = {};
    for(var i = 0; i < this.importador_xlsx.data.length; i++){
      if(this.importador_xlsx.data[i]['TIPO'] == 'FAC'){
        if(Object.keys(factura).length > 0){
          this.importador_xlsx.facturas.push(JSON.parse(JSON.stringify(factura)));
        }
        factura = {};
        factura.id = null;
        factura.uuid = uuidv4();
        const emisor   = this.comparador.emisores[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()];
        const sucursal = this.comparador.sucursales[String(this.importador_xlsx.data[i]['RFC EMISOR']).trim().toUpperCase()][String(this.importador_xlsx.data[i]['SUCURSAL']).trim().toUpperCase()];
        const receptor = this.comparador.receptores[String(this.importador_xlsx.data[i]['RFC RECEPTOR']).trim().toUpperCase()];

        const divisa = this.comparador.divisas[String(this.importador_xlsx.data[i]['DIVISA']).trim()];
        const uso_cfdi = this.comparador.uso_cfdi[String(this.importador_xlsx.data[i]['USO CFDI']).trim()];
        const forma_pago = this.comparador.forma_pago[String(this.importador_xlsx.data[i]['FORMA DE PAGO']).trim()];
        const metodo_pago = this.comparador.metodo_pago[String(this.importador_xlsx.data[i]['METODO DE PAGO']).trim()];
        /**
         * Por ahora solo se pueden crear comprobantes de tipo I-Ingreso.
        **/

        factura.tipo_comprobante = 'I';
        factura.company_id = emisor.id;
        factura.company = emisor.razon_social;
        factura.company_rfc = emisor.rfc;
        factura.branch_company_id = sucursal.id;
        factura.branch_company = sucursal.sucursal;

        factura.client_id = receptor.id;
        factura.client_rfc = receptor.rfc;
        factura.client = receptor.razon_social;
        factura.condiciones_pago = String(this.importador_xlsx.data[i]["CONDICIONES DE PAGO"]).trim().length > 0 ? String(this.importador_xlsx.data[i]["CONDICIONES DE PAGO"]).trim() : undefined;
        factura.serie = String(this.importador_xlsx.data[i]['SERIE']).trim().length > 0 ? String(this.importador_xlsx.data[i]['SERIE']).trim() : sucursal.serie;

        factura.receptor = receptor.id;
        factura.receptor_razon_social = receptor.razon_social;
        factura.rfc_receptor = receptor.rfc;

        factura.divisa_id = divisa.id;
        factura.divisa = divisa.clave;
        factura.tipo_cambio = factura.divisa != 'MXN' ? Number(this.importador_xlsx.data[i]['TIPO CAMBIO']) : 1;
        factura.uso_cfdi_id = uso_cfdi.id;
        factura.uso_cfdi = uso_cfdi.clave;
        factura.forma_pago_id = forma_pago.id;
        factura.forma_pago = forma_pago.clave;
        factura.metodo_pago_id = metodo_pago.id;
        factura.metodo_pago = metodo_pago.clave;
        factura.exportacion = this.importador_xlsx.data[i]['EXPORTACION'] || '01';
        factura.observaciones = this.importador_xlsx.data[i]['OBSERVACIONES'];
        factura.implocal = [];

        var locales: any = String(this.importador_xlsx.data[i]['IMPUESTOS LOCALES']).trim().toUpperCase();
        var totalTrasladoLocal = 0, totalRetencionLocal = 0;
        if(locales.length > 0){
          locales = locales.split("|");
          for(var j = 0; j < locales.length; j++){
            var local = locales[j].split("/");
            var impdb = this.comparador.locales[String(local[0]).trim().toUpperCase()];
            var impuesto = {
              tasa: impdb.valor,
              tipo: String(impdb.tipo).trim().toLowerCase(),
              valor: impdb.valor,
              nombre: impdb.nombre,
              importe: Number(local[1]),
              impuesto: "LOCAL",
              tasa_cuota: impdb.tasa_cuota
            };
            if(impuesto.tipo == "traslado"){
              totalTrasladoLocal += Number(impuesto.importe);
            }else if(impuesto.tipo == "retencion"){
              totalRetencionLocal += Number(impuesto.importe);
            }
            factura.implocal.push(impuesto);
          }
        }

        factura.relacion04 = [];
        factura.detalles = [];

        factura.subtotal = 0;
        factura.retencion = 0;
        factura.traslados = 0;
        factura.retencion_local = presicion(totalRetencionLocal, this.dp);
        factura.traslados_local = presicion(totalTrasladoLocal, this.dp);
        factura.descuento = 0;
        factura.total = 0;

        factura.pagada = false;
        var concepto = this.agregaConceptoImportacion(this.importador_xlsx.data[i]);
        factura.detalles.push(concepto);
      }else{
        if(this.importador_xlsx.data[i]['TIPO'] == 'CON'){
          var concepto = this.agregaConceptoImportacion(this.importador_xlsx.data[i]);
          factura.detalles.push(concepto);
        }
      }
    }

    //Agregamos la ultima factura al array
    this.importador_xlsx.facturas.push(factura);
    //Calculamos los subtotal, descuento, trastalado, retenciones locales y federales por factura.
    for(var i = 0; i < this.importador_xlsx.facturas.length; i++){
      var sumSubtotal = 0, sumDecuento = 0, granTotal = 0, totalTraslado = 0, totalRetencion = 0;
      for(var j = 0; j < this.importador_xlsx.facturas[i].detalles.length; j++){
        for (let k = 0; k < this.importador_xlsx.facturas[i].detalles[j].impuestos.length; k++) {
          if(String(this.importador_xlsx.facturas[i].detalles[j].impuestos[k].tipo).trim().toLowerCase() == "retencion"){
            totalRetencion += Number(this.importador_xlsx.facturas[i].detalles[j].impuestos[k].total);
          }else if(String(this.importador_xlsx.facturas[i].detalles[j].impuestos[k].tipo).trim().toLowerCase() == "traslado"){
            totalTraslado += Number(this.importador_xlsx.facturas[i].detalles[j].impuestos[k].total);
          }
        }
        sumDecuento += this.importador_xlsx.facturas[i].detalles[j].descuento || 0;
        sumSubtotal += this.importador_xlsx.facturas[i].detalles[j].subtotal || 0;
      }
      var totalTrasladoLocales = 0, totalRetencionLocales = 0;
      for(var j = 0; j < (this.importador_xlsx.facturas[i].implocal || []).length; j++){
        if(String(this.importador_xlsx.facturas[i].implocal[j].tipo).trim().toLowerCase() == "retencion"){
          totalRetencionLocales += Number(this.importador_xlsx.facturas[i].implocal[j].importe);
        }
        if(String(this.importador_xlsx.facturas[i].implocal[j].tipo).trim().toLowerCase() == "traslado"){
          totalTrasladoLocales += Number(this.importador_xlsx.facturas[i].implocal[j].importe);
        }
      }
      sumSubtotal = presicion(sumSubtotal, this.ndecimal);
      totalTraslado = presicion(totalTraslado, this.ndecimal);
      totalRetencion = presicion(totalRetencion, this.ndecimal);
      sumDecuento = presicion(sumDecuento, this.ndecimal);
      totalTrasladoLocales = presicion(totalTrasladoLocales, this.ndecimal);
      totalRetencionLocales = presicion(totalRetencionLocales, this.ndecimal);
      granTotal = sumSubtotal + totalTraslado - (totalRetencion + sumDecuento) + totalTrasladoLocales - totalRetencionLocales;

      this.importador_xlsx.facturas[i].subtotal = sumSubtotal;
      this.importador_xlsx.facturas[i].descuento = sumDecuento;
      this.importador_xlsx.facturas[i].total_traslados = totalTraslado;
      this.importador_xlsx.facturas[i].total_retencion = totalRetencion;
      this.importador_xlsx.facturas[i].total_retencion_local = totalRetencionLocales;
      this.importador_xlsx.facturas[i].total_traslados_local = totalTrasladoLocales;
      this.importador_xlsx.facturas[i].total = presicion(granTotal, this.ndecimal);
    }
    this.sourceImport.localdata = this.importador_xlsx.facturas;
    grid.updatebounddata();
    return callback();
  }

  agregaConceptoImportacion(row: any){
    var unida = this.comparador.clave_unidad[String(row['CLAVE UNIDAD']).trim().toUpperCase()];
    var producto = this.comparador.producto_servicio[String(row['PRODUCTO SERVICIO']).trim().toUpperCase()];
    const concepto: any = {};
    concepto.cantidad = Number(String(row['CANTIDAD']).trim());
    concepto.unidad_medida = unida.clave;
    concepto.unidad_medida_id = unida.id;
    concepto.producto_servicio = producto.clave;
    concepto.producto_servicio_id = producto.id;
    concepto.precio_unitario = Number(row['PRECIO UNITARIO']);
    concepto.descuento = Number(row['DESCUENTO']);
    concepto.subtotal = presicion(concepto.precio_unitario * concepto.cantidad, this.dp);
    concepto.concepto = String(row['CONCEPTO']).trim();
    concepto.impuestos = [];
    concepto.total = 0;

    var base = concepto.subtotal - concepto.descuento;
    base = presicion(base, this.dp);

    var federales: any = String(row['IMPUESTOS FEDERALES']).trim().toUpperCase();
    var tt = 0;
    if(federales.length > 0){
      federales = federales.split("|");
      for(var i = 0; i < federales.length; i++){
        var federal = federales[i].split("/");
        var impdb = this.comparador.federales[String(federal[0]).trim().toUpperCase()];
        var importe = presicion((base * Number(impdb.valor)), this.dp); 
        var impuesto = {
          tax_id: impdb.id,
          nombre: impdb.nombre,
          impuesto: impdb.impuesto,
          base: Number(base),
          tipo: String(impdb.tipo).trim().toLowerCase(),
          total: Number(importe),
          valor: impdb.valor,
          tasa_cuota: impdb.tasa_cuota,
        };
        if(impuesto.tipo == "traslado"){
          tt += Number(impuesto.total);
        }else if(impuesto.tipo == "retencion"){
          tt -= Number(impuesto.total);
        }
        concepto.impuestos.push(impuesto);
      }
      concepto.objeto_impuesto = ObjetoImpuesto.no_objeto_impuesto;
      if(concepto.impuestos.length > 0){
        concepto.objeto_impuesto = ObjetoImpuesto.si_objeto_impuesto;
      }
    }
    concepto.descuento = presicion(concepto.descuento, this.dp);
    concepto.subtotal = presicion(concepto.subtotal);
    tt = presicion(tt, this.dp);
    concepto.total = concepto.subtotal + tt - concepto.descuento;
    concepto.total = presicion(concepto.total, this.dp);
    return concepto;
  } // end method

  showInvoice(event: Event, grid: jqxGridComponent){
    const seleccionado = getRowsSelected(grid);
    if (seleccionado.length <= 0) return;
    for(var i in this.importador_xlsx.facturas){
      if(seleccionado[0].uuid == this.importador_xlsx.facturas[i].uuid){
        this.factura = this.importador_xlsx.facturas[i];
        break;
      }
    }
    this.modalRefViewImportadorXLSX = this.modalService.open(this.modalViewDocImport, {size: 'xl', backdrop: "static", animation:true});
    this.modalRefViewImportadorXLSX.closed.subscribe((result: any) => {
      this.factura = {};
    });
  }

  public guardaFacturaMultiple(){
    var errores: any[] = [];
    const self = this;
    function insertar(index:number) {
      if(index >= self.importador_xlsx.facturas.length || errores.length >= 20){
        if(errores.length > 0){
          self.error_importacion = errores;
          self.modalRefErrorImportadorXLSX = self.modalService.open(self.modalErroresImportacion, {backdrop: "static", animation:true, size: "lg"});
        }else{
          dialog("Facturas agregadas correctamente.", 'success', 2500);
          self.load();
          self.modalRefImportadorXLSX.close();
        }
      }else{
        self.service.create(self.importador_xlsx.facturas[index]).subscribe((data: any) => {
          index++;
          insertar(index);
        }, (error: any) => {
          index++;
          insertar(index);
        });
      }
    };
    insertar(0);
  }

  private buildFormEmail() {
    this.formEmail = this.formBuilder.group({
      plantilla_id: [null, [Validators.required]],
      deparment: [null, [Validators.required]],
      para: [null, [Validators.required]],
      cco: [null],
      subject: [null, [Validators.required]],
      message: [null],
    });
  }

  public generador: any = {};
  public email: any = {};
  openSendEmail(){
    const seleccionados = getRowsSelected(this.jqxGridDocumentos);

    if (seleccionados.length <= 0)  return alertError("Seleccione un documento");
    if (seleccionados.length > 10) return alertError("Solo puede seleccionar lotes de 10 documentos.");

    const subtype = seleccionados[0].tipo_comprobante;
    const emisor = seleccionados[0].company_id;
    const receptor = seleccionados[0].client_id;
    this.generador = {
      correo: false,
      idsFactura: [],
    };
    for(var i in seleccionados){
      if (seleccionados[i].status_cfdi == StatusCfdi.Pendiente) return alertError("Recuerde seleccionar facturas que han sido selladas anteriormente.");
      if (subtype != seleccionados[i].tipo_comprobante) return alertError("Seleccione registros de un mismo tipo.");
      if(emisor != seleccionados[i].company_id) return alertError("Seleccione registros de un solo emisor.");
      if(receptor != seleccionados[i].client_id) return alertError("Seleccione registros de un solo receptor.");
      this.generador.idsFactura.push(seleccionados[i].id);
    }

    this.service.getTemplates(1, subtype, 1, this.generador.idsFactura.join(","), "cfdi").subscribe((result: any) => {
      this.buildFormEmail();
      const company = result.data[0].emisor;

      const info: any = {
        correo: result.data[0].correo,
        contacto: result.data[0].contacto,
        facturas: result.data || [],
        
      };

      this.htmlEmail = `
      <p>
        Estimado <strong>cliente</strong>, reciba un coordial saludo y ${result.data.length > 1 ? ' los siguientes comprobantes de las operaciones' : ' el siguiente comprobante de su ultima operación'} con nosotros
      </p>
      <hr>
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Tipo</th>
            <th>Total</th>
            <th>Fecha emisión</th>
            <th>Folio fiscal</th>
          </tr>
        </thead>
        <tbody>`;
        
        for(var i in result.data){
          this.htmlEmail += `
            <tr>
              <td>${result.data[i].folio}</td>
              <td>${result.data[i].tipo_comprobante}</td>
              <td>${result.data[i].total}</td>
              <td>${result.data[i].fecha_emision}</td>
              <td>${result.data[i].folio_fiscal}</td>
            </tr>
          `;
        }

        this.htmlEmail += `
        </tbody>
      </table>
      
      <br><br>
      Saludos cordiales.
      
      <br><br><br>
      Att: <strong>${company}</strong>`;
      this.list_templates_generate = result.templates || [];
      if(this.list_templates_generate.length > 0){
        this.formEmail.controls["plantilla_id"].setValue(this.list_templates_generate[0].id);
      }
      this.list_department_serves_company = result.servers || [];
      if(this.list_department_serves_company.length > 0){
        this.formEmail.controls["deparment"].setValue(this.list_department_serves_company[0].id);
      }
      this.list_users_contac = [{email: info.correo}];
      this.formEmail.controls["para"].setValue(info.correo);
      this.formEmail.controls["subject"].setValue(`${info.facturas[0].emisor} le ha enviado ${info.facturas.length > 1 ? info.facturas.length : 'un'} comprobante fiscal digital.`)
      this.modalRefViewEmail = this.modalService.open(this.modalEmail, {size: 'xl', backdrop: "static", animation:true});
      this.modalRefViewEmail.closed.subscribe((result: any) => {
        this.generador = {};
        this.email = {};
      });
    });
  }

  public sendEmail(event: Event): void{
    const form = this.formEmail.getRawValue()
    form.message = this.htmlEmail;
    form.ids = this.generador.idsFactura;
    this.service.sendEmail(form).subscribe((data: any) => {
      this.modalRefViewEmail.close();
      dialog("Correo enviado correctamente.", 'success', 2500);
      this.load();
    }, (error) => {
      alertError(error.error.detail || "No se ha podido enviar el correo, intente mas tarde.");
    });
  }

  addCustomUser = (term: any) => ({email: term});

  public searching = false;
  public searchFailed = false;
  searchProduct: OperatorFunction<string, readonly IProductCotizacion[]> = (text$: Observable<string>) => text$.pipe(
      filter(res => {
        return res !== null && res.length >= 3
      }),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.service.findProductAddInvoice(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false)),
    );
  
    resultFormatter(value: any) {
      return value.nombre;
    }
  
    inputFormatter(value: any){
      if (value.nombre)
        return value.nombre;
      return value;
    }
  
    selectedProduct(product: any, index: number){
      console.log(JSON.parse(JSON.stringify(product)));
      let current = getFormArray('detalles', this.form).at(index).value;
      current.producto_id = product.id;
      current.concepto = product.nombre;
      current.precio_unitario = ((product.precios || []).length > 0) ? product.precios[0].base : 0;
      current.cantidad = current.cantidad || 1;
      current.total = current.precio_unitario * current.cantidad;

      current.objeto_impuesto = (product.impuestos || []).length > 0 ? ObjetoImpuesto.si_objeto_impuesto : ObjetoImpuesto.no_objeto_impuesto;
      current.producto_servicio_id = product.producto_servicio_id;
      current.unidad_medida_id = product.unidad_medida_id;

      this.formDetail = this.buildFormDetalle();
      this.formDetail.patchValue(current);

      const formGroupTax = (product.impuestos || []).map((tax: any) => {
        const formTax = this.buildFormImpuesto();
        formTax.patchValue(tax);
          return formTax;
      });
      this.formDetail.setControl("impuestos", this.formBuilder.array(formGroupTax));
      this.getFormArray('detalles', this.form).removeAt(index);
      this.getFormArray('detalles', this.form).insert(index, this.formDetail);
      this.recalculaDocumento();
    }
}// End class