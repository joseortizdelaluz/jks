import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';

import { BanksService } from 'src/app/apps/services/banks.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertConfirm, alertError, alertOk, getFormControl, getRowsSelected } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
  @ViewChild('jqxGridBanks', { static: false }) jqxGridBanks: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  public filter: any = {is_active: true};
  public form: FormGroup;
  public seleccionados: number = 0;
  public getFormControl: Function = getFormControl;
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'nombre', type: 'string' },
      { name: 'rfc', type: 'string' },
      { name: 'tamanio_cuenta', type: 'int' },
      { name: 'tamanio_clabe', type: 'int' },
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
    {text: 'Nombre', datafield: 'nombre', width: 250, pinned: true },
    {text: 'Rfc', datafield: 'rfc', width: 170 },
    {text: 'Tamaño cuenta', datafield: 'tamanio_cuenta', width: 170 },
    {text: 'Tamaño clabe', datafield: 'tamanio_clabe', width: 170 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];
  constructor(
    private service: BanksService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService,
  ){}

  ngOnInit(): void {
    this.load();
  }
  private getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter){
      console.log(typeof filter[att]);
      console.log(att + " => "+filter[att]);
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0){
        delete filter[att];
      }
    }
    return filter;
  }
  load(): void{
    this.service.getBanks(this.getFilter()).subscribe(
      data => {
        this.source.localdata = data;
        this.jqxGridBanks.updatebounddata();
      });
  }

  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required], [Validations.checkNameBank(this.validationService)]],
      rfc: ['', [Validators.minLength(12), Validators.maxLength(13), Validations.checkRFC()], [Validations.checkRFCBank(this.validationService)]],
      tamanio_cuenta: [null, ],
      tamanio_clabe: [null, ],
      is_active: [true],
    });
  };

  openCreate(){
    this.buildForm();
    this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: false, animation:true});
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridBanks);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    this.buildForm();
    this.service.getBank(seleccionado[0].id).subscribe(data => {
      this.form.patchValue(data);
      this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: false, animation:true});
    }, error => {
      alertError(error.error.detail|| "No se pudo editar el banco.");
    });
  }

  save(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.updateBank(model.id, model).subscribe(data => {
        alertOk("Cliente modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.createBank(model).subscribe(data => {
        alertOk("Cliente agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridBanks.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridBanks);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.deleteBank(seleccionado[0].id).subscribe(data => {
          alertOk("Banco eliminado correctamente!");
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar el banco.");
        });
      }
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridBanks);
    this.seleccionados = seleccionado.length;
  }
}
