import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SweetAlertIcon } from "sweetalert2";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { IProductCotizacion } from 'src/app/apps/models/product.model';
import { CotizacionesService } from 'src/app/apps/services/cotizaciones.service';
import { GeneralService } from 'src/app/apps/services/general.service';

import {
  alertConfirm, alertError, alertOk, getFormControl, getRowsSelected, 
  getTasaCuota, getTrasladoRetencion, getTypeTax, presicion, getTypeDocument,
  getStatusCfdi, getDateType, getExportacion, getFormArray, hasKeyInForm, clearFormArray, alertWarning,
  dialog
} from 'src/app/utils/utils';
import { ISession } from 'src/app/apps/models/user';
import { InvoicesService } from 'src/app/apps/services/invoices.service';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.css']
})
export class CotizacionesComponent implements OnInit{
  @ViewChild('jqxGridCotizaciones', { static: false }) jqxGridCotizaciones: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  @ViewChild("modalView", {static: false}) modalView: TemplateRef<any>;
  @ViewChild("modalTemplates", {static: false}) modalTemplates: TemplateRef<any>;
  
  public seleccionados: number = 0;
  public form: FormGroup;
  public formView: FormGroup;
  public formTemplate: FormGroup;
  private formEntry: FormGroup;
  public getFormControl: Function = getFormControl;
  public getFormArray: Function = getFormArray;
  public hasKeyInForm: Function = hasKeyInForm;
  public searching = false;
  public searchFailed = false;
  public title: string = "";
  public currentCotizacion: any = {};
  
  public list_templates_generate: any[] = [];
  public list_root_emisor: any[] = [];
  public list_root_receptor: any[] = [];
  public list_root_sucursal: any[] = [];
  public list_root_tipo_comprobante: any[] = [];
  public list_root_status_cfdi: any[] = [];
  public list_root_type_date: any[] = [];

  public list_ce_divisas: any[] = [];
  public list_ce_forma_pago: any[] = [];
  public list_ce_precios: any[] = [];

  public list_ce_companys: any[] = [];
  public list_ce_branchs: any[] = [];
  public list_ce_customers: any[] = [];
  public hay_cotizaciones: boolean = false;
  public filter: any = {is_active: true};
  private modalRefCE: any = null;
  private modalRefView: any = null;
  private modalRefTemplates: any = null;
  public total_cotizacion: number = 0;
  private dp: number = 2;
  private session: ISession = {};
  
