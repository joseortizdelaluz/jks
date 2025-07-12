import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { alertError, alertOk, generatePassword, getFormControl } from 'src/app/utils/utils';
import { Validations } from 'src/app/utils/validations';
import { ValidationService } from 'src/app/services/validation.service';
import { IColonia, IEstado, IMunicipio, IPais, IRegimen } from 'src/app/apps/models/generic.models';
import { Observable, OperatorFunction, catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';
import { GeneralService } from 'src/app/apps/services/general.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  formFiscal: FormGroup;
  type: string = "password";
  getFormControl: Function = getFormControl;
  step: number = 1;
  searching = false;
	searchFailed = false;
  
  list_regimenes: IRegimen[] = [];
  list_paises: IPais[] = [];
  list_estados: IEstado[] = [];
  list_municipios: IMunicipio[] = [];

  constructor(
    private service: LoginService,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private generalService: GeneralService,
    private router: Router,
  ){}

  loadCombos(callback: any){
    this.service.loadCombosCE().subscribe(data => {
      this.list_regimenes = data.regimenes;
      this.list_paises = data.paises;
      this.list_estados = data.estados;
      callback();
    });
  }

  createForm(){
    // STEP 1
    this.form = this.formBuilder.group({
      // Datos del usuario SFATT y contacto
      id: [0],
      first_name: [null, [Validators.required]],
      last_name: [null],
      username: [null, [Validators.required, Validators.minLength(4)], [Validations.checkUsername(this.validationService)]],
      email: [null, [Validators.required, Validators.email], [Validations.checkEmail(this.validationService)]],
      password: [null, [Validators.required, Validators.minLength(7), Validators.maxLength(50), Validations.checkPassword('password', 'repassword')]],
      repassword: [null, [Validators.required]],
    });
    
    // STEP 2
    this.formFiscal = this.formBuilder.group({
      // Datos de la empresa que sera la primaria
      id: [0],
      rfc: [null, [Validators.required, Validators.minLength(12), Validators.maxLength(13)], [Validations.checkStaffRfc(this.validationService)]],
      razon_social: [null, [Validators.required], [Validations.checkStaffRazonSocial(this.validationService)]],
      regimen_id: [null, [Validators.required]],
  
      //Dirección
      calle: [''],
      num_ext: [''],
      num_int: [''],
      colonia: [''],
      referencia: [''],
      municipio_id: [null],
      estado_id: [null],
      pais_id: [null],
      cp: ['', [Validators.minLength(5), Validators.maxLength(5) ]],
  
      telefono: [''],
    });
  }

  ngOnInit(): void {
    this.createForm();

    // this.form.patchValue({
    //   first_name: "José",
    //   last_name: "Ortiz de la luz",
    //   username: "jose-luz",
    //   email: "jose_298@hotmail.com",
    //   password: "2adPPzxw0000%_&-X{)",
    //   repassword: "2adPPzxw0000%_&-X{)",
    // });

    // this.formFiscal.patchValue({
    //   rfc: "IIA040805DZ3",
    //   razon_social: "INDISTRIA ILUMINADORA DE ALMACENEC",
    //   regimen_id: null,
    //   calle: "Zaragoza",
    //   num_ext: "5",
    //   num_int: "",
    //   colonia: "San Bartolomé",
    //   referencia: "Planta tratadora de NAFTAS",
    //   municipio_id: null,
    //   estado_id: null,
    //   pais_id: null,
    //   cp: "64258",
    //   telefono: "249 210 8684",
    // });

    this.loadCombos(() => {
      for(var i in this.list_paises){
        if(this.list_paises[i].clave == "MEX"){
          this.formFiscal.controls["pais_id"].setValue(this.list_paises[i].id);
          break;
        }
      }
    });
  }
  
  viewPassword(){
    if (this.type == "password"){
      this.type = "text";
    }else{
      this.type = "password";
    }
  }

  generatePassword(){
    const password = generatePassword();
    this.form.controls["password"].setValue(password);
    this.form.controls["repassword"].setValue(password);
  }

  next(){
    if (this.form.invalid){
      return this.form.markAllAsTouched();
    }
    this.step = 2;
  }

  back(){
    this.step = 1;
  }

  register(event: Event){
    event.preventDefault();

    if (this.formFiscal.invalid || this.form.invalid){
      return this.formFiscal.markAllAsTouched();
    }

    const data = {...this.form.value, ...this.formFiscal.value};
    console.log(data);
    this.service.register(data).subscribe(resp => {
      this.router.navigate(['/login']);
      alertOk("Registro generado correctamente, revise su correo y verifique su cuenta.");
    }, error => {
      alertError(error.error.detail || "No se ha podido llevar a cabo el registro.");
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

  loadEstados(event: IPais, callback: any=undefined){
    this.generalService.estados(event.clave, event.id).subscribe(data => {
      this.list_estados = data;
      if (typeof callback == "function"){
        callback();
      }
    });
  }

  loadMunicipios(event: IEstado, callback: any=undefined){

    console.log("///////////////////////////////////////////////////////////7");
    console.log(event);

    this.generalService.municipios(event.clave!, event.id).subscribe(data => {
      this.list_municipios = data;
      if (typeof callback == "function"){
        callback();
      }
    });
  }

  selectedCP(result: any){
    this.formFiscal.controls['colonia'].setValue(result.asenta);
    this.formFiscal.controls['cp'].setValue(result.cp);

    setTimeout(() => {
      const value = JSON.parse(JSON.stringify(this.formFiscal.controls["cp"].value)); 
      this.formFiscal.controls['cp'].setValue("");
      this.formFiscal.controls['cp'].setValue(result.cp);
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
            this.formFiscal.controls["estado_id"].setValue(this.list_estados[i].id);
            break;
          }
        }
        if(typeof estado != "undefined"){
          this.loadMunicipios(estado, () => {
            for(var i in this.list_municipios){
              if(this.list_municipios[i].clave == clave_numerica_municipio){
                this.formFiscal.controls["municipio_id"].setValue(this.list_municipios[i].id);
                break;
              }
            }
          });
        }
      });
    }
  }
}
