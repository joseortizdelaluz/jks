import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { IBank } from 'src/app/apps/models/bank.model';
import { CompanySelect } from 'src/app/apps/models/company.model';
import { IDivisa } from 'src/app/apps/models/generic.models';

import { AccountCompanyService } from 'src/app/apps/services/accounts-company.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertError, alertOk, getFormControl, getRowsSelected, alertConfirm } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-accounts-company',
  templateUrl: './accounts-company.component.html',
  styleUrls: ['./accounts-company.component.css']
})
export class AccountsCompanyComponent implements OnInit {
  @ViewChild('jqxGridAccountsCompany', { static: false }) jqxGridAccountsCompany: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
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
      { name: 'is_active', type: 'bool' },
      { name: 'bank', type: 'string' },
      { name: 'company', type: 'string' },
      { name: 'rfc', type: 'string' },
      { name: 'cuenta', type: 'string' },
      { name: 'clabe', type: 'string' },
      { name: 'tarjeta', type: 'string' },
      { name: 'descripcion_divisa', type: 'string' },
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
    {text: 'Banco', datafield: 'bank', width: 170, pinned: true },
    {text: 'Empresa', datafield: 'company', width: 200 },
    {text: 'Cuenta', datafield: 'cuenta', width: 170 },
    {text: 'Clabe', datafield: 'clabe', width: 170 },
    {text: 'Tarjeta', datafield: 'tarjeta', width: 170 },
    {text: 'Divisa', datafield: 'descripcion_divisa', width: 170 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];
  constructor(
    private service: AccountCompanyService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private vs: ValidationService,
  ){}

  ngOnInit(): void {
    this.service.loadCombosCE().subscribe(data => {
      this.list_companys_index = data.empresas;
      this.list_banks_index = data.bancos;
      this.list_divisas_index = data.divisas;
      this.load();
    });
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
    this.service.getAccounts(this.getFilter()).subscribe(
    data => {
      this.source.localdata = data;
      this.jqxGridAccountsCompany.updatebounddata();
    });
  }

  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [null],
      bank_id: [null, [Validators.required]],
      company_id: [null, [Validators.required]],
      divisa_id: [null],
      cuenta: ['', [], [Validations.accountCompanyCheckCuenta(this.vs)]],
      clabe: ['', [], [Validations.accountCompanyCheckClabe(this.vs)]],
      tarjeta: ['', [], [Validations.accountCompanyCheckTarjeta(this.vs)]],
      is_active: [true],
    });
  };

  loadCombos(callback: Function) {
    this.service.loadCombosCE().subscribe(data => {
      this.list_companys = data.empresas;
      this.list_banks = data.bancos;
      this.list_divisas = data.divisas;
      callback();
    });
  }

  openCreate(){
    this.buildForm();
    this.loadCombos(() => {
      this.modalRefCE = this.modalService.open(this.modalCE, {size: 'lg', backdrop: false, animation:true});
    });
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridAccountsCompany);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    this.buildForm();
    this.loadCombos(() => {
      this.service.getAccount(seleccionado[0].id).subscribe(data => {
        this.form.patchValue(data);
        this.form.get("company_id")?.disable();
        this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: false, animation:true});
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
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.updateAccount(model.id, model).subscribe(data => {
        alertOk("Cliente modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.createAccount(model).subscribe(data => {
        alertOk("Cliente agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridAccountsCompany.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridAccountsCompany);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.deleteAccount(seleccionado[0].id).subscribe(data => {
          alertOk("Cuenta eliminada correctamente!");
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar la cuenta");
        });
      }
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridAccountsCompany);
    this.seleccionados = seleccionado.length;
  }
}
