import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { IBank } from 'src/app/apps/models/bank.model';
import { CompanySelect } from 'src/app/apps/models/company.model';
import { IDivisa } from 'src/app/apps/models/generic.models';
import { AccountCustomerService } from 'src/app/apps/services/accounts-customer.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertError, alertOk, getFormControl, getRowsSelected, alertConfirm } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-accounts-customer',
  templateUrl: './accounts-customer.component.html',
  styleUrls: ['./accounts-customer.component.css']
})
export class AccountsCustomerComponent implements OnInit {
  @ViewChild('jqxGridAccountsCustomer', { static: false }) jqxGridAccountsCustomer: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  public filter: any = {is_active: true};
  public form: FormGroup;
  public seleccionados: number = 0;
  public getFormControl: Function = getFormControl;
  public list_customer_index: CompanySelect[] = [];
  public list_banks_index: IBank[] = [];
  public list_divisas_index: IDivisa[] = [];
  public list_customers: CompanySelect[] = [];
  public list_banks: IBank[] = [];
  public list_divisas: IDivisa[] = [];
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'bank', type: 'string' },
      { name: 'customer', type: 'string' },
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
    {text: 'Cliente', datafield: 'customer', width: 200 },
    {text: 'Cuenta', datafield: 'cuenta', width: 170 },
    {text: 'Clabe', datafield: 'clabe', width: 170 },
    {text: 'Tarjeta', datafield: 'tarjeta', width: 170 },
    {text: 'Divisa', datafield: 'descripcion_divisa', width: 170 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];
  constructor(
    private service: AccountCustomerService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private vs: ValidationService,
  ){}

  ngOnInit(): void {
    this.service.loadCombosCE().subscribe(data => {
      this.list_customer_index = data.clientes;
      this.list_banks_index = data.bancos;
      this.list_divisas_index = data.divisas;
      this.load();
    });
  }

  load(): void{
    this.service.getAccounts(this.filter).subscribe(
    data => {
      this.source.localdata = data;
      this.jqxGridAccountsCustomer.updatebounddata();
    });
  }

  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [null],
      bank_id: [null, [Validators.required]],
      customer_id: [null, [Validators.required]],
      divisa_id: [null],
      cuenta: ['', [], [Validations.accountCustomerCheckCuenta(this.vs)]],
      clabe: ['', [], [Validations.accountCustomerCheckClabe(this.vs)]],
      tarjeta: ['', [], [Validations.accountCustomerCheckTarjeta(this.vs)]],
      is_active: [true],
    });
  };

  loadCombos(callback: Function) {
    this.service.loadCombosCE().subscribe(data => {
      this.list_customers = data.clientes;
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
    const seleccionado = getRowsSelected(this.jqxGridAccountsCustomer);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    this.buildForm();
    this.loadCombos(() => {
      this.service.getAccount(seleccionado[0].id).subscribe(data => {
        this.form.patchValue(data);
        this.form.get("customer_id")?.disable();
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
        alertOk("Cuenta modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.createAccount(model).subscribe(data => {
        alertOk("Cuenta agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridAccountsCustomer.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridAccountsCustomer);
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
    const seleccionado = getRowsSelected(this.jqxGridAccountsCustomer);
    this.seleccionados = seleccionado.length;
  }
}
