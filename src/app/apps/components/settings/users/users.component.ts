import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UsersService } from 'src/app/apps/services/users.service';
import { User } from 'src/app/page/models/user';
import { generatePassword, getFormControl } from 'src/app/utils/utils';
import { alertConfirm, alertError, alertOk, getRowsSelected } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';
import { ValidationService } from 'src/app/services/validation.service';

declare const $: any;


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild('jqxGridUsuarios', { static: false }) jqxGridUsuarios: jqxGridComponent;
  
  @ViewChild('jqxGridEmpresasDisponibles', {static: false}) jqxGridEmpresasDisponibles: jqxGridComponent;
  @ViewChild('jqxGridEmpresasAsignadas', {static: false}) jqxGridEmpresasAsignadas: jqxGridComponent;
  
  @ViewChild('gridReference', {static: false}) myGrid: jqxGridComponent;

  @ViewChild('jqxGridClientesDisponibles', {static: false}) jqxGridClientesDisponibles: jqxGridComponent;
  @ViewChild('jqxGridClientesAsignadas', {static: false}) jqxGridClientesAsignadas: jqxGridComponent;

  @ViewChild("modalUser", {static: false}) modalUser: TemplateRef<any>;
  public seleccionados: number = 0;
  public users: User[] = [];
  public filter: any = {is_active: ''};
  public type: string = "password";
  errors: any[] = [];
  form: FormGroup;
  getFormControl: Function = getFormControl;
  private modalRefUser: any = null;

  // public ngAfterViewInit():void{

  // }

  // public ngAfterViewInit(): void{
  //   console.log("INit");
  //   console.log(this.myGrid);
  //   this.jqxGridEmpresasAsignadas.createComponent();

  //   this.jqxGridEmpresasAsignadas.updatebounddata();
  //   this.jqxGridClientesAsignadas.updatebounddata();
  // }

  getWidth(): any {
		if (document.body.offsetWidth < 850) {
			return '90%';
		}
		return 850;
	}

  public sourceCompanyDisponibles: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'razon_social', type: 'string' },
    ]
  };
  public sourceCompanyAsignadas: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'razon_social', type: 'string' },
    ]
  };
  public dataAdapterCompanyDisponibles: any = new jqx.dataAdapter(this.sourceCompanyDisponibles);
  public dataAdapterCompanyAsignadas: any = new jqx.dataAdapter(this.sourceCompanyAsignadas);

  public sourceCustomersDisponibles: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'razon_social', type: 'string' },
    ]
  };
  public sourceCustomersAsignadas: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'razon_social', type: 'string' },
    ]
  };
  public dataAdapterCustomerDisponibles: any = new jqx.dataAdapter(this.sourceCustomersDisponibles);
  public dataAdapterCustomerAsignadas: any = new jqx.dataAdapter(this.sourceCustomersAsignadas);
  
  public columnsDragDrop: any[] = [
    {text: 'Razon social', datafield: 'razon_social', width: '90%'},
  ];

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'first_name', type: 'string' },
      { name: 'last_name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'username', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 100, pinned: true },
    {text: 'Estatus', datafield: 'is_active', width: 100, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
                <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
              </div>`;
    }},
    {text: 'Nombre', datafield: 'first_name', width: 300, pinned: true },
    {text: 'Apellidos', datafield: 'last_name', width: 270 },
    {text: 'Email', datafield: 'email', width: 270 },
    {text: 'Nombre de usuario', datafield: 'username', width: 200 },
  ];

  constructor(
    private service: UsersService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService
  ){}

  formBuild(): void{
    this.form = this.formBuilder.group({
      id: [0],
      first_name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.required, Validators.email], [Validations.checkEmail(this.validationService)]],
      username: ['', [Validators.required, Validators.minLength(4)], [Validations.checkUsername(this.validationService)]],
      password: ['', [Validators.required, Validators.minLength(5), Validations.checkPassword('password', 'repassword')]],
      repassword: ['', [Validators.required]],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  getFilter(){
    if (typeof this.filter.is_active == "undefined" || this.filter.is_active == null || this.filter.is_active == '')
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

  loadUsers(): void{
    this.service.getUsers(this.getFilter()).subscribe((data: any) => {
      this.source.localdata = data;
      this.jqxGridUsuarios.updatebounddata();
    }, error => {
      alertError(error,error.detail || "No se ha podido cargar la información");
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridUsuarios);
    this.seleccionados = seleccionado.length;
  }

  saveUser(event: Event, empresas: jqxGridComponent, clientes: jqxGridComponent):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const user = this.form.value;
    user.clientes = (clientes.getrows() || []).map((cliente) => {
      return cliente.id;
    });
    user.empresas = (empresas.getrows() || []).map((empresa) => {
      return empresa.id;
    });
    if (typeof user.id != "undefined" && user.id){
      this.service.updateUser(user.id, user).subscribe(data => {
        alertOk("Usuario modificado correctamente.");
        this.loadUsers();
        this.modalRefUser.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.createUser(user).subscribe(data => {
        alertOk("Usuario agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridUsuarios.updatebounddata();
        this.modalRefUser.close();
      }, error => {
        alertError(error);
      });
    }
  }

  createUser(): void{
    this.formBuild();
    this.service.loadCombosCe().subscribe((data: any) => {
      this.sourceCompanyDisponibles.localdata = data.empresas;
      this.sourceCustomersDisponibles.localdata = data.clientes;
      this.modalRefUser = this.modalService.open(this.modalUser, {size:'lg', backdrop: true, animation:true,});
    });
  }

  editUser(): void{
    const seleccionado = getRowsSelected(this.jqxGridUsuarios);
    if (seleccionado.length <= 0)
      return alertError("Seleccione un registro");
    this.formBuild();
    this.service.loadCombosCe().subscribe((data: any) => {
      this.service.getUser(seleccionado[0].id).subscribe(user => {

        const clientes = data.clientes || [];
        const empresas = data.empresas || [];

        let clientes_asignados = [];
        for(var i in clientes){
          for(var j in user.clientes){
            if(clientes[i].id == user.clientes[Number(j)]){
              clientes_asignados.push(clientes[i].id);
              break;
            }
          }
        }
        let asingados = [];
        let disponibles = [];
        for(var i in clientes){
          if(clientes_asignados.indexOf(clientes[i].id) >= 0){
            asingados.push(clientes[i]);
          }else{
            disponibles.push(clientes[i]);
          }
        }

        this.sourceCustomersDisponibles.localdata = disponibles;
        this.sourceCustomersAsignadas.localdata = asingados;

        let empresas_asignadas = [];
        for(var i in empresas){
          for(var j in user.empresas){
            if (empresas[i].id == user.empresas[Number(j)]){
              empresas_asignadas.push(empresas[i].id);
              break;
            }
          }
        }
        asingados = [];
        disponibles = [];
        for(var i in empresas){
          if(empresas_asignadas.indexOf(empresas[i].id) >= 0){
            asingados.push(empresas[i]);
          }else{
            disponibles.push(empresas[i]);
          }
        }
        this.sourceCompanyDisponibles.localdata = disponibles;
        this.sourceCompanyAsignadas.localdata = asingados;
        user.password = "changepassword";
        user.repassword = "changepassword";

        this.form.patchValue(user);
        this.modalRefUser = this.modalService.open(this.modalUser, {size:'lg', backdrop: false, animation:true,});
      }, error => {
        alertError(error.detail || "No se encontro el usuario");
      });
    });
  }

  viewUser(): void{}

  deleteUser(): void{
    const seleccionado = getRowsSelected(this.jqxGridUsuarios);
    if (seleccionado.length <= 0)
      return alertError("Seleccione un registro");
      alertConfirm(
        `Realmente desea eliminar el usuario ${seleccionado[0].first_name} ${seleccionado[0].last_name}`, 
        (result: any) => {
          if (result.isConfirmed){
            this.service.deleteUser(seleccionado[0].id).subscribe(data => {
              alertOk("Usuario eliminado correctamente");
              this.loadUsers();
            }, error => {
              alertError(error.error.detail || "No se ha podido eliminar el usuario");
            });
          }
      });
  }

  generatePassword(){
    const password = generatePassword();
    this.form.controls["password"].setValue(password);
    this.form.controls["repassword"].setValue(password);
  }

  viewPassword(){
    if (this.type == "password"){
      this.type = "text";
    }else{
      this.type = "password";
    }
  }

  agregarRegistro(disponibles: jqxGridComponent, asignados: jqxGridComponent){
    var sels = getRowsSelected(disponibles);
    if(sels.length <= 0) return;
    for(var i in sels){
      console.log("=====================================================");
      console.log(sels[i]);
      
      var row = JSON.parse(JSON.stringify(sels[i]));
      disponibles.deleterow(row.uid);
      delete row.uid;
      delete row.boundindex;
      delete row.uniqueid;
      delete row.visibleindex;
      asignados.addrow(null, row);
    }
    asignados.endupdate();
  }

  removerRegistro(disponibles: jqxGridComponent, asignados: jqxGridComponent){
    var sels = getRowsSelected(asignados);
    if(sels.length <= 0) return;
    for(var i in sels){
      var row = JSON.parse(JSON.stringify(sels[i]));
      asignados.deleterow(row.uid);
      delete row.uid;
      delete row.boundindex;
      delete row.uniqueid;
      delete row.visibleindex;
      disponibles.addrow(null, row);
    }
    disponibles.endupdate();
  }
}
