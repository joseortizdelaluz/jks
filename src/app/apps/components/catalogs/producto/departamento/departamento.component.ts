import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { IDepartamento } from 'src/app/crm/models/producto.model';
import { ProductoDepartamentoService } from 'src/app/crm/services/producto-departamento.service';
import { alertError, alertOk, getRowsSelected } from 'src/app/utils/utils';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
  styleUrls: ['./departamento.component.css']
})

export class DepartamentoComponent implements OnInit {
  @ViewChild('jqxGridDepartamentos', { static: false }) jqxGridDepartamentos: jqxGridComponent;
  @ViewChild("modalProductDeparment", {static: false}) modalProductDeparment: TemplateRef<any>;
  public seleccionados: number = 0;
  public observableArray: any = new jqx.observableArray([], (changed: any): void => {});
  public form: FormGroup;
  public is_active: boolean;
  private modalRefProductDeparment: any = null;
  listaDepartamentos: IDepartamento[] = [];
  private ogoutScreenOptions: NgbModalOptions = {
    backdrop: true,
    ariaLabelledBy: 'modal-basic-title',
  };

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private deparmentService: ProductoDepartamentoService,
  ){
    this.is_active = true;
  }

  getAdapter = (): any => {
    let source: any = {
      localdata: this.observableArray,
      datatype: 'obserableArray',
      datafields: [
        { name: 'id', type: 'int' },
        { name: 'is_active', type: 'bool' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
      ]
    }
    let dataAdapter: any = new jqx.dataAdapter(source);
    return dataAdapter;
  };

  formGroupCreate(){
    this.form = this.formBuilder.group({
      id: [0],
      name: ['', [Validators.required]],
      description: [''],
      is_active: [true]
    });
  }

  public dataAdapter = this.getAdapter();
  columns:any[] = [
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
    {text: 'Nombre', datafield: 'name', width: '35%', pinned: true },
    {text: 'Descripción', datafield: 'description', width: '60%' },
  ]

  ngOnInit(): void {
    this.loadGrid();
  }

  loadGrid(){
    this.deparmentService.lista().subscribe((data)=>{
      this.listaDepartamentos = data;
      this.observableArray.splice(0, this.observableArray.length);
      let temp = this.observableArray;
      for(var i in this.listaDepartamentos){
        temp.push(this.listaDepartamentos[i]);
      }
      this.observableArray = temp
    });
  }

  newEditDepartamento(editar: boolean = false){
    this.formGroupCreate();
    if (typeof editar != undefined && editar){
      const seleccionado = getRowsSelected(this.jqxGridDepartamentos)
      if (seleccionado.length <= 0)
        return alertError("Antes de continuar, seleccione un registro");
      this.form.patchValue(seleccionado[0]);
    }
    this.modalRefProductDeparment = this.modalService.open(this.modalProductDeparment, this.ogoutScreenOptions);
  }

  get nameField(){
    return this.form.get('name');
  }
  
  saveDeparment(event: Event){
    event.preventDefault();
    if (this.form.invalid){
      return this.form.markAllAsTouched();
    }
    this.deparmentService.save(this.form.value).subscribe((respuesta)=>{
      if (typeof respuesta == "boolean" && respuesta){
        const id = this.form.get("id")?.value;
        this.modalRefProductDeparment.close();
        this.loadGrid();
        if ( id != null && parseInt(id) > 0){
          return alertOk("Departamento modificada correctamente");
        }else{
          return alertOk("Registro agregado correctamente");
        }
      }else{
        return alertError(respuesta.desc || "No se llevo a cabo la operación");
      }
    });
  }
  deleteDepartamento(){}
  seleccionarRegistro(event: Event){}



}
