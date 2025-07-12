import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { Branch } from 'src/app/apps/models/branch.model';
import { IColonia, IEstado, IMunicipio, IPais, IRegimen, IUsoCFDI } from 'src/app/apps/models/generic.models';
import { ISession } from 'src/app/apps/models/user';
import { BranchsCompanyService } from 'src/app/apps/services/branchs-company.service';
import { CompanysService } from 'src/app/apps/services/companys.service';
import { GeneralService } from 'src/app/apps/services/general.service';
import { ValidationService } from 'src/app/services/validation.service';
import { alertConfirm, alertError, alertOk, getFormControl, getRowsSelected } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';

@Component({
  selector: 'app-companys',
  templateUrl: './companys.component.html',
  styleUrls: ['./companys.component.css'],
  providers: [

  ]
})

export class CompanysComponent implements OnInit {
  @ViewChild('jqxGridCompanys', { static: false }) jqxGridCompanys: jqxGridComponent;
  @ViewChild("modalCompany", {static: false}) modalCompany: TemplateRef<any>;
  @ViewChild("modelCSDSettings", {static: false}) modelCSDSettings: TemplateRef<any>;
  @ViewChild('fileLogo') fileLogo: ElementRef<HTMLElement>;
  public files: any [] = [];
  public branch: Branch;
  public formCsd: FormGroup;
  
