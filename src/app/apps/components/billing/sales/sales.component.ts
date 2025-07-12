import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { IProductCotizacion } from 'src/app/apps/models/product.model';
import { ISession } from 'src/app/apps/models/user';
import { SalesService } from 'src/app/apps/services/sales.service';
import { alertConfirm, alertError, dialog, getFormArray, getFormControl, getRowsSelected, hasKeyInForm, presicion } from 'src/app/utils/utils';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit{
  @ViewChild('jqxGridVentas', { static: false }) jqxGridVentas: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  @ViewChild("modalView", {static: false}) modalView: TemplateRef<any>; 
  
  public getFormControl: Function = getFormControl;
  public getFormArray: Function = getFormArray;
  public hasKeyInForm: Function = hasKeyInForm;
  public searching = false;
  public searchFailed = false;
  public form: FormGroup;
  private formDetail: FormGroup;
  public filter: any = {is_active: true};
  public title: string = "";
  public list_root_emisor: any[] = [];
  public list_root_receptor: any[] = [];
  public list_root_sucursal: any[] = [];
  public currentVenta: any = {};
  private modalRefView: any = null;
  private modalRefCE: any = null;
  public list_ce_companys: any[] = [];
  public list_ce_branchs: any[] = [];
  public list_ce_customers: any[] = [];
  public list_ce_divisas: any[] = [];
  
  private dp: number = 2;
  private session: ISession = {};
  public columns: any[] = [
    /*{text: '', datafield: 'Ver', columntype: 'button', width: 30, pinned: true,
      cellsrenderer: (): string => { return 'Ver'; },
      buttonclick: (row: number): void => {
        let dataRecord = this.jqxGridVentas.getrowdata(row);
        this.openView(dataRecord.id);
      }
    },
    {text: '', datafield: 'Edit', columntype: 'button', width: 30, pinned: true,
      cellsrenderer: (): string => { return 'Edit'; },
      buttonclick: (row: number): void => {
        let dataRecord = this.jqxGridVentas.getrowdata(row);
        this.openEdit(dataRecord.id);
      }
    },*/
    // {text: 'Id', datafield: 'id', width: 90, pinned: true },
    {text: 'Folio', datafield: 'folio', width: 80, pinned: true},
    {text: 'Emisor', datafield: 'empresa', width: 300 },
    {text: 'Sucursal', datafield: 'sucursal', width: 160 },
    {text: 'Cliente', datafield: 'cliente', width: 260 },
    {text: 'Divisa', datafield: 'divisa', width: 80 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 170, cellsformat: 'D'},
    {text: '(+) Subtotal', datafield: 'subtotal', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(+) T. federal', datafield: 'traslados', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-) R. federal', datafield: 'retenciones', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(-) Descuento', datafield: 'descuento', width: 130, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
    {text: '(=) Total', datafield: 'total', width: 150, cellsalign: 'right', cellsformat: 'c2', align: 'right'},
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
      { name: 'created_at', type: 'string' },
      { name: 'subtotal', type: 'float' },
      { name: 'descuento', type: 'float' },
      { name: 'traslados', type: 'float' },
      { name: 'retenciones', type: 'float' },
      { name: 'total', type: 'float' },
    ]
  };
  
  dataAdapter: any = new jqx.dataAdapter(this.source);
  seleccionados: number;

  constructor(
    private service: SalesService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
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

  selectedCompanyRoot(event: any){
    this.filter.branch_id = undefined;
    this.list_root_sucursal = event.sucursales || [];
  }

  load(){
    this.service.gets(this.getFilter()).subscribe(data => {
      this.source.localdata = data;
      this.jqxGridVentas.updatebounddata();
    });
  }

  getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter)
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0)
        delete filter[att];
    return filter;
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridVentas);
    this.seleccionados = seleccionado.length;
  }

  openView(id: any = null){
    if(id == null || typeof id == "undefined" || id <= 0){
      const seleccionado = getRowsSelected(this.jqxGridVentas);
      id = seleccionado[0].id;
    }

    if (Number(id) <= 0) return alertError("Seleccione un registro antes de continuar");

    this.service.get_view_by_id(id).subscribe((cotizacion: any) => {
      this.currentVenta = cotizacion;
      this.title = `${cotizacion.folio || ""} / ${cotizacion.empresa}`;
      this.modalRefView = this.modalService.open(this.modalView, {backdrop: "static", animation:true, size: "xl"});
    });
  }

  loadCombosCE(callback: Function): void{
    this.service.loadCombosCE().subscribe(data => {
      this.list_ce_companys = data.empresas;
      this.list_ce_customers = data.clientes;
      this.list_ce_divisas = data.divisas;
      
      return callback();
    });
  }
  openEdit(id: any = null){
    console.log("Id cotizacion seleccionada: "+id);
    
    if (id == null){
      const seleccionado = getRowsSelected(this.jqxGridVentas);
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
        const detalles = JSON.parse(JSON.stringify(cotizacion.detalles || []));
        if (detalles.length > 0){
          const formGruops = detalles.map((entrada: any)=> {
            const form = this.bildFormDetalleVenta();
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
          this.form.setControl('detalles', this.formBuilder.array(formGruops));
        }
        this.form.patchValue(cotizacion);
        this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: "static", animation:true, size: "xl"});
      });
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
      detalles: this.formBuilder.array([]),
      is_active: [true],
      created_at: [new Date(),]
    });
  }

  bildFormDetalleVenta(): FormGroup{
    return this.formBuilder.group({
      producto_id: [null, [Validators.required]],
      concepto: [null, [Validators.required]],
      precio_unitario: [0, [Validators.required]],
      cantidad: [1, [Validators.required]],
      descuento: [0],
      subtotal: [0],
      total: [0],
      impuestos: this.formBuilder.array([]),
    });
  }
  buildFormImpuesto(): FormGroup{
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

  openCreate(){
    this.buildForm();
    this.loadCombosCE(() =>{
      this.title = `Nueva venta`;

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

  selectedCustomerCE(event: any){}
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

      this.load();


    }, (error) => {
      return alertError(error);
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
    let current = getFormArray('detalles', this.form).at(index).value;
    
    // Asignamos los datos del producto al registro seleccionado
    current.producto_id = product.id;
    current.concepto = product.nombre;
    // Buscamos el precio que le corresponde dependiendo al precio seleccionado por el usuario o asignado por default.
    /*var precio_id_current = this.form.controls["precio_id"].value;
    for(var i in product.precios){
      if(product.precios[i].id == precio_id_current){ 
        current.precio_unitario = product.precios[i].base;
        break;
      }
    }*/
    current.total = current.precio_unitario * current.cantidad;
    this.formDetail = this.bildFormDetalleVenta();
    this.formDetail.patchValue(current);

    const formGroupTax = (product.impuestos || []).map((tax: any) => {
      const formTax = this.buildFormImpuesto();
      formTax.patchValue(tax);
        return formTax;
    });
    this.formDetail.setControl("impuestos", this.formBuilder.array(formGroupTax));
    this.getFormArray('detalles', this.form).removeAt(index);
    this.getFormArray('detalles', this.form).insert(index, this.formDetail);

    this.recalculaVenta();
  }

  recalculaVenta(){
    const detalles = getFormArray('detalles', this.form).controls;
    for(var i in detalles){
      this.recalculaDetalleVenta(parseInt(i));
    }
    var sumSubtotal = 0, sumDecuento = 0, granTotal = 0, totalTraslado = 0, totalRetencion = 0;
    const detalles2 = getFormArray('detalles', this.form).controls;
    
    for (var i in detalles2){
      var entrada = detalles2[i].value;
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
    this.recalculaDetalleVenta(index);
    this.recalculaVenta();
  }

  recalculaDetalleVenta(index: number = -1) {
    if (index < 0) return;
    const form = this.getFormArray('detalles', this.form).at(index);
    const entrada = this.getFormArray('detalles',this.form).at(index).value;
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

  deleteDetail(index: number){
    alertConfirm("¿Realmente desea eliminar el registro seleccinado?", (result: any) =>{
      if (result.isConfirmed){
        this.getFormArray('detalles', this.form).removeAt(index);
        const detalles = this.getFormArray('detalles', this.form).controls;
        if(detalles.length <= 0){
          this.getFormArray('detalles', this.form).push(this.bildFormDetalleVenta());
        }
        this.recalculaVenta();
      }
    });
  }

  nuevaLinea(){
    this.getFormArray('detalles', this.form).push(this.bildFormDetalleVenta());
  }

  openDelete(){}
}
