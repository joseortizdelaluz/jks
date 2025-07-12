import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { alertConfirm, alertError, alertOk, dateToString, getFormArray, getFormControl, getRowsSelected } from 'src/app/utils/utils';
// import { IProveedor, Proveedor } from '../../models/proveedor.model';
import { ProveedorService } from '../../../services/proveedor.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IColonia, IDivisa, IEstado, IFormaPago, IMunicipio, IPais } from 'src/app/apps/models/generic.models';
import { GeneralService } from 'src/app/apps/services/general.service';
import { Observable, OperatorFunction, catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';
import { IBank } from 'src/app/apps/models/bank.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Validations } from 'src/app/utils/validations';
import { ValidationService } from 'src/app/services/validation.service';


@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {
  @ViewChild('jqxGridProveedores', { static: false }) jqxGridProveedores: jqxGridComponent;
  @ViewChild("modalProveedor", {static: false}) modalProveedor: TemplateRef<any>;
  @ViewChild("modalCategoria", {static: false}) modalCategoria: TemplateRef<any>;
  seleccionados: number = 0;
  observableArray: any = new jqx.observableArray([], (changed: any): void => {});
  listaProveedores: any[] = [];
  private modalRefCE: any = null;
  private modalRefCategoria: any = null;
  public searching = false;
	public searchFailed = false;
  filter: any = {};
  form: FormGroup;
  formCategoria: FormGroup;
  public list_categorias: any[] = [];
  public list_paises: IPais[] = [];
  public list_estados: IEstado[] = [];
  public list_municipios: IMunicipio[] = [];
  public list_divisas: IDivisa[] = [];
  public list_bancos: IBank[] = [];
  public list_forma_pago: IFormaPago[] = [];

  public getFormControl: Function = getFormControl;
  public getFormArray: Function = getFormArray;
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'razon_social', type: 'string' },
      { name: 'rfc', type: 'string' },
      { name: 'celular', type: 'string' },
      { name: 'telefono', type: 'string' },
      { name: 'contacto', type: 'string' },
      { name: 'web', type: 'string' },
      { name: 'created_at', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 80, pinned: true },
    {text: 'Estatus', datafield: 'is_active', width: 70, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
                <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
              </div>`;
    }},
    {text: 'Razon social', datafield: 'razon_social', width: 300, pinned: true },
    {text: 'R.F.C.', datafield: 'rfc', width: 170 },
    {text: 'Teléfono', datafield: 'telefono', width: 120 },
    {text: 'Celular', datafield: 'celular', width: 140 },
    {text: 'Contacto', datafield: 'contacto', width: 230 },
    {text: 'Sitio Web', datafield: 'web', width: 240 },
    {text: 'Fecha creación', datafield: 'created_at', width: 200 },
  ];

  constructor(
    private router: Router,
    private service: ProveedorService,
    private generalService: GeneralService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService,
  ){}

  ngOnInit(): void {
    this.loadDataGrid();
  }
  
  private buildForm(){
    this.form = this.formBuilder.group({
      id: [null],
      tipo_persona: ['M', [Validators.required]],
      sr_sra: [],
      razon_social: ['', [Validators.required], [Validations.checkRazonSocialProveedor(this.validationService)]],
      rfc: ['', [Validators.minLength(12), Validators.maxLength(13), Validations.checkRFC()], [Validations.checkRFCProveedor(this.validationService)]],
      web: [''],
      comentarios: [''],

      contacto: [''],
      correo: ['', [Validators.email]],
      correo_alternativo: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      telefono_alternativo: ['', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      celular: ['', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      fax: [''],
      
      categoria_id: [null],

      //Dirección
      calle: [''],
      num_ext: [''],
      num_int: [''],
      colonia: [''],
      referencia: [''],
      municipio_id: [null],
      estado_id: [null],
      pais_id: [null],
      cp: ['', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]\d*$/) ]],

      relaciones: this.formBuilder.array([]),
      nombre_legal: [''],
      divisa_id: [null],
      limite_credito: [0],
      cuenta: [''],
      banco_id: [null],
      forma_pago_id: [null],
      cuenta_bancaria: [''],
      clabe_interbancaria: [''],

      is_active: [true],
    });
    const disabled = ["sr_sra", "direccion"];
    for(var d in disabled){
      this.form.get(disabled[d])?.disable();
    }
  }

  private formGroupRelacion(){
    return this.formBuilder.group({
      contacto: [null, [Validators.required]],
      puesto: [null, ],
      correo: ['', [Validators.email]],
      telefono: ['',],
      rol: [null, ],
    });
  }



  loadEstados(event: IPais, callback: any=undefined){
    this.generalService.estados(event.clave, event.id).subscribe(data => {
      this.list_estados = data;
      if (typeof callback == "function"){
        callback();
      }
    });
  }

  loadMunicipios(event: IEstado, callback: any=undefined){
    this.generalService.municipios(event.clave!, event.id).subscribe(data => {
      this.list_municipios = data;
      if (typeof callback == "function"){
        callback();
      }
    });
  }

  getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter){
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0){
        delete filter[att];
      }
    }
    return filter;
  }


  loadDataGrid(){
    this.service.getList(this.getFilter()).subscribe(data => {
      this.source.localdata = data;
      this.jqxGridProveedores.updatebounddata();
    }, error => {});
  }

  buscarCp: OperatorFunction<string, readonly IColonia[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 3
    }),
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => (this.searching = true)),
    switchMap((term) =>
      this.generalService.findCp(term).pipe(
        tap(() => this.searchFailed = false),
        catchError(() => {
          this.searchFailed = true;
          return of([]);
        })
      )
    ),
    tap(() => (this.searching = false)),
  );
  
  selectedCP(result: any){
    this.form.controls['colonia'].setValue(result.asenta);
    this.form.controls['cp'].setValue(result.cp);

    setTimeout(() => {
      const value = JSON.parse(JSON.stringify(this.form.controls["cp"].value)); 
      this.form.controls['cp'].setValue("");
      this.form.controls['cp'].setValue(result.cp);
    }, 450);

    // Seleccionamos el estado del CP.
    const clave_numerica_estado = result.estado,
    clave_numerica_municipio = result.municipio;
    let pais = undefined; 
    for(var i in this.list_paises){
      if (this.list_paises[i].clave == "MEX"){
        pais=this.list_paises[i];
        break;
      }
    }
    if (typeof pais != "undefined"){
      this.loadEstados(pais, () => {
        let estado = undefined;
        for(var i in this.list_estados){
          if (this.list_estados[i].clave_numerica == clave_numerica_estado){
            estado = this.list_estados[i];
            this.form.controls["estado_id"].setValue(this.list_estados[i].id);
            break;
          }
        }
        if(typeof estado != "undefined"){
          this.loadMunicipios(estado, () => {
            for(var i in this.list_municipios){
              if(this.list_municipios[i].clave == clave_numerica_municipio){
                this.form.controls["municipio_id"].setValue(this.list_municipios[i].id);
                break;
              }
            }
          });
        }
      });
    }
  }
  
  resultFormatter(value: any) {
    return value.cp;
  }

  inputFormatter(value: any){
    if (value.cp)
      return value.cp;
    return value;
  }
  eliminaContacto(index: number){
    const value = getFormArray('relaciones', this.form).value[index];
    alertConfirm(`¿Realmente desea eliminar el contacto ${value.contacto}?`, (result: any)=>{
      if (result.isConfirmed){
        this.getFormArray('relaciones', this.form).removeAt(index);
      }
    });
  }

  editProveedor(editar: boolean = false){
    if (editar){
      const seleccionado = getRowsSelected(this.jqxGridProveedores);
      if (seleccionado.length <= 0)
        return alertError("No ha seleccionado un registro aún.");
      this.router.navigate(['/app/proveedores/editar', seleccionado[0].id]);
    }else{
      this.router.navigate(['/app/proveedores/nuevo']);
    }
  }
  deleteProveedor(){}
  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridProveedores);
    this.seleccionados = seleccionado.length;
  }

  loadCombos(callback: Function){
    this.service.loadCombosCE().subscribe(data => {
      this.list_paises = data.paises || [];
      this.list_estados = data.estados || [];
      this.list_categorias = data.categorias || [];
      this.list_divisas = data.divisas || [];
      this.list_bancos = data.bancos || [];
      this.list_forma_pago = data.forma_pagos || [];
      console.log("=========================================");
      console.log("=========================================");
      console.log(this.list_forma_pago);
      console.log("=========================================");
      console.log("=========================================");
      callback();
    });
  }

  openCreate(){
    this.buildForm();
    this.loadCombos(() => {
      for(var i in this.list_paises){
        if (this.list_paises[i].clave == "MEX"){
          this.form.controls["pais_id"].setValue(this.list_paises[i].id);
          break;
        }
      }
      this.modalRefCE = this.modalService.open(this.modalProveedor, {backdrop: true, animation:true, size: "xl"});
    });
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridProveedores);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");

    this.buildForm();
    this.loadCombos(() => {
      this.service.getProveedor(seleccionado[0].id).subscribe((data: any) => {
        this.form.patchValue(data);
        let pais = undefined; 
        for(var i in this.list_paises){
          if (this.list_paises[i].id == data.pais_id){
            pais=this.list_paises[i];
            this.form.controls["pais_id"].setValue(this.list_paises[i].id);
            break;
          }
        }
        if (typeof pais != "undefined"){
          this.loadEstados(pais, () => {
            let estado = undefined;
            for(var i in this.list_estados){
              if (this.list_estados[i].id == data.estado_id){
                estado = this.list_estados[i];
                this.form.controls["estado_id"].setValue(this.list_estados[i].id);
                break;
              }
            }
            if(typeof estado != "undefined"){
              this.loadMunicipios(estado, () => {
                for(var i in this.list_municipios){
                  if(this.list_municipios[i].id == data.municipio_id){
                    this.form.controls["municipio_id"].setValue(this.list_municipios[i].id);
                    break;
                  }
                }
              });
            }
          });
        }
        this.modalRefCE = this.modalService.open(this.modalProveedor, {backdrop: true, animation:true, size: "xl"});
      }, error => {
        alertError(error.error.detail|| "No se pudo editar cargar la información.");
      });
    });

  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridProveedores);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.delete(seleccionado[0].id).subscribe(data => {
          alertOk("Registro eliminado correctamente.");
          this.loadDataGrid();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar el registro");
        });
      }
    });
  }

  save(event: Event){
    event.preventDefault();

    console.log(this.form.invalid)
    console.log(this.form)


    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.update(model.id, model).subscribe(data => {
        alertOk("Registro modificado correctamente.");
        this.loadDataGrid();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.create(model).subscribe(data => {
        alertOk("Registro agregado correctamente");
        this.loadDataGrid();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  agregarRelacion(){
    this.getFormArray('relaciones', this.form).push(this.formGroupRelacion());
  }

  addCategoria(){
    this.formCategoria = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      is_active: [true],
    });
    this.modalRefCategoria = this.modalService.open(this.modalCategoria, {backdrop: false, animation:true});
  }
  
  saveCategoria(event: Event){
    event.preventDefault();
    if (this.formCategoria.invalid){
      return this.formCategoria.markAllAsTouched();
    }
    const categoria = this.formCategoria.value;
    this.service.saveCategoria(categoria).subscribe((categoria: any)=>{
      this.list_categorias.push(categoria);
      this.modalRefCategoria.close();
    }, error => {});
  }
}
