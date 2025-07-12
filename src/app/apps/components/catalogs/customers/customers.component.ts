import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { IColonia, IEstado, IMunicipio, IPais, IRegimen, IUsoCFDI } from 'src/app/apps/models/generic.models';
import { CustomersService } from 'src/app/apps/services/customers.service';
import { GeneralService } from 'src/app/apps/services/general.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertError, alertOk, getFormControl, getRowsSelected } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})

export class CustomersComponent implements OnInit {
  @ViewChild('jqxGridCustomers', { static: false }) jqxGridCustomers: jqxGridComponent;
  @ViewChild("modalCustomer", {static: false}) modalCustomer: TemplateRef<any>;
  public filter: any = {is_active: '1'};
  public form: FormGroup;
  public getFormControl: Function = getFormControl;
  public seleccionados: number = 0;
  public searching = false;
	public searchFailed = false;
  public list_regimenes: IRegimen[] = [];
  public list_usos_cfdi: IUsoCFDI[] = [];
  public list_paises: IPais[] = [];
  public list_estados: IEstado[] = [];
  public list_municipios: IMunicipio[] = [];
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'razon_social', type: 'string' },
      { name: 'rfc', type: 'string' },
      { name: 'descripcion_regimen', type: 'string' },
      { name: 'descripcion_uso_cfdi', type: 'string' },
      { name: 'descripcion_estado', type: 'string' },
      { name: 'cp', type: 'string' },
      { name: 'contacto', type: 'string' },
      { name: 'telefono', type: 'string' },
      { name: 'correo', type: 'string' },
      { name: 'created_at', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  private modalRefCE: any = null;
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
    {text: 'Nombre/Razón social', datafield: 'razon_social', width: 200, pinned: true },
    {text: 'Rfc', datafield: 'rfc', width: 150 },
    {text: 'Estado', datafield: 'descripcion_estado', width: 170 },
    {text: 'Cp', datafield: 'cp', width: 90 },
    {text: 'Uso CFDI', datafield: 'descripcion_uso_cfdi', width: 170 },
    {text: 'Régimen', datafield: 'descripcion_regimen', width: 270 },
    {text: 'Contacto', datafield: 'contacto', width: 200 },
    {text: 'Email', datafield: 'correo', width: 200 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];

  /**
   * Funcion para crear el formulario
   * de alta y edicion de un cliente.
   * @param callback 
   */
  
  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [''],
      razon_social: ['', [Validators.required], [Validations.checkRazonSocialCliente(this.validationService)]],
      rfc: ['', [Validators.minLength(12), Validators.maxLength(13), Validations.checkRFC()], [Validations.checkRFCCliente(this.validationService)]],
      regimen_id: [null],
      uso_cfdi_id: [null],

      alias: [null],
      limite_credito: [0],

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
      is_active: [true],

      // Otros datos
      contacto: [''],
      correo: ['', [Validators.email]],
      telefono: [''],
    });
  };

  constructor(
    private service: CustomersService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService,
    private generalService: GeneralService,
  ){}
  ngOnInit(): void {
    this.load();
  }

  load(): void{
    if(typeof this.filter.is_active != "undefined"){
      this.filter.is_active = this.filter.is_active == '1';
    }
    this.service.getCustomers(this.filter).subscribe(
      data => {
        this.source.localdata = data;
        this.jqxGridCustomers.updatebounddata();
      });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridCustomers);
    this.seleccionados = seleccionado.length;
  }

  saveCustomer(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const customer = this.form.value;
    if (typeof customer.id != "undefined" && customer.id){
      this.service.updateCustomer(customer.id, customer).subscribe(data => {
        alertOk("Cliente modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.createCustomer(customer).subscribe(data => {
        alertOk("Cliente agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridCustomers.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  loadCombos(callback: any){
    this.service.loadCombosCE().subscribe(data => {
      this.list_regimenes = data.regimenes;
      this.list_usos_cfdi = data.usos_cfdi;
      this.list_paises = data.paises;
      this.list_estados = data.estados;
      callback();
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

  resultFormatter(value: any) {
    return value.cp;
  }

  inputFormatter(value: any){
    if (value.cp)
      return value.cp;
    return value;
  }

  createCustomer(){
    this.buildForm();
    this.loadCombos(() => {
      // Ponemos el pais MEX por default
      for(var i in this.list_paises){
        if (this.list_paises[i].clave == "MEX"){
          this.form.controls["pais_id"].setValue(this.list_paises[i].id);
          break;
        }
      }
      this.modalRefCE = this.modalService.open(this.modalCustomer, {size:'lg', backdrop: false, animation:true});
    });
  }

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

  editCustomer(): void{
    const seleccionado = getRowsSelected(this.jqxGridCustomers);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");

    this.buildForm();
    this.loadCombos(() => {
      this.service.getCustomer(seleccionado[0].id).subscribe(data => {
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
        this.modalRefCE = this.modalService.open(this.modalCustomer, {size:'lg', backdrop: false, animation:true});
      }, error => {
        alertError(error.error.detail|| "No se pudo editar el cliente");
      });
    });

  }

  viewCustomer(): void{

  }

  deleteCustomer(): void{

  }

}
