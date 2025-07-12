import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { ICategoria } from 'src/app/crm/models/producto.model';
import { ProductoCategoriaService } from 'src/app/crm/services/producto-categoria.service';
import { alertConfirm, alertError, alertOk, getRowsSelected } from 'src/app/utils/utils';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})

export class CategoriaProductoComponent implements OnInit {
  @ViewChild('jqxGridCategoria', { static: false }) jqxGridCategoria: jqxGridComponent;
  @ViewChild("modalCategoria", {static: false}) modalCategoria: TemplateRef<any>;
  public seleccionados: number = 0;
  public observableArray: any = new jqx.observableArray([], (changed: any): void => {});
  public form: FormGroup;
  public is_active: boolean;
  private modalRefCategoria: any = null;
  listaCategorias: ICategoria[] = [];

  private ogoutScreenOptions: NgbModalOptions = {
    backdrop: true,
    ariaLabelledBy: 'modal-basic-title',
  };

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private categoriaService: ProductoCategoriaService
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
    this.categoriaService.lista().subscribe((data)=>{
      this.listaCategorias = data;
      this.observableArray.splice(0, this.observableArray.length);
      let temp = this.observableArray;
      for(var i in this.listaCategorias){
        temp.push(this.listaCategorias[i]);
      }
      this.observableArray = temp
    })
  }

  newEditCategoria(editar: boolean = false){
    this.formGroupCreate();
    if (typeof editar != undefined && editar){
      const seleccionado = getRowsSelected(this.jqxGridCategoria)
      if (seleccionado.length <= 0)
        return alertError("Antes de continuar, seleccione un registro");
      this.form.patchValue(seleccionado[0]);
    }
    this.modalRefCategoria = this.modalService.open(this.modalCategoria, this.ogoutScreenOptions);
  }

  get nameField(){
    return this.form.get('name');
  }

  saveCategoria(event: Event){
    event.preventDefault();
    if (this.form.invalid){
      return this.form.markAllAsTouched();
    }
    
    this.categoriaService.save(this.form.value).subscribe((respuesta)=>{
      if (typeof respuesta == "boolean" && respuesta){
        const id = this.form.get("id")?.value;
        this.modalRefCategoria.close();
        this.loadGrid();
        if ( id != null && parseInt(id) > 0){
          return alertOk("Categoria modificada correctamente");
        }else{
          return alertOk("Registro agregado correctamente");
        }
      }else{
        return alertError(respuesta.desc || "No se llevo a cabo la operación");
      }
    })
  }
  
  deleteCategoria(){
    const seleccionado = getRowsSelected(this.jqxGridCategoria);
    if (seleccionado.length <= 0)
      return alertError("Seleccione un registro antes de continuar");
    alertConfirm(`¿Realmente desea eliminar el registro seleccionado?`, (result: any)=>{
      if(result.isConfirmed){
        this.categoriaService.delete(seleccionado[0].id).subscribe(resp => {
          if (typeof resp == "boolean" && resp){
            this.loadGrid();
            return alertOk("Registro eliminado correctamente");
          }
          return alertError(resp || "No se ha podido eliminar el registro");
        });
      }
    })
  }
  
  seleccionarRegistro(event: Event){}
}

