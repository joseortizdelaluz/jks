import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { LIST_SERVERS } from 'src/app/apps/const';
import { ServiceEmail } from 'src/app/apps/enums';
import { IBank } from 'src/app/apps/models/bank.model';
import { CompanySelect } from 'src/app/apps/models/company.model';
import { IDivisa } from 'src/app/apps/models/generic.models';

import { AccountCompanyService } from 'src/app/apps/services/accounts-company.service';
import { DepartamentoCompanysService } from 'src/app/apps/services/departamento-companys.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertError, alertOk, getFormControl, getRowsSelected, alertConfirm, getServiceEmail, dialog } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-departamentos-company',
  templateUrl: './departamentos-company.component.html',
  styleUrls: ['./departamentos-company.component.css']
})
export class DepartamentosCompanyComponent implements OnInit {
  @ViewChild('jqxGridDepartamentosCompany', { static: false }) jqxGridDepartamentosCompany: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;

  public list_servicios: any[] = [];

  public filter: any = {is_active: true};
  public form: FormGroup;
  public seleccionados: number = 0;
  public getFormControl: Function = getFormControl;
  public list_companys_index: CompanySelect[] = [];
  public list_banks_index: IBank[] = [];
  public list_divisas_index: IDivisa[] = [];
  public list_companys: CompanySelect[] = [];
  public list_banks: IBank[] = [];
  public list_divisas: IDivisa[] = [];
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'nombre', type: 'string' },
      { name: 'company', type: 'string' },
      { name: 'servicio', type: 'string' },
      { name: 'username', type: 'string' },
      { name: 'created_at', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  private modalRefCE: any = null;
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 80, pinned: true },
    {text: 'Nombre', datafield: 'nombre', width: 300, pinned: true },
    {text: 'Empresa', datafield: 'company', width: 350 },
    {text: 'Servicio', datafield: 'servicio', width: 250 },
    {text: 'Usuario', datafield: 'username', width: 200 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];
  constructor(
    private service: DepartamentoCompanysService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private vs: ValidationService,
  ){}

  ngOnInit(): void {
    this.load();
  }

  getFilter(){
    if (typeof this.filter.is_active == "undefined" || this.filter.is_active == null)
      delete this.filter.is_active;
    if (typeof this.filter.company_id == "undefined" || this.filter.company_id == null)
      delete this.filter.company_id;
    if (typeof this.filter.bank_id == "undefined" || this.filter.bank_id == null)
      delete this.filter.bank_id;
    if (typeof this.filter.divisa_id == "undefined" || this.filter.divisa_id == null)
      delete this.filter.divisa_id;
    if (typeof this.filter.cuenta_clave_tarjeta == "undefined" || this.filter.cuenta_clave_tarjeta == null)
      delete this.filter.cuenta_clave_tarjeta;
    return this.filter
  }

  load(): void{
    this.service.get_multi(this.getFilter()).subscribe(
    data => {
      this.source.localdata = data;
      this.jqxGridDepartamentosCompany.updatebounddata();
    });
  }

  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [null],
      company_id: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      servicio: [ServiceEmail.gmail, [Validators.required]],
      host: this.formBuilder.control({value: LIST_SERVERS[ServiceEmail.gmail].host, disabled: true}),
      port: this.formBuilder.control({value: LIST_SERVERS[ServiceEmail.gmail].port, disabled: true}),
      username: [null],
      password: [null],
      is_active: [true],
    });
  };

  loadCombos(callback: Function) {
    this.service.loadCombosCE().subscribe(data => {
      this.list_companys = data.empresas;
      callback();
    });
  }

  openCreate(){
    this.buildForm();
    this.loadCombos(() => {
      this.list_servicios = getServiceEmail();
      this.modalRefCE = this.modalService.open(this.modalCE, {size: 'lg', backdrop: true, animation:true});
    });
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridDepartamentosCompany);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    this.buildForm();

    this.loadCombos(() => {
      this.service.get_one(seleccionado[0].id).subscribe((data: any) => {
        console.log("-------------------------------------------------------");
        console.log(data);

        this.list_servicios = getServiceEmail();
        this.form.patchValue(data);
        this.form.get("company_id")?.disable();

        if(LIST_SERVERS[data.servicio].default){
          this.form.get("host")?.disable();
          this.form.get("port")?.disable();
        }else{
          this.form.get("host")?.enable();
          this.form.get("port")?.enable();
        }

        this.modalRefCE = this.modalService.open(this.modalCE, {size: 'lg', backdrop: true, animation:true});
      }, error => {
        alertError(error.error.detail|| "No se pudo editar el banco.");
      });
    });
  }

  save(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.getRawValue();
    this.service.save(model).subscribe((ok) => {
      if(typeof model.id != "undefined" && model.id > 0){
        dialog("Departamento modificado correctamente.", 'success', 3000);
      }else{
        dialog("Departamento agregado correctamente.", 'success', 3000);
      }
      this.load();
      this.modalRefCE.close();
    }, (error) => {
      alertError(error);
    });
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridDepartamentosCompany);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.delete(seleccionado[0].id).subscribe(data => {
          dialog("Departamento eliminada correctamente!", 'success', 3600);
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar la cuenta");
        });
      }
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridDepartamentosCompany);
    this.seleccionados = seleccionado.length;
  }

  selectedService(event: any){
    console.log(event);
    
    this.form.controls["host"].setValue(null);
    this.form.controls["port"].setValue(null);
    this.form.get("host")?.enable();
    this.form.get("port")?.enable();
    if(typeof event != "undefined"){
      if(event.server.default){
        this.form.controls["host"].setValue(event.server.host);
        this.form.controls["port"].setValue(event.server.port);
  
        this.form.get("host")?.disable();
        this.form.get("port")?.disable();
      }
    }
  }
}