import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { RpatronalesService } from 'src/app/apps/services/rpatronales.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertConfirm, alertError, alertOk, getFormControl, getRowsSelected, getFilter, dialog } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';
@Component({
  selector: 'app-rpatronal',
  templateUrl: './rpatronal.component.html',
  styleUrls: ['./rpatronal.component.css']
})
export class RpatronalComponent implements OnInit {
  public filter: any = {is_active: true};
  private getFilter: Function = getFilter;
  @ViewChild('jqxGridRP', { static: false }) jqxGridRP: jqxGridComponent;
  public seleccionados: number = 0;
  public form: FormGroup;
  public list_ce_estados: any = [];
  public list_ce_companys: any = [];
  public list_companys_root: any = [];
  public list_ce_areas_geograficas: any[] = [];
  public list_ce_clases_riesgo: any[] = [];
  public getFormControl: Function = getFormControl;
  @ViewChild("modalCE", {static: false}) modalCE: TemplateRef<any>;
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'razon_social', type: 'string' },
      { name: 'is_active', type: 'bool' },
      { name: 'numero_registro', type: 'string' },
      { name: 'alias', type: 'string' },
      { name: 'fecha_expedicion', type: 'string' },
      { name: 'clase_riesgo', type: 'string' },
      { name: 'area_geografica', type: 'string' },
      { name: 'delegacion', type: 'string' },
      { name: 'subdelegacion', type: 'string' },
      { name: 'estado', type: 'string' },
    ]
  };
  public dataAdapter: any = new jqx.dataAdapter(this.source);
  private modalRefCE: any = null;
  private modalCSDSettingsRef: any = null;
  
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 80, pinned: true },
    {text: 'Estatus', datafield: 'is_active', width: 50, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
                <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
              </div>`;
    }},
    {text: 'Número Registro', datafield: 'numero_registro', width: 150, pinned: true },
    {text: 'Empresa', datafield: 'razon_social', width: 300 },
    {text: 'Estado', datafield: 'estado', width: 170 },
    {text: 'Delegación', datafield: 'delegacion', width: 90 },
    {text: 'Subdelegación', datafield: 'subdelegacion', width: 230 },
    {text: 'Clase', datafield: 'clase_riesgo', width: 70 },
    {text: 'Area geografica', datafield: 'area_geografica', width: 100 },
    {text: 'Fecha expedición', datafield: 'fecha_expedicion', width: 200 },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private service: RpatronalesService,
    private modalService: NgbModal,
    private validationService: ValidationService,
  ){}
  ngOnInit(): void {

    this.service.loadCombosRoot().subscribe(data => {
      this.list_companys_root = data.empresas;
    });
    this.load();
  }

  load(): void{
    if(typeof this.filter.is_active != "undefined"){
      this.filter.is_active = this.filter.is_active == '1';
    }
    this.service.list(this.getFilter(this.filter)).subscribe(
      data => {
        this.source.localdata = data;
        this.jqxGridRP.updatebounddata();
      });
  }

  selectedCompanyRoot(event: any){
    this.filter.empresa_id = event.id;
    
  }

  openCreate(){
    this.buildForm();
    this.loadCombosCE(() => {
      this.modalRefCE = this.modalService.open(this.modalCE, {size:'lg', backdrop: false, animation:true});
    });
  }

  loadCombosRoot(){
    this.service.loadCombosRoot().subscribe(data => {
      this.list_companys_root = data.empresas;
    });
  }

  loadCombosCE(callback: Function){
    this.service.loadCombosCE().subscribe(data => {
      this.list_ce_companys = data.empresas;
      this.list_ce_estados = data.estados;
      this.list_ce_areas_geograficas = data.areas;
      this.list_ce_clases_riesgo = data.clases;
      callback();
    });
  }

  private buildForm(){
    this.form = this.formBuilder.group({
      id: [null,],
      company_id: [null, [Validators.required]],
      numero_registro: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(11)], [Validations.checkRP(this.validationService)]],
      alias: [''],
      delegacion: [''],
      subdelegacion: [''],
      estado_id: [null],
      prima_riesgo_expedicion: [],
      prima_riesgo_actual: [],
      fecha_expedicion: [],
      clase_id: [],
      area_geografica_id: [],
      is_active: [true],
      // % Obrero
      // cuota_fija: [0],
      // % Patrón
    });
  }
  openEdit(){
    const seleccionado = getRowsSelected(this.jqxGridRP);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");
    
    this.buildForm();
    this.loadCombosCE(() => {
      this.service.get(seleccionado[0].id).subscribe(data =>{
        this.form.patchValue(data);
        this.modalRefCE = this.modalService.open(this.modalCE, {size:'lg', backdrop: false, animation:true});
      });
    });
  }
  openView(){}
  openDelete(){}

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridRP);
    this.seleccionados = seleccionado.length;
  }

  save(event:Event){
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }

    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.update(model).subscribe(data => {
        dialog("Registro modificado correctamente.", 'success', 2500);
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error.error.detail);
      });
    }else{
      this.service.create(model).subscribe(data => {
        dialog("Registro agregado correctamente.", 'success', 2500);
        this.modalRefCE.close();
        this.load();
      }, error => {
        alertError(error.error.detail);
      });
    }

  }

}
