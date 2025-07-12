import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';


import { LoginService } from '../../services/login.service';
import { ApiService } from '../../../services/api.service';
import { AppsService } from 'src/app/apps/services/apps.service';
import { ISession } from 'src/app/apps/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  public error: string;
  form: FormGroup;

  constructor(
    private apiService: ApiService,
    private service: LoginService,
    private router: Router, 
    private formBuilder: FormBuilder,
    private appService: AppsService,
  ){
    this.error = "";
    this.buildForm();
  }

  get usernameField(){
    return this.form.get("username");
  }

  get passwordField(){
    return this.form.get("password");
  }

  buildForm(){
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  login(event: Event){
    event.preventDefault();
    if (this.form.invalid){
      return this.form.markAllAsTouched();
    }
    const currentForm = this.form.value;
    this.service.login(currentForm.username, currentForm.password).subscribe(
      data => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_type", data.token_type);

        // Cargamos la session, para tener los datos ya precargados antes de ingresar a la /app
        this.appService.loadSession().subscribe(user => {
          window.localStorage.setItem("session", JSON.stringify(user));
          this.router.navigate(['/app']);
        }, error => {});
      },
      
      error => {
        this.error = error.error.detail || "Nombre de usuario o contraseña invalidas";
      }
    )
  }

}