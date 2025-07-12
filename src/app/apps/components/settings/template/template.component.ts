import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { TemplatesService } from 'src/app/apps/services/templates.service';
import { alertError, alertOk, getRowsSelected } from 'src/app/utils/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  @ViewChild('jqxGridTemplates', { static: false }) jqxGridTemplates: jqxGridComponent;
  @ViewChild("modalTemplate", {static: false}) modalTemplate: TemplateRef<any>;
  public seleccionados: number = 0;
  public filter: any = {is_active: ''};
  public formTemplate: FormGroup;

  private modalRefTemplate: any = null;
  constructor(
    private service: TemplatesService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
  ){}

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'type', type: 'string' },
      { name: 'subtype', type: 'string' },
      { name: 'editable', type: 'bool' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  public columns: any[] = [
    {text: 'Id', datafield: 'id', width: 100, pinned: true },
    {text: 'ST', datafield: 'is_active', width: 30, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
        <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
        </div>`;
    }},
    {text: 'Editable', datafield: 'editable', width: 60, pinned: true, cellsrenderer: (row: number, datafield: string, value: boolean) => {
      let class_ = "text-danger";
      if (value==true){
        class_ = "text-success";
      }
      return `<div class="text-center align-middle py-2">
        <i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i>
        </div>`;
    }},
    {text: 'Nombre', datafield: 'name', width: 300, pinned: true },
    {text: 'Descripción', datafield: 'description', width: 320 },
    {text: 'Tipo', datafield: 'type', width: 270 },
    {text: 'SubTipo', datafield: 'subtype', width: 200 },
  ];

  ngOnInit(): void {
    this.load();
  }

  getFilter(){
    const filter = this.filter;
    return filter;
  }

  load(){
    this.service.gets(this.getFilter()).subscribe(data => {
      this.source.localdata = data;
      this.jqxGridTemplates.updatebounddata();
    },error =>{

    });
  }

  create(){
    window.open('/plantillas/nueva');
  }

  edit(){
    const selected = getRowsSelected(this.jqxGridTemplates);
    if (selected.length <= 0){
      return alertError("Seleccione una registro antes de continuar");
    }
    if (!selected[0].editable){
      return alertError("Usted no puede editar estar plantilla");
    }
    const url = this.router.serializeUrl(this.router.createUrlTree([`/plantillas/editar/${selected[0].id}`], { queryParams: { id: selected[0].id} }));
    window.open(url, '_blank');
  }

  delete(){
    const selected = getRowsSelected(this.jqxGridTemplates);
    if (selected.length <= 0){
      return alertError("Seleccione una registro antes de continuar");
    }
    if (!selected[0].editable){
      return alertError("Usted no puede eliminar estar plantilla");
    }
    this.service.delete(selected[0].id).subscribe(resp => {
      alertOk("Se elimino correctamente la plantilla");
      this.load();
    }, error => {
      alertError(error.error.detail || "No se ha podido eliminar la plantilla");
    });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridTemplates);
    this.seleccionados = seleccionado.length;
  }
  
  copiar(){
    const selected: any = getRowsSelected(this.jqxGridTemplates);
    if (selected.length <= 0) return alertError("Seleccione un registro antes de continuar.");

    this.service.copy(selected[0].id).subscribe(flag => {
      alertOk("Plantilla copiada correctamente!");
      this.load();
    }, error => {
      alertError(error.error.detail || "Error al copiar la plantilla");
    });
  }
}