  public filter: any = {is_active: true};
  public form: FormGroup;
  public getFormControl: Function = getFormControl;
  public seleccionados: number = 0;
  public searching = false;
	public searchFailed = false;
  public list_regimenes: IRegimen[] = [];
  public list_usos_cfdi: IUsoCFDI[] = [];
  public list_paises: IPais[] = [];
  public list_estados: IEstado[] = [];
  public list_municipios: IMunicipio[] = [];
  public session: ISession = {};
  public source: any = {
    localdata: [],
    datatype: 'array',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'branch_id', type: 'int' },
      { name: 'is_active', type: 'bool' },
      { name: 'razon_social', type: 'string' },
      { name: 'rfc', type: 'string' },
      { name: 'descripcion_regimen', type: 'string' },
      { name: 'descripcion_estado', type: 'string' },
      { name: 'cp', type: 'string' },
      { name: 'telefono', type: 'string' },
      { name: 'created_at', type: 'string' },
      { name: 'b_csd_configurado', type: 'bool' },
      { name: 'fecha_inicio_csd', type: 'string' },
      { name: 'fecha_fin_csd', type: 'string' },
    ]
  };
  dataAdapter: any = new jqx.dataAdapter(this.source);
  private modalRefCE: any = null;
  private modalCSDSettingsRef: any = null;
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
    { text: 'Csd', datafield: 'b_csd_configurado', pinned:true, width: 60, cellsrenderer: function(row: number, datafield: string, value: boolean, defaulthtml: any, columnproperties: any, datarow: any){
      var class_ = "";
      if(value == false){
        class_ = "text-warning";
      }else{
        class_ = "text-success";
        const inicio = new Date(datarow.fecha_inicio_csd);
        const fin = new Date(datarow.fecha_fin_csd);
        const now = new Date();
        if (fin <= now){
          class_ = "text-danger";
        }else if(fin < now){
          const days = Math.round((now.getDate() - fin.getDate()) / (1000 * 60 * 60 * 24));
          if (days < 15){
            class_ = "text-warning";
          }
        }
      }
      return `<div style="text-align: center;margin-top:6px;"><i class="fas fa-circle text-center ${class_}" style="font-size:1rem;"></i></div>`;
    }},
    { text: 'Validez CSD', datafield: 'fecha_inicio_csd', pinned:true, width: 180, cellsrenderer: function(row: number, datafield: string, value: boolean, defaulthtml: any, columnproperties: any, datarow: any){
        var i = '<div style="text-align: left;margin-left:2px;"><strong>Inicio: </strong>' + (datarow.fecha_inicio_csd || '') +'</div><div style="text-align: left;margin-left:2px;"><strong>Fin: </strong> '+(datarow.fecha_fin_csd || '')+'';
        return '<div style="text-align: center;">'+i+'</div>';
    }},
    {text: 'Nombre/Razón social', datafield: 'razon_social', width: 200, pinned: true },
    {text: 'Rfc', datafield: 'rfc', width: 150 },
    {text: 'Estado', datafield: 'descripcion_estado', width: 170 },
    {text: 'Cp', datafield: 'cp', width: 90 },
    {text: 'Régimen', datafield: 'descripcion_regimen', width: 270 },
    {text: 'Telefono', datafield: 'telefono', width: 200 },
    {text: 'Fecha creacion', datafield: 'created_at', width: 200 },
  ];

  /**
   * Funcion para crear el formulario
   * de alta y edicion de una empresa.
   * @param callback 
   */
  public buildForm(): void{
    this.form = this.formBuilder.group({
      id: [''],
      razon_social: ['', [Validators.required], [Validations.checkRazonSocialCompany(this.validationService)]],
      rfc: ['', [Validators.minLength(12), Validators.maxLength(13), Validations.checkRFC()], [Validations.checkRFCCompany(this.validationService)]],
      regimen_id: [null],
      serie: [null],

      //Dirección
      calle: [''],
      num_ext: [''],
      num_int: [''],
      colonia: [''],
      referencia: [''],
      municipio_id: [null],
      estado_id: [null],
      pais_id: [null],
      cp: ['', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]\d*$/) ]],
      
      // Otros datos
      telefono: [''],
      is_active: [true],

      logo_b64: [''],
      logo_ext: [''],
      name_logo: [''],
    });
  };

  constructor(
    private service: CompanysService,
    private serviceBranch: BranchsCompanyService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private validationService: ValidationService,
    private generalService: GeneralService,
  ){}

  ngOnInit(): void {
    const s = localStorage.getItem("session");
    try {
      this.session = JSON.parse(s!);
      if (this.session.is_superuser){
        this.source.datafields.push({ name: 'staff', type: 'string' });
        this.columns.push({text: 'Staff', datafield: 'staff', width: 200,  });
      }

    } catch (error) {}
    
    this.load();
  }

  getFilter(){
    const filter = JSON.parse(JSON.stringify(this.filter));
    for(var att in filter){
      if(typeof filter[att] == "undefined" || typeof filter[att] == "object" || filter[att] == null || String(filter[att]).length <= 0){
        delete filter[att];
      }
    }
    return filter;
  }

  load(): void{
    if(typeof this.filter.is_active != "undefined"){
      this.filter.is_active = this.filter.is_active == '1';
    }
    this.service.getCompanys(this.getFilter()).subscribe(
      data => {
        this.source.localdata = data;
        this.jqxGridCompanys.updatebounddata();
      });
  }

  seleccionarRegistro(event: Event){
    const seleccionado = getRowsSelected(this.jqxGridCompanys);
    this.seleccionados = seleccionado.length;
  }

  save(event: Event):void{
    event.preventDefault();
    if(this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const model = this.form.value;
    if (typeof model.id != "undefined" && model.id){
      this.service.updateCompany(model.id, model).subscribe(data => {
        alertOk("Cliente modificado correctamente.");
        this.load();
        this.modalRefCE.close();
      }, error => {
        alertError(error.error.detail);
      });
    }else{
      this.service.createCompany(model).subscribe(data => {
        alertOk("Cliente agregado correctamente");
        this.source.localdata.unshift(data);
        this.jqxGridCompanys.updatebounddata();
        this.modalRefCE.close();
      }, error => {
        alertError(error.error.detail);
      });
    }
  }

  loadCombos(callback: any){
    this.service.loadCombosCE().subscribe(data => {
      this.list_regimenes = data.regimenes;
      this.list_usos_cfdi = data.usos_cfdi;
      this.list_paises = data.paises;
      this.list_estados = data.estados;
      callback();
    });
  }

  loadEstados(event: IPais, callback: any=undefined){
    this.generalService.estados(event.clave, event.id).subscribe(data => {
      this.list_estados = data;
      if (typeof callback == "function"){
        callback();
      }
    });
  }

  loadMunicipios(event: IEstado, callback: any=undefined){
    this.generalService.municipios(event.clave!, event.id).subscribe(data => {
      this.list_municipios = data;

      if (typeof callback == "function"){
        callback();
      }
    });
  }
  buscarCp: OperatorFunction<string, readonly IColonia[]> = (text$: Observable<string>) => text$.pipe(
    filter(res => {
      return res !== null && res.length >= 3
    }),
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => (this.searching = true)),
    switchMap((term) =>
      this.generalService.findCp(term).pipe(
        tap(() => this.searchFailed = false),
        catchError(() => {
          this.searchFailed = true;
          return of([]);
        })
      )
    ),
    tap(() => (this.searching = false)),
  );

  resultFormatter(value: any) {
    return value.cp;
  }

  inputFormatter(value: any){
    if (value.cp)
      return value.cp;
    return value;
  }

  openCreate(){
    this.clearForm();
    this.buildForm();
    this.loadCombos(() => {
      for(var i in this.list_paises){
        if (this.list_paises[i].clave == "MEX"){
          this.form.controls["pais_id"].setValue(this.list_paises[i].id);
          break;
        }
      }
      this.modalRefCE = this.modalService.open(this.modalCompany, {size:'lg', backdrop: false, animation:true});
    });
  }

  selectedCP(result: any){
    this.form.controls['colonia'].setValue(result.asenta);
    this.form.controls['cp'].setValue(result.cp);

    setTimeout(() => {
      const value = JSON.parse(JSON.stringify(this.form.controls["cp"].value)); 
      this.form.controls['cp'].setValue("");
      this.form.controls['cp'].setValue(result.cp);
    }, 450);

    // Seleccionamos el estado del CP.
    const clave_numerica_estado = result.estado,
    clave_numerica_municipio = result.municipio;
    let pais = undefined; 
    for(var i in this.list_paises){
      if (this.list_paises[i].clave == "MEX"){
        pais=this.list_paises[i];
        break;
      }
    }
    if (typeof pais != "undefined"){
      this.loadEstados(pais, () => {
        let estado = undefined;
        for(var i in this.list_estados){
          if (this.list_estados[i].clave_numerica == clave_numerica_estado){
            estado = this.list_estados[i];
            this.form.controls["estado_id"].setValue(this.list_estados[i].id);
            break;
          }
        }
        if(typeof estado != "undefined"){
          this.loadMunicipios(estado, () => {
            for(var i in this.list_municipios){
              if(this.list_municipios[i].clave == clave_numerica_municipio){
                this.form.controls["municipio_id"].setValue(this.list_municipios[i].id);
                break;
              }
            }
          });
        }
      });
    }
  }

  private clearForm(){
    this.cardImageBase64 = "";
  }

  openEdit(): void{
    const seleccionado = getRowsSelected(this.jqxGridCompanys);
    if(seleccionado.length <= 0)
      return alertError("Selecciona un registro a editar");

    this.clearForm();
    this.buildForm();
    this.loadCombos(() => {
      this.service.getCompany(seleccionado[0].id).subscribe(data => {
        this.form.patchValue(data);
        if (typeof data.logo_b64 != "undefined" && data.logo_b64 != null && String(data.logo_b64).trim().length > 0){
          this.cardImageBase64 = data.logo_b64;
          this.form.controls["name_logo"].setValue(`${data.id}.${data.logo_ext}`);
        }
        let pais = undefined; 
        for(var i in this.list_paises){
          if (this.list_paises[i].id == data.pais_id){
            pais=this.list_paises[i];
            this.form.controls["pais_id"].setValue(this.list_paises[i].id);
            break;
          }
        }
        if (typeof pais != "undefined"){
          this.loadEstados(pais, () => {
            let estado = undefined;
            for(var i in this.list_estados){
              if (this.list_estados[i].id == data.estado_id){
                estado = this.list_estados[i];
                this.form.controls["estado_id"].setValue(this.list_estados[i].id);
                break;
              }
            }
            if(typeof estado != "undefined"){
              this.loadMunicipios(estado, () => {
                for(var i in this.list_municipios){
                  if(this.list_municipios[i].id == data.municipio_id){
                    this.form.controls["municipio_id"].setValue(this.list_municipios[i].id);
                    break;
                  }
                }
              });
            }
          });
        }
        this.modalRefCE = this.modalService.open(this.modalCompany, {size:'lg', backdrop: false, animation:true});
      }, error => {
        alertError(error.error.detail|| "No se pudo editar la empresa");
      });
    });
  }

  openView(): void{}

  openDelete(): void{
    const seleccionado = getRowsSelected(this.jqxGridCompanys);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }

    alertConfirm("¿Realmente desea eliminar el registro seleccionado?", (result: any) => {
      if (result.isConfirmed){
        this.service.deleteCompany(seleccionado[0].id).subscribe(data => {
          alertOk("Registro eliminado correctamente.");
          this.load();
        }, error => {
          alertError(error.error.detail || "No se ha podido eliminar el registro");
        });
      }
    });
  }

  imageError: string;
  cardImageBase64: string;
  isImageSaved: boolean;
  loadImage(fileInput: any){
    this.imageError = "";
    if (fileInput.target.files && fileInput.target.files[0]) {
        // Size Filter Bytes
        const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
        if (allowed_types.indexOf(fileInput.target.files[0].type) < 0){
          this.imageError = 'Solo imagenes de tipo ( JPG | PNG )';
          return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const image = new Image();
            image.src = e.target.result;
            image.onload = (event: Event) => {
              let targetImg = event.currentTarget as HTMLImageElement;
              const width = targetImg.width;
              const height = targetImg.height
              if (width > 500 || height > 500){
                this.imageError =  `Asegurece de seleccionar imagenes no mayores a 500px por lado.
                \nImagen seleccionada ${width}px X ${height}px`;
                return;
              }else{
                this.cardImageBase64 = image.src;
                const ext = String(fileInput.target.files[0].name).toLowerCase().split(/[. ]+/).pop();
                this.form.controls["name_logo"].setValue(fileInput.target.files[0].name);
                this.form.controls["logo_b64"].setValue(this.cardImageBase64);
                this.form.controls["logo_ext"].setValue(ext);
              }
            }
        };

        reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  /// CSD
  openSettingsCSD(): void{
    const seleccionado = getRowsSelected(this.jqxGridCompanys);
    if (seleccionado.length <= 0){
      return alertError("Seleccione un registro");
    }
    this.branch = {
      is_active: seleccionado[0].is_active,
      nombre: "MATRIZ",
      id: seleccionado[0].branch_id,
      company_id: seleccionado[0].id
    };
    this.buindFormCsd(() => {
      this.modalCSDSettingsRef = this.modalService.open(this.modelCSDSettings, {size:'lg', backdrop: false, animation:true, backdropClass: 'light-blue-backdrop'});
    });
  }

  onSelect(event: any) {
		this.files.push(...event.addedFiles);
	}

  onRemove(event: any) {
		this.files.splice(this.files.indexOf(event), 1);
	}

  buindFormCsd(callback: Function){
    this.formCsd = this.formBuilder.group({
      password: ['', [Validators.required]],
    });
    callback();
  }

  settingsCsd(event: Event){
    event.preventDefault();
    if(this.formCsd.invalid){
      return this.formCsd.markAllAsTouched();
    }
    if (this.files.length <= 0){
      return alertError("Seleccione los archivos .KEY y .CER");
    }
    if (this.files.length > 0){
      // Validate
      var flag_cer = false;
      var flag_key = false;
      for(var i in this.files){
        const ext = String(this.files[i].name).toLowerCase().split(/[. ]+/).pop();
        if(ext == "cer"){
          flag_cer = true;
        }else if(ext == "key"){
          flag_key = true;
        }
      }
      if(!flag_cer){
        return alertError("Seleccione el archivo .CER");
      }
      if(!flag_key){
        return alertError("Seleccione el archivo .KEY");
      }
    }

    this.uploadFiles((error: any) => {
      if(error){
        return alertError(error.detail || "Error al subir el CSD");
      }
      this.settinCsd((error: any) => {
        if (error){
          return alertError(error.detail || "Error al configurar el CSD");
        }else{
          alertOk("CSD configurado correctamente");
          this.modalCSDSettingsRef.close();
          this.load();
        }
      });
    });
  }

  uploadFiles(callback: Function){
    const formData = new FormData();
    for(var i in this.files){
      formData.append("files", this.files[i]);
    }
    this.serviceBranch.uploadCsd(this.branch.company_id || 0, this.branch.id || 0, formData).subscribe(data => {
      return callback();
    }, error => {
      return callback(error.error);
    });
  }

  settinCsd(callback: Function){
    const setting = this.formCsd.value;
    setting.company_id= this.branch.company_id;
    setting.branch_id = this.branch.id;
    for(var i in this.files){
      const ext = String(this.files[i].name).toLowerCase().split(/[. ]+/).pop();
      if(String(ext).trim().toLowerCase() == "cer"){
        setting.cer = this.files[i].name;
      }else if(String(ext).trim().toLowerCase() == "key"){
        setting.key = this.files[i].name;
      }
    }
    this.serviceBranch.settingCsd(setting).subscribe(data => {
      this.files = [];
      return callback();
    }, error => {
      return callback(error.error);
    });
  }

  openFileSelector(event: any){
    let element: HTMLElement = document.getElementById("fileLogo") as HTMLElement;
    element.click();
  }


}