  public columns: any[] = [
    {text: '', datafield: 'Ver', columntype: 'button', width: 30, pinned: true,
      cellsrenderer: (): string => { return 'Ver'; },
      buttonclick: (row: number): void => {
        let dataRecord = this.jqxGridCotizaciones.getrowdata(row);
        this.openView(dataRecord.id);
      }
    },
    {text: '', datafield: 'Edit', columntype: 'button', width: 30, pinned: true,
      cellsrenderer: (): string => { return 'Edit'; },
      buttonclick: (row: number): void => {
        let dataRecord = this.jqxGridCotizaciones.getrowdata(row);
        this.openEdit(dataRecord.id);
      }
    },
    // {text: 'Id', datafield: 'id', width: 90, pinned: true },
    {text: 'Folio', datafield: 'folio', width: 80, pinned: true},
    {text: 'Emisor', datafield: 'empresa', width: 300 },
    {text: 'Sucursal', datafield: 'sucursal', width: 160 },
    {text: 'Receptor', datafield: 'cliente', width: 260 },
    {text: 'Divisa', datafield: 'divisa', width: 80 },
    {text: 'Fecha', datafield: 'fecha_creacion', width: 140, cellsformat: 'D'},
    {text: 'F. Vencimiento', datafield: 'vencimiento', width: 140, cellsformat: 'D'},
    {text: '(+) Subtotal', datafield: 'subtotal', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(+) T. federal', datafield: 'traslados', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-) R. federal', datafield: 'retenciones', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-) Descuento', datafield: 'descuento', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(=) Total', datafield: 'total', width: 150, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: 'Fecha creacion', datafield: 'created_at', width: 170, cellsformat: 'D'},
  ];
  
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'company_id', type: 'int' },
      { name: 'client_id', type: 'int' },
      { name: 'folio', type: 'string' },
      { name: 'empresa', type: 'string' },
      { name: 'cliente', type: 'string' },
      { name: 'sucursal', type: 'string' },
      { name: 'divisa', type: 'string' },
      { name: 'fecha_creacion', type: 'string' },
      { name: 'vencimiento', type: 'string' },
      { name: 'subtotal', type: 'float' },
      { name: 'descuento', type: 'float' },
      { name: 'traslados', type: 'float' },
      { name: 'retenciones', type: 'float' },
      { name: 'total', type: 'float' },
      { name: 'created_at', type: 'string' },
    ]
    

  };
  dataAdapter: any = new jqx.dataAdapter(this.source);

  constructor(
    private service: CotizacionesService,
    private serviceInvoice: InvoicesService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private generalService: GeneralService,
    private router: Router
  ){}

  ngOnInit(): void {
    const s = localStorage.getItem("session");
    try{
      this.session = JSON.parse(s!);

      if(this.session.is_superuser){
        this.source.datafields.push({ name: 'staff', type: 'string' });
        this.columns.push({text: 'Staff', datafield: 'staff', width: 200, pinned: true });
      }
    }catch(e){}


    this.service.loadCombosRoot().subscribe(data => {
      this.list_root_emisor = data.empresas;
      this.list_root_receptor = data.clientes;
    });
    this.load();
  }

  selectedCompanyCE(event: any){
    this.form.controls["branch_company_id"].setValue(null);
    this.list_ce_branchs = [];
    if (typeof event !== "undefined"){
      this.list_ce_branchs = event.sucursales || [];
      for(var i in this.list_ce_branchs){
        if(String(this.list_ce_branchs[i].nombre).trim().toUpperCase() == "MATRIZ"){
          this.form.controls["branch_company_id"].setValue(this.list_ce_branchs[i].id);
          break;
        }
      }
    }
  }

  selectedCustomerCE(event: any){
    
  }
  
  getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter)
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0)
        delete filter[att];
    return filter;
  }

  load(){
    this.service.gets(this.getFilter()).subscribe(data => {
      this.source.localdata = data;
      this.jqxGridCotizaciones.updatebounddata();
    });
  }

  buildForm(){
    this.form = this.formBuilder.group({
      id: [null],
      company_id: [null, [Validators.required]],
      branch_company_id: [null, [Validators.required]],
      client_id: [null, [Validators.required]],
      divisa_id: [null, [Validators.required]],
      subtotal: [0],
      retencion: [0],
      traslados: [0],
      descuento: [0],
      total: [0],
      observaciones: [null],
      entradas: this.formBuilder.array([]),
      precio_id: [null, [Validators.required]],
      fecha_creacion: [null, [Validators.required]],
      vencimiento: [null],
      is_active: [true],
    });
  }

  bildFormEntrada(): FormGroup{
    return this.formBuilder.group({
      producto_id: [null, [Validators.required]],
      concepto: [null, [Validators.required]],
      precio_unitario: [0, [Validators.required]],
      cantidad: [1, [Validators.required]],
      descuento: [0],
      subtotal: [0],
      total: [0],
      impuestos: this.formBuilder.array([]),
      notas: [null],
    });
  }

  buildFormImpuesto(){
    return this.formBuilder.group({
      tax_id: [null],
      nombre: [''],
      impuesto: [null],
      tasa_cuota: [null],
      valor: [0],
      tipo: [null],
      base: [0],
      total: [0],
    });
  }

  openCreate(){
    this.buildForm();
    this.loadCombosCE(() =>{
      this.title = `Nueva cotización`;
      for(var i in this.list_ce_precios){
        if(this.list_ce_precios[i].precio_base){
          this.form.controls["precio_id"].setValue(this.list_ce_precios[i].id);
          break;
        }
      }

      if(this.list_ce_companys.length == 1){
        this.form.controls["company_id"].setValue(this.list_ce_companys[0].id);
        this.list_ce_branchs = this.list_ce_companys[0].sucursales || [];
        for(var i in this.list_ce_branchs){
          if(String(this.list_ce_branchs[i].nombre).trim().toUpperCase() == "MATRIZ"){
            this.form.controls["branch_company_id"].setValue(this.list_ce_branchs[i].id);
            break;
          }
        }
      }

      for(var i in this.list_ce_divisas){
        if(this.list_ce_divisas[i].clave === "MXN"){
          this.form.controls["divisa_id"].setValue(this.list_ce_divisas[i].id);
          break;
        }
      }
      this.form.controls["fecha_creacion"].setValue((new Date()).toLocaleString("sv-SE").split(" ").join("T"));
      this.nuevaLinea();
      this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: "static", animation:true, size: "xl"});
    });
  }

  nuevaLinea(){
    this.getFormArray('entradas', this.form).push(this.bildFormEntrada());
  }
  
  loadCombosCE(callback: Function): void{
    this.service.loadCombosCE().subscribe(data => {
      this.list_ce_companys = data.empresas;
      this.list_ce_customers = data.clientes;
      this.list_ce_divisas = data.divisas;
      this.list_ce_forma_pago = data.formas_pago;
      this.list_ce_precios = data.precios;
      return callback();
    });
  }

  openEdit(id: any = null){
    console.log("Id cotizacion seleccionada: "+id);
    
    if (id == null){
      const seleccionado = getRowsSelected(this.jqxGridCotizaciones);
      if (seleccionado.length <= 0){
        return alertError("No se ha seleccionado el registro a editar.");
      }
      id = seleccionado[0].id;
    }
    try{
      this.modalRefView.close();
    }catch(err){}

    this.buildForm();
    this.loadCombosCE(() => {
      this.service.get(id).subscribe((cotizacion: any) => {
        this.title = `Cotización ${cotizacion.folio}`;
        for(var i in this.list_ce_companys){
          if (this.list_ce_companys[i].id == cotizacion.company_id){
            this.list_ce_branchs = this.list_ce_companys[i].sucursales;
            break;
          }
        }
        const entradas = JSON.parse(JSON.stringify(cotizacion.entradas || []));
        if (entradas.length > 0){
          const formGruops = entradas.map((entrada: any)=> {
            const form = this.bildFormEntrada();
            const impuestos = JSON.parse(JSON.stringify(entrada.impuestos || []));
            delete entrada.impuestos;
            if(impuestos.length > 0){
              const formGroupArray = impuestos.map((impuesto: any) => {
                const form = this.buildFormImpuesto();
                form.patchValue(impuesto);
                return form;
              });
              form.setControl('impuestos', this.formBuilder.array(formGroupArray));
            }
            form.patchValue(entrada);
            return form;
          });
          this.form.setControl('entradas', this.formBuilder.array(formGruops));
        }
        this.form.patchValue(cotizacion);
        this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: "static", animation:true, size: "xl"});
      });
    });
  }
  
  openView(id: any = null){
    if(id == null || typeof id == "undefined" || id <= 0){
      const seleccionado = getRowsSelected(this.jqxGridCotizaciones);
      id = seleccionado[0].id;
    }

    if (Number(id) <= 0) return alertError("Seleccione un registro antes de continuar");

    this.service.get_view_by_id(id).subscribe((cotizacion: any) => {
      this.currentCotizacion = cotizacion;
      this.title = `${cotizacion.folio || ""} / ${cotizacion.empresa}`;
      this.modalRefView = this.modalService.open(this.modalView, {backdrop: "static", animation:true, size: "xl"});
    });
  }
  
  openDelete(){

  }

  selectedCompanyRoot(event: any){
    this.filter.branch_id = undefined;
    this.list_root_sucursal = event.sucursales || [];
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridCotizaciones);
    this.seleccionados = seleccionado.length;
  }
  
  save(event: Event): void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    
    this.service.save(this.form.value).subscribe((data: any) => {
      if(typeof data.id == "undefined" || data.id == null){
        dialog("Cotización creada correctamente", "success");
      }else{
        dialog("Cotización modificada correctamente", "success");
      }

      this.modalRefCE.close();
    }, (error) => {
      return alertError(error);
    });
  }

  changeDesglose(){
    this.recalculaDocumento();
  }

  recalculaDocumento(){}

  deleteDetail(index: number){
    alertConfirm("¿Realmente desea eliminar el registro seleccinado?", (result: any) =>{
      if (result.isConfirmed){
        this.getFormArray('entradas', this.form).removeAt(index);
        const entradas = this.getFormArray('entradas', this.form).controls;
        if(entradas.length <= 0){
          this.getFormArray('entradas', this.form).push(this.bildFormEntrada());
        }
        this.recalculaCotizacion();
      }
    });
  }

  searchProduct: OperatorFunction<string, readonly IProductCotizacion[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 3
    }),
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => (this.searching = true)),
    switchMap((term) =>
      this.service.findProductCotizacion(term).pipe(
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
    let current = getFormArray('entradas', this.form).at(index).value;
    
    // Asignamos los datos del producto al registro seleccionado
    current.producto_id = product.id;
    current.concepto = product.nombre;
    // Buscamos el precio que le corresponde dependiendo al precio seleccionado por el usuario o asignado por default.
    var precio_id_current = this.form.controls["precio_id"].value;
    for(var i in product.precios){
      if(product.precios[i].id == precio_id_current){ 
        current.precio_unitario = product.precios[i].base;
        break;
      }
    }
    current.total = current.precio_unitario * current.cantidad;
    this.formEntry = this.bildFormEntrada();
    this.formEntry.patchValue(current);

    const formGroupTax = (product.impuestos || []).map((tax: any) => {
      const formTax = this.buildFormImpuesto();
      formTax.patchValue(tax);
        return formTax;
    });
    this.formEntry.setControl("impuestos", this.formBuilder.array(formGroupTax));
    this.getFormArray('entradas', this.form).removeAt(index);
    this.getFormArray('entradas', this.form).insert(index, this.formEntry);

    this.recalculaCotizacion();
  }

  recalculaCotizacion(){
    const entradas = getFormArray('entradas', this.form).controls;
    for(var i in entradas){
      this.recalculaEntrada(parseInt(i));
    }
    var sumSubtotal = 0, sumDecuento = 0, granTotal = 0, totalTraslado = 0, totalRetencion = 0;
    const entradas2 = getFormArray('entradas', this.form).controls;
    
    for (var i in entradas2){
      var entrada = entradas2[i].value;
      const impuestos = entrada.impuestos || [];
      for(var j in impuestos){
        if(impuestos[j].total !== null){
          if (String(impuestos[j].tipo).trim().toLowerCase() == "retencion"){
            totalRetencion += Number(impuestos[j].total || 0);
          }else if(String(impuestos[j].tipo).trim().toLowerCase() == "traslado"){
            totalTraslado += Number(impuestos[j].total || 0);
          }
        }
      }
      sumDecuento += entrada.descuento || 0;
      sumSubtotal += entrada.subtotal || 0;
    }

    sumSubtotal = presicion(sumSubtotal, this.dp);
    totalTraslado = presicion(totalTraslado, this.dp);
    totalRetencion = presicion(totalRetencion, this.dp);
    sumDecuento = presicion(sumDecuento, this.dp);

    granTotal = sumSubtotal + totalTraslado - (totalRetencion + sumDecuento);
    granTotal = presicion(granTotal);
    this.form.controls["subtotal"].setValue(sumSubtotal);
    this.form.controls["retencion"].setValue(totalRetencion);
    this.form.controls["traslados"].setValue(totalTraslado);
    this.form.controls["descuento"].setValue(sumDecuento);
    this.form.controls["total"].setValue(granTotal);
  }

  changeEntry(index: number){
    this.recalculaEntrada(index);
    this.recalculaCotizacion();
  }


  recalculaEntrada(index: number = -1) {
    if (index < 0) return;
    const form = this.getFormArray('entradas', this.form).at(index);
    const entrada = this.getFormArray('entradas',this.form).at(index).value;
    const impuestos = entrada.impuestos || [];
    const precio = entrada.precio_unitario;
    const descuento = entrada.descuento;
    const cantidad = entrada.cantidad;

    entrada.subtotal = presicion(precio * cantidad, this.dp);
    var base = presicion(entrada.subtotal - descuento);
    var totalTraslado = 0, totalRetencion = 0;
    for(var j in impuestos){
      impuestos[j].base = base;
      var total = null;
      if (impuestos[j].tasa_cuota !== "Exento"){
        total = presicion(base * impuestos[j].valor);
      }
      impuestos[j].total = total;
      if(total !== null){
        if (String(impuestos[j].tipo).trim().toLowerCase() == "retencion"){
          totalRetencion += Number(impuestos[j].total || 0);
        }else if(String(impuestos[j].tipo).trim().toLowerCase() == "traslado"){
          totalTraslado += Number(impuestos[j].total || 0);
        }
      }
    }
    entrada.total = Number(entrada.subtotal) + totalTraslado - (totalRetencion + entrada.descuento);
    entrada.total = presicion(entrada.total, this.dp);
    form.setValue(entrada);
  }

  private recordsCotizaciones: any[] = [];
  openTemplates(){
    const seleccionados = getRowsSelected(this.jqxGridCotizaciones);
    if(seleccionados.length <= 0){
      return alertError("No ha seleccionado algun registro aun");
    }
    var primero = seleccionados[0];
    for(var i in seleccionados){
      if (primero.company_id != seleccionados[i].company_id){
        return alertError("Seleccione comprobamtes del mismo tipo");
      }
      if (primero.client_id != seleccionados[i].client_id){
        return alertError("Seleccione comprobamtes del mismo tipo");
      }
      this.recordsCotizaciones.push(seleccionados[i].id);
    }

    this.serviceInvoice.getTemplates(4, "CT").subscribe((data: any) => {
      if(this.list_templates_generate.length > 1){
        this.list_templates_generate = data.templates || [];
        this.formTemplate = this.formBuilder.group({
          template: [0, [Validators.required]]
        });
        this.formTemplate.controls["template"].setValue(data.templates[0].id);
        this.modalRefTemplates = this.modalService.open(this.modalTemplates, {backdrop: "static", animation:true});
      }else{
        this.generatePdf(this.currentCotizacion.id, data.templates[0].id);
      }
    }, error => {
      
    });
  }

  generatePdf(id: any = null, template: any = null){
    let ids = [];
    let template_id: number = 0;
    if(id != null && template != null){
      ids.push(id);
      template_id = template;
    }else{
      if (this.formTemplate.invalid){
        this.formTemplate.markAllAsTouched();
      }
      for(var i in this.recordsCotizaciones){
        ids.push(this.recordsCotizaciones[i].id);
      }
      this.modalRefTemplates.close();
      template_id = this.formTemplate.controls["template"].getRawValue();
    }
    this.service.generatePDF(ids, template_id).subscribe((file: any) => {
      this.serviceInvoice.donwload(file);
    }, error => {
      alertError(error.error.detail|| "Error al generar su petición.");
    });
  }
}
