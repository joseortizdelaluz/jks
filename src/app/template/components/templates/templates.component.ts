import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateNewService } from '../../services/template-new.service';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { alertConfirm, alertError, alertOk, getFormControl, getRowsSelected } from 'src/app/utils/utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: [
    './templates.component.css',
  ]
})

export class TemplatesComponent implements OnInit{
  @ViewChild('jqxGridVars', { static: false }) jqxGridVars: jqxGridComponent;
  @ViewChild("modalSave", {static: false}) modalSave: TemplateRef<any>;

  public getFormControl: Function = getFormControl;
  private modalRefSave: any = null;

  private el: ElementRef;
  public formSave: FormGroup;
  public template: any = null;
  
  public types: any[] = [
    {id: 1, label: "Ingreso, Egreso o Traslado"},
    {id: 3, label: "Pago"},
    {id: 4, label: "Cotización"},
  ];


  constructor(
    private service: TemplateNewService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ){}

  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'number' },
      { name: 'example', type: 'string' },
      { name: 'field', type: 'string' },
      { name: 'label', type: 'string' },
      { name: 'modelo', type: 'string' },
      { name: 'setting', type: 'array' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  public columns: any[] = [
    { text: 'CAMPOS', datafield: 'label', width: '100%' },
  ];
  
  returnProperties(element: any): void{
    let vars = this.source.localdata;
    vars.push(JSON.parse(JSON.stringify(element.property)));
    this.source.localdata = vars;
    this.jqxGridVars.updatebounddata();
  }
  
  ngOnInit(): void {
    this.loadVars((vars: any[] = []) => {
      const params = this.activatedRoute.snapshot.queryParams;
      const id = params["id"];
      if (id != null && window.location.pathname.indexOf(id) >= 0){
        this.service.get(parseInt(id)).subscribe((template: any) => {
          this.createFormSave();
          var ya_estan = [];
          for(var i in template.items){
            if(['PROPIEDAD', 'DESGLOSE'].indexOf( template.items[i]._TYPE) >= 0){
              for(var j in vars){
                if(template.items[i].field == vars[j].field){
                  template.items[i].property = vars[j] || {};
                  break;
                }
              }
              ya_estan.push(template.items[i].field);
            }
          }
          var vars_not_used = [];
          for(var i in vars){
            if(ya_estan.indexOf(vars[i].field) < 0){
              vars_not_used.push(vars[i]);
            }
          }
          this.source.localdata = vars_not_used;
          this.jqxGridVars.updatebounddata();
          this.template = $("#dd_document_area").designer(template, this);
          this.formSave.patchValue(template);
          this.formSave.controls["type"].setValue(template.type);
        }, error => {
          alertConfirm(`${error.error.detail || "No se ha localizado la plantilla"}. ¿Desea crear una nueva?`, (result: any) => {
            if (result.isConfirmed){
              window.location.href = "/plantillas/nueva";
            }
          });
        });
      }else{
        this.source.localdata = vars;
        this.jqxGridVars.updatebounddata();
        this.template = $('#dd_document_area').designer({}, this);
      }
    });
  }

  loadVars(callback: Function){
    this.service.getVars().subscribe(data => {
      callback(data);
    }, error => {});
  }

  seleccionarRegistro(event: any){
    const selected: any = getRowsSelected(this.jqxGridVars);

    if (selected.length <= 0) return;
    var object: any = {};

    const element = selected.pop();
    let vars = this.source.localdata;

    for(var index in vars){
      if(element.field == vars[index].field){
        object = JSON.parse(JSON.stringify(vars.splice(index, 1)));
        break;
      }
    }

    if(object.length > 0){
      object = object.pop() || selected;
      this.source.localdata = vars;
      this.jqxGridVars.updatebounddata();
      this.template.add(object);
    }
  }

  addLabel(){
    if (this.template != null){
      this.template.addLabel();
    }
  }

  addLine() {
    if (this.template != null){
      this.template.addLine();
    }
  }

  addRectangle() {
    if (this.template != null){
      this.template.addRectangle();
    }
  }

  save(){
    if (this.formSave.invalid){
      return this.formSave.markAllAsTouched();
    }
    const current: any = this.template.getTemplate();
    current.name = this.formSave.value.name;
    current.description = this.formSave.value.description;
    current.type = this.formSave.value.type;
    current.subtype = this.formSave.value.subtype;
    const final = this.clearTemplate(current);
    this.service.save(final).subscribe((data: any) => {
      if (typeof final.id != "undefined" && final.id > 0){
        alertOk("La plantilla se ha modificado correctamente");
      }else{
        alertOk("La plantilla fue creada correctamente");
        this.template.setProperty({
          id: data.id,
          name: data.name,
          description: data.description,
          type: data.type,
        });
      }
      this.modalRefSave.close();
    });
  }

  title: string = "";
  createFormSave(){
    this.formSave = this.formBuilder.group({
      id: [0],
      name: [null, [Validators.required]],
      description: [null],
      type: [null, [Validators.required]],
      subtype: [null],
      is_active: [true],
      margin: [null],
      backgroud: [null],
    });
  }

  openSave(){
    const aux = this.template.getTemplate();
    if(typeof aux.items == "undefined" || aux.items.length <= 0){
      return alertError("No se han agregado elementos a la plantilla aún");
    }
    this.title = "Guardar nueva plantilla";
    this.modalRefSave = this.modalService.open(this.modalSave, {centered: true, backdrop: false, animation:true});
  }

  clearTemplate(template: any = {}){
    var atemplate: any = {
      size: template.SIZE,
      height: template.height,
      width: template.width,
      margin: template.margin,
      name: template.name || null,
      description: template.description || null,
      is_active: template.is_active || true,
      type: template.type,
    };
    if(template.id != undefined && template.id > 0){//Estamos editando la pantilla
      atemplate.id = template.id;
    }
    atemplate.items = [];
    const pcp = [
      'x',
      'y',
      'width',
      'height',
      'fontFamily',
      'fontSize',
      'textAlign',
      'bold',
      'style',
      'decoration',
      'color',
      'background',
      'borderTopStyle',
      'borderTopWidth',
      'borderTopColor',
      'borderRightStyle',
      'borderRightWidth',
      'borderRightColor',
      'borderBottomStyle',
      'borderBottomWidth',
      'borderBottomColor',
      'borderLeftStyle',
      'borderLeftWidth',
      'borderLeftColor',

      'label',
      'field',
      'example',
      'theads', //Solo para el desglose de la factura
      '_TYPE',
    ];
    for(var i in template.items){
      var item: any = {};
      for(var j in pcp){
        if(typeof template.items[i][pcp[j]] != "undefined" && typeof template.items[i][pcp[j]] != "function"){
          item[pcp[j]] = template.items[i][pcp[j]];
        }
      }
      if(Object.keys(item).length > 0){
        atemplate.items.push(item);
      }
    }
    return atemplate;
  }
}
