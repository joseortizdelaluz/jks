import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routingPage } from './router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { RecuperarContraseniaComponent } from './components/recuperar/recuperar.component';
import { HeaderPageComponent } from './components/header/header.component';

@NgModule({
    declarations: [
        LoginComponent,
        RegisterComponent,
        RecuperarContraseniaComponent,
        HeaderPageComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        routingPage,
        NgSelectModule,
        NgbTypeaheadModule,
    ],

    /// Exportamos nuestros componentes genericos.
    exports: [
        HeaderPageComponent
    ]
})
export class PageModule { }
