import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Select2Option } from 'ng-select2-component';
import { alertConfirm, alertError, alertOk, dateToString, getFormArray, getFormControl, getRowsSelected, jsonToFormData, readFileWriteUrl } from 'src/app/utils/utils';


import { TrasladoRetencion, TypeProduct, OrigenProduct } from 'src/app/apps/enums';
import { ProductsService } from 'src/app/apps/services/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Validations } from 'src/app/utils/validations';
import { ValidationService } from 'src/app/services/validation.service';
import { Observable, OperatorFunction, catchError, debounceTime, distinctUntilChanged, filter, first, switchMap, tap } from 'rxjs';
import { IProductoServicio, IUnidadMedida } from 'src/app/apps/models/billing.model';
import { GeneralService } from 'src/app/apps/services/general.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  @ViewChild('jqxGridProductos', { static: false }) jqxGridProductos: jqxGridComponent;
  @ViewChild("modalCrearDireccion", {static: false}) modalCrearDireccion: TemplateRef<any>;
  @ViewChild("modalTypeProduct", {static: false}) modalTypeProduct: TemplateRef<any>;
  @ViewChild("modalCEInventario", {static: false}) modalCEInventario: TemplateRef<any>;
  @ViewChild("modalCEService", {static: false}) modalCEService: TemplateRef<any>;
  @ViewChild("modalCEKit", {static: false}) modalCEKit: TemplateRef<any>;

  public getFormControl: Function = getFormControl;
  public getFormArray: Function = getFormArray;
  private modalRefTypeProduct: any = null;
  private modalRefProductInventario: any = null;
  private modalRefCEProduct: any = null;
  public searchingPS = false;
  public searchFailedPS = false;
  public searchingUM = false;
  public searchFailedUM = false;
  public trasladoRetencion = TrasladoRetencion;

  observableArray: any = new jqx.observableArray([], (changed: any): void => {});
  seleccionados: number = 0;
  listaProductos: any[] = [];
  filter: any = {limit: 50};

  list_departamentos_index: any[] = [];
  list_clases_index: any[] = [];
  list_categorias_index: any[] = [];

  list_departamentos_ce: any[] = [];
  list_clases_ce: any[] = [];
  list_categorias_ce: any[] = [];
  list_unidad_medida: any[] = [];
  list_proveedores_ce: any[] = [];
  list_impuestos_ce: any[] = [];
  list_precios_ce: any[] = [];
  list_sucursales_ce: any = [];
  list_divisas_ce: any[] = [];

  form: FormGroup;
  titleModal: string = "";
  listaDepartamentos: Select2Option[] = [];
  listaClases: Select2Option[] = [];
  listaCategorias: Select2Option[] = [];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private service: ProductsService,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private generalService: GeneralService,
  ){
  }

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'nombre', type: 'string' },
      { name: 'clave', type: 'string' },
      { name: 'codigo_barras', type: 'string' },
      { name: 'tipo_producto', type: 'string' },
      { name: 'departamento', type: 'string' },
      { name: 'clase', type: 'string' },
      { name: 'categoria', type: 'string' },
      { name: 'unidad_stock', type: 'string' },
      { name: 'unidad_compra', type: 'string' },
      { name: 'unidad_venta', type: 'string' },
      { name: 'numero_serie', type: 'bool' },
      { name: 'lotes', type: 'bool' },
      { name: 'pedimento_aduanal', type: 'bool' },
      { name: 'created_at', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  columns:any[] = [
    { text: '', datafield: 'id', width: 100, pinned: true, cellsrenderer: (row: number, datafield: string, value: number, a: any, b: any, data: any)=>{
      var href = '/app/productos/';
      var ver = '/app/productos/';
      if(data.tipo_producto == TypeProduct.inventario){
        href += `producto-inventario/${value}/${data.tipo_producto}`;
        ver += 'ver-producto-inventario/' + value;
      }else if(data.tipo_producto = TypeProduct.servicio){
        href += `servicio/${value}/${data.tipo_producto}`;
        ver += 'ver-servicio/' + value;
      }
      return `<div class="text-center align-middle py-2">
        <a class="text-primary" href="${ver}">
          <i class="fas fa-eye" style="font-size:1.0rem;"></i>
        </a>&nbsp;
        <a class="text-warning" href="${href}">
          <i class="fas fa-pencil" style="font-size:1.0rem;"></i>
        </a>
      </div>`;
    }},
    { text: 'Estatus', datafield: 'is_active', width: 60, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
                <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
              </div>`;
    }},

    { text: 'Nombre', datafield: 'nombre', width: 300, pinned: true },
    { text: 'Clave', datafield: 'clave', width: 170},
    { text: 'TP', datafield: 'tipo_producto', width: 20, cellsrenderer: (row: number, datafield: string, value: string)=>{
      return `<div class="text-center py-2"><strong>${value}</strong></div>`;
    }},
    { text: 'LOTE', datafield: 'lotes', width: 40, columntype: 'checkbox'},
    { text: 'SERIE', datafield: 'numero_serie', width: 45, columntype: 'checkbox'},
    { text: 'PEDIM', datafield: 'pedimento_aduanal', width: 50, columntype: 'checkbox' },
    { text: 'Cod. de barras(UPC)', datafield: 'codigo_barras', width: 220 },
    { text: 'Deapartamento', datafield: 'departamento', width: 100 },
    { text: 'Clase', datafield: 'clase', width: 220 },
    { text: 'Categoría', datafield: 'categoria', width: 220 },
    { text: 'Unidad de compra', datafield: 'unidad_compra', width: 220 },
    { text: 'Unidad de venta', datafield: 'unidad_venta', width: 220 },
    { text: 'Unidad de stock', datafield: 'unidad_stock', width: 220 },
    { text: 'Fecha creación', datafield: 'created_at', width: 220},

  ]

  ngOnInit(): void {
    this.loadGrid();
  }

  getFilter(){
    const filter = this.filter;
    return filter;
  }

  loadGrid(){
    this.service.list(this.getFilter()).subscribe(data => {
      this.source.localdata = data;
      this.jqxGridProductos.updatebounddata();
    });
  }

  loadCombosIndex(){
    this.service.loadCombosIndex().subscribe((data: any) => {
      this.list_departamentos_index = data.departamentos || [];
      this.list_clases_index = data.clases || [];
      this.list_categorias_index = data.categorias || [];
    });
  }

  loadCombosCE(tipo_producto: TypeProduct, callback: Function){
    this.service.loadCombosCE(tipo_producto).subscribe((data: any) => {
      this.list_departamentos_ce = data.departamentos || [];
      this.list_clases_ce = data.clases || [];
      this.list_categorias_ce = data.categorias || [];
      this.list_unidad_medida = data.unidades_medida;
      this.list_proveedores_ce = data.proveedores;
      this.list_impuestos_ce = data.impuestos;
      this.list_precios_ce = data.precios;
      this.list_sucursales_ce = data.sucursales;
      this.list_divisas_ce = data.divisas || [];
      return callback();
    });
  }

  formBuildInventario(){
    this.form = this.formBuilder.group({
      id: [null],
      clave: [null, [], [Validations.checkClaveProducto(this.validationService)]],
      nombre: ['', [Validators.required], [Validations.checkNombreProducto(this.validationService)]],
      codigo_barras: ['', [], [Validations.checkCodigoBarrasProducto(this.validationService)]],
      descripcion: [null],
      comentario: [null],
      nombre_clave_proveedor: [null],
      unidad_stock_id: [null],
      unidad_compra_id: [null],
      unidad_venta_id: [null],

      factor: [1],
      clase_id: [null],
      categoria_id: [null],
      departamento_id: [null],

      precio_compra: [0],
      peso: [0],
      unidad_peso: [null],
      numero_serie: [false],
      lotes: [false],
      pedimento_aduanal: [false],

      producto_servicio: [null],
      unidad_medida: [null],
      tipo_producto: [TypeProduct.inventario],
      origen: [OrigenProduct.nacional],
      is_active: [true],

      cantidad_grupo1: [null],
      cantidad_grupo2: [null],
      cantidad_grupo3: [null],
      cantidad_grupo4: [null],

      imagenes: this.formBuilder.array([]),
      precios: this.formBuilder.array([]),
      proveedores: this.formBuilder.array([]),
      impuestos: this.formBuilder.array([]),
      disponibilidad: this.formBuilder.array([]),
      sucursales: this.formBuilder.array([]),
    });
  }

  formImage(value: any): FormGroup {
    return this.formBuilder.group({
      id: [value.id || null],
      default: [value.default || false], 
      binary: [null], 
      base_64: [value.base_64 || null], 
      loaded: [value.loaded || false],
      subloaded: [value.subloaded || false],
      ext: [value.ext || null],
    });
  }

  formProveedor(value: any= {}): FormGroup {
    return this.formBuilder.group({
      proveedor_id: [value.proveedor_id || null],
      divisa_id: [value.divisa_id || null],
      precio: [value.precio || 0],
      default: [value.default || false]
    });
  }
  
  formTaxes(impuesto: any = {}): FormGroup {
    return this.formBuilder.group({
      impuesto_id: [impuesto.impuesto_id || null, [Validators.required]],
      nombre: [impuesto.nombre || null],
      impuesto: [impuesto.impuesto || null],
      tasa_cuota: [impuesto.tasa_cuota || null],
      valor: [impuesto.valor || null],
      tipo: [impuesto.tipo || null],
      seleccionado: [impuesto.seleccionado || false],
    });
  }

  formPrecio(precio: any = {}): FormGroup {
    return this.formBuilder.group({
      precio_id: [precio.precio_id || null],
      nombre: [precio.nombre || null],
      precio_base: [precio.precio_base || false],
      base: [precio.base || null],
      grupo1: [precio.grupo1 || null],
      grupo2: [precio.grupo2 || null],
      grupo3: [precio.grupo3 || null],
      grupo4: [precio.grupo4 || null],
    });
  }

  formSucursal(sucursal: any = {}): FormGroup {
    return this.formBuilder.group({
      sucursal_id: [sucursal.sucursal_id || null],
      nombre: [sucursal.nombre || null],
      direccion: [sucursal.direccion || null],
      stock: [sucursal.stock || null],
      min: [sucursal.min || null],
      max: [sucursal.max || null],
      ubicacion: [sucursal.ubicacion || null],
    });
  }

  formBuildServicio(){
    this.form = this.formBuilder.group({
      id: [null],
      clave: [null, [], [Validations.checkClaveProducto(this.validationService)]],
      nombre: ['', [Validators.required], [Validations.checkNombreProducto(this.validationService)]],
      // codigo_barras: ['', [], [Validations.checkCodigoBarrasProducto(this.validationService)]],
      descripcion: [null],
      comentario: [null],
      // nombre_clave_proveedor: [null],
      // unidad_stock_id: [null],
      // unidad_compra_id: [null],
      // unidad_venta_id: [null],

      // factor: [1],
      // clase_id: [null],
      // categoria_id: [null],
      // departamento_id: [null],
      is_active: [true],
      // precio_compra: [0],
      // peso: [0],
      // unidad_peso: [null],
      // numero_serie: [false],
      // lotes: [false],
      // pedimento_aduanal: [false],
      producto_servicio: [null],
      producto_servicio_id: [null],
      unidad_medida_id: [null],
      unidad_medida: [null],
      tipo_producto: [TypeProduct.servicio],
      imagenes: this.formBuilder.array([]),
      precios: this.formBuilder.array([]),
      // proveedores: this.formBuilder.array([]),
      impuestos: this.formBuilder.array([]),
      disponibilidad: this.formBuilder.array([]),
      // sucursales: this.formBuilder.array([]),
    });
  }

  formBuildKit(){
    this.form = this.formBuilder.group({

    });
  }

  openCreate(){
    this.modalRefTypeProduct = this.modalService.open(this.modalTypeProduct, {backdrop: true, animation:true});
  }

  openEdit(){
    const seleccionado = getRowsSelected(this.jqxGridProductos);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");

    this.titleModal = `${seleccionado[0].clave} - ${seleccionado[0].nombre}`;
    if(seleccionado[0].tipo_producto == TypeProduct.inventario){
      this.formBuildInventario();
      this.loadCombosCE(TypeProduct.inventario, () => {
        this.service.getById(seleccionado[0].id).subscribe((product:any) => {
          this.form.patchValue(product);

          const formGropsProveedor = (product.proveedores || []).map((proveedor: any) => {
            return this.formProveedor(proveedor);
          });
          const proveedorFormArray = this.formBuilder.array(formGropsProveedor);
          this.form.setControl("proveedores", proveedorFormArray);

          const formGroupPrecios = this.list_precios_ce.map((precio: any)=>{
            let value = precio;
            for(var i in (product.precios || [])){
              if (precio.precio_id == product.precios[i].precio_id){
                value = {...precio, ...product.precios[i]};
                break;
              }
            }
            return this.formPrecio(value);
          });
          const precioFormArray = this.formBuilder.array(formGroupPrecios);
          this.form.setControl("precios", precioFormArray);

          const formGroupSucursales = this.list_sucursales_ce.map((sucursal: any) => {
            let value = sucursal;
            for(var i in (product.sucursales || [])){
              if(sucursal.sucursal_id == product.sucursales[i].sucursal_id){
                value = {...sucursal, ...product.sucursales[i]};
                break;
              }
            }
            return this.formSucursal(value);
          });
          const sucursalFormArray = this.formBuilder.array(formGroupSucursales);
          this.form.setControl("sucursales", sucursalFormArray);

          const formGroupTax = this.list_impuestos_ce.map((tax: any) =>{
            tax.seleccionado = false;
            for(var j in (product.impuestos || [])){
              if (tax.impuesto_id == product.impuestos[j].impuesto_id){
                tax.seleccionado = true;
                break;
              }
            }
            return this.formTaxes(tax);
          });
          const impuestoFormArray = this.formBuilder.array(formGroupTax);
          this.form.setControl('impuestos', impuestoFormArray);
          
          const formGroupImage = (product.imagenes || []).map((image: any) => {
            return this.formImage(image);
          });
          const imageFormArray = this.formBuilder.array(formGroupImage);
          this.form.setControl("imagenes", imageFormArray);

          // Acá vamos a rellenar la info papi.
          this.modalRefCEProduct = this.modalService.open(this.modalCEInventario, {backdrop: true, animation:true, size: "xl"});
        });
      });
    }
  }
  openView(){}
  openDelete(){}
  
  saveProduct(event: Event){
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const data = this.form.value;
    this.service.save(data, (error: any) => {
      if (error){

      }else{
        if(typeof data.id != "undefined" && data.id > 0){
          alertOk("Producto modificado correctamente.");
        }else{
          alertOk("El producto se creo correctamente");
        }
        this.modalRefCEProduct.close();
        this.loadGrid();
      }
    });
  }

  openCreateInventario(){
    this.titleModal = "Alta de producto";
    this.modalRefTypeProduct.close();
    this.formBuildInventario();
    this.loadCombosCE(TypeProduct.inventario, () => {
      /// Cargamos y seleccionamos los impuestos.
      if(this.list_impuestos_ce.length > 0){
        const formGroupTax = this.list_impuestos_ce.map((tax: any) =>{
          return this.formTaxes(tax);
        });
        const impuestoFormArray = this.formBuilder.array(formGroupTax);
        this.form.setControl('impuestos', impuestoFormArray);
      }

      if(this.list_precios_ce.length > 0){
        const formGroupPrecio = this.list_precios_ce.map((precio: any)=>{
          return this.formPrecio(precio);
        });
        const precioFormArray = this.formBuilder.array(formGroupPrecio);
        this.form.setControl("precios", precioFormArray);
      }

      if (this.list_sucursales_ce.length > 0){
        const formGroupSucursales = this.list_sucursales_ce.map((sucursal: any) => {
          return this.formSucursal(sucursal);
        });
        const sucursalesFormArray = this.formBuilder.array(formGroupSucursales);
        this.form.setControl("sucursales", sucursalesFormArray);
      }
      this.modalRefCEProduct = this.modalService.open(this.modalCEInventario, {backdrop: true, animation:true, size: "xl"});
    });
  }

  openCreateServicio(){
    this.titleModal = "Alta de servicio";
    this.modalRefTypeProduct.close();
    this.formBuildServicio();
    this.loadCombosCE(TypeProduct.servicio, () => {
      if(this.list_impuestos_ce.length > 0){
        const formGroupTax = this.list_impuestos_ce.map((tax: any) =>{
          return this.formTaxes(tax);
        });
        const impuestoFormArray = this.formBuilder.array(formGroupTax);

        console.log(impuestoFormArray);
        this.form.setControl('impuestos', impuestoFormArray);
      }

      if(this.list_precios_ce.length > 0){
        const formGroupPrecio = this.list_precios_ce.map((precio: any)=>{
          return this.formPrecio(precio);
        });
        const precioFormArray = this.formBuilder.array(formGroupPrecio);
        this.form.setControl("precios", precioFormArray);
      }

      if (this.list_sucursales_ce.length > 0){
        const formGroupSucursales = this.list_sucursales_ce.map((sucursal: any) => {
          return this.formSucursal(sucursal);
        });
        const sucursalesFormArray = this.formBuilder.array(formGroupSucursales);
        this.form.setControl("sucursales", sucursalesFormArray);
      }
      this.modalRefCEProduct = this.modalService.open(this.modalCEService, {backdrop: true, animation:true, size: "xl"});
    });
  }

  openCreateKit(){
    this.modalRefTypeProduct.close();
  }

  editarProducto(editar: boolean = false){
    if (editar){
      const seleccionado = getRowsSelected(this.jqxGridProductos);
      
      if (seleccionado.length <= 0)
      return alertError("No ha seleccionado un registro aún.");
      var url: string = '';
      if (seleccionado[0].tipo_producto == TypeProduct.inventario){
        url = '/app/productos/producto-inventario/';
      }else if (seleccionado[0].tipo_producto == TypeProduct.servicio){
        url = '/app/productos/producto-inventario/';
      }else if (seleccionado[0].tipo_producto == TypeProduct.kit){
        url = '/app/productos/producto-inventario/';
      }
      this.router.navigate([url, seleccionado[0].id]);
    }else{
      this.router.navigate(['/app/productos/tipo-articulo']);
    }
  }

  eliminarProducto(){

  }

  seleccionarRegistro(event: Event){}

  agregarProveedor(){
    const value:any = {};
    const proveedores = getFormArray('proveedores', this.form);
    if (proveedores.length <= 0){
      value.default = true;
    }
    for(var i in this.list_divisas_ce){
      if(this.list_divisas_ce[i].clave == "MXN"){
        value.divisa_id = this.list_divisas_ce[i].id;
        break;
      }
    }
    proveedores.push(this.formProveedor(value));
  }

  eliminaProveedor(index: number){}

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
    this.form.controls['producto_servicio_id'].setValue(result.id);
    this.form.controls['producto_servicio'].setValue(`${result.clave} - ${result.descripcion}`);
  }

  selectedUnidadMedida(result: any) {
    this.form.controls['unidad_medida_id'].setValue(result.id);
    this.form.controls['unidad_medida'].setValue(`${result.clave} - ${result.descripcion}`);
  }

  getCombosDetail(callback: Function){
    if(this.list_impuestos_ce.length > 0){
      return callback();
    }else{
      this.generalService.getTax().subscribe(impuestos => {
        this.list_impuestos_ce= impuestos;
        return callback();
      });
    }
  }

  agregarEliminarImpuesto(index: number, event: any):void{
    this.getFormArray('impuestos', this.form).at(index).get("seleccionado")?.setValue(event.target.checked);
  }

  addImagen(){
    const value:any = {};
    const imagenes = getFormArray('imagenes', this.form);
    if (imagenes.length <= 0){
      value.default = true;
    }
    imagenes.push(this.formImage(value));
  }

  onFileChange(index: number, event:any) {
    if (event.target.files.length > 0) {
      readFileWriteUrl(event.target, (error: any, imgb64: string)=>{
        if (!error){
          const imagenes = getFormArray('imagenes', this.form);
          const imagen = imagenes.at(index)?.value;
          imagen.base_64 = imgb64;
          imagen.ext = event.target.files[0].type.split("/").pop();
          imagen.loaded = false;
          imagen.subloaded = true;
          imagen.binary = event.target.files[0];
          imagenes.at(index).patchValue(imagen);
        }
      });
    }
  } 
  eliminarImagen(index: number){
    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any)=>{
      if (result.isConfirmed){
        const image = getFormArray('imagenes', this.form).at(index)?.value;
        this.getFormArray('imagenes', this.form).removeAt(index);
        const images = getFormArray('imagenes', this.form);
        // Ponemos la primer imagen como default.
        if(images.length > 0){
          if (image.default){
            const first = images.at(0).value;
            first.default = true;
            images.at(0).setValue(first);
          }
        }
      }
    });
  }
  setDefaultImg(index: number, event: any){
    if(event.currentTarget.checked){
      const imagenes = getFormArray("imagenes", this.form);
      for(var i in imagenes.value){
        let image = imagenes.value[i];
        image['default'] = false;
        if (parseInt(i) == index){
          image['default'] = true;
        }
        imagenes.at(Number(i)).patchValue(image);
      }
    }
  }
}
