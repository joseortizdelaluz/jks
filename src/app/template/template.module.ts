import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateRoutingModule } from './router';
import { TemplatesComponent } from './components/templates/templates.component';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    TemplatesComponent
  ],
  imports: [
    CommonModule,
    jqxGridModule,
    TemplateRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ]
})
export class TemplateModule { }
