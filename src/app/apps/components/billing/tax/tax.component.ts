import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { TaxsService } from 'src/app/apps/services/taxs.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertConfirm, alertError, alertOk, getFormControl, getRowsSelected, getTasaCuota, getTrasladoRetencion, getTypeTax, presicion } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent implements OnInit {
  @ViewChild('jqxGridTaxs', { static: false }) jqxGridTaxs: jqxGridComponent;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  public filter: any = {is_active: true};
  public form: FormGroup;
  public seleccionados: number = 0;
  public getFormControl: Function = getFormControl;

  public list_taxs: any[] = [];
  public list_tasa_cuota: any[] = [];
  public list_tipos: any[] = [];

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'nombre', type: 'string' },
      { name: 'impuesto', type: 'string' },
      { name: 'tasa_cuota', type: 'int' },
      { name: 'valor', type: 'float' },
      { name: 'tipo', type: 'int' },
      { name: 'descripcion', type: 'int' },
      { name: 'created_at', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  private modalRefCE: any = null;
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 80, pinned: true },
    {text: 'ST', datafield: 'is_active', width: 70, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
                <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
              </div>`;
    }},
    {text: 'Nombre', datafield: 'nombre', width: 250, pinned: true },
    {text: 'Impuesto', datafield: 'impuesto', width: 170 },
    {text: 'Tasa cuota', datafield: 'tasa_cuota', width: 170 },
    {text: 'Tasa', datafield: 'valor', width: 170, cellsrenderer: (row: number, datafield: string, value: number) => {
      return `<div class="text-center align-middle py-2">
      ${isNaN(value) ? '' : presicion(Number(value) * 100) } %
    </div>`;
    } },
    {text: 'Tipo', datafield: 'tipo', width: 170 },
    {text: 'Descripción', datafield: 'descripcion', width: 170 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];
  constructor(
    private service: TaxsService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService,
  ){}

  ngOnInit(): void {
    this.load();
  }

  load(): void{
    this.service.gets(this.filter).subscribe(
      data => {
        this.source.localdata = data;
        this.jqxGridTaxs.updatebounddata();
      });
  }

  public buildForm(): void{
    this.list_taxs = getTypeTax();
    this.list_tasa_cuota = getTasaCuota();
    this.list_tipos = getTrasladoRetencion();
    this.form = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required]],
      impuesto: ['', [Validators.required]],
      tasa_cuota: [null, [Validators.required]],
      tipo: ['', [Validators.required]],
      valor: [null, ],
      descripcion: [null, ],
      is_active: [true],
    });
  };

  openCreate(){
    this.buildForm();
    this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: false, animation:true, size: 'lg'});
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridTaxs);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    this.buildForm();
    this.service.get(seleccionado[0].id).subscribe(data => {
      this.form.patchValue(data);
      this.modalRefCE = this.modalService.open(this.modalCE, {backdrop: false, animation:true});
    }, error => {
      alertError(error.error.detail|| "No se pudo editar el registro.");
    });
  }

  save(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.update(model.id, model).subscribe(data => {
        alertOk("Registro modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }else{
      this.service.create(model).subscribe(data => {
        alertOk("Registro agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridTaxs.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error);
      });
    }
  }

  openView(){}
  openDelete(){
    const seleccionado = getRowsSelected(this.jqxGridTaxs);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.delete(seleccionado[0].id).subscribe(data => {
          alertOk("Registro eliminado correctamente!");
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar el registro.");
        });
      }
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridTaxs);
    this.seleccionados = seleccionado.length;
  }
}
