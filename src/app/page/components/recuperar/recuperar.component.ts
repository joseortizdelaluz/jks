import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { alertError, alertOk, generatePassword, getFormControl } from 'src/app/utils/utils';
import { IUser } from 'src/app/apps/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
})
export class RecuperarContraseniaComponent implements OnInit{
  public form1: FormGroup;
  public form2: FormGroup;
  public getFormControl: Function = getFormControl;
  public type: string = "password";
  public step: number;
  constructor(
    private service: LoginService,
    private formBuilder: FormBuilder,
    private router: Router,
  ){}

  ngOnInit(): void {
    this.form1 = this.formBuilder.group({
      email_or_username: [null, [Validators.required]],
    });

    this.form2 = this.formBuilder.group({
      email_or_username: [null, [Validators.required]],
      clave: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
    this.step = 1;
  }

  user: IUser;
  buscame(event: Event){
    event.preventDefault();
    if(this.form1.invalid){
      return this.form1.markAllAsTouched();
    }
    const value = this.form1.value.email_or_username;
    this.service.buscame(value).subscribe(user => {
      this.form2.controls["email_or_username"].setValue(value);
      this.user = user;
      this.step = 2;
    }, error => {
      alertError(error.error.detail || "No se ha localizado su información.");
    });
  }

  changePassword(event: Event){
    event.preventDefault();
    if (this.form2.invalid){
      return this.form2.markAllAsTouched();
    }
    this.service.changePassword(this.form2.value).subscribe(resp => {
      this.router.navigate(['/login']);
      alertOk("Su contraseña ha sido modificada correctamente.");
    }, error => {
      alertError(error.error.detail || "No se ha podido modificar su contraseña, intente mas tarde.");
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
    this.form2.controls["password"].setValue(password);
  }

  reenviarClave(){
    this.service.reenviarClave(this.user.id || 0, this.user.email || "").subscribe(resp => {
      alertOk("Se ha reenviado la clave correctamente");
    }, error => {
      alertError("No se ha podido reenviar el correo");
    });
  }
}
