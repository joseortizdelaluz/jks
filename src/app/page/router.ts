import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecuperarContraseniaComponent } from './components/recuperar/recuperar.component';

const routes: Routes = [
    {path: '', component: PageComponent, 
        children: [
            {path: '', component: PageComponent},
            {path: 'nosotros', component: LoginComponent },
            {path: 'contacto', component: LoginComponent },
            {path: 'registro', component: RegisterComponent},
            {path: 'recupera-acceso', component: RecuperarContraseniaComponent},
            {path: 'login', component: LoginComponent},
        ]
    },
];
export const routingPage = RouterModule.forRoot(routes);