import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesComponent } from './components/templates/templates.component';

const routes: Routes = [
  {path: 'plantillas', component: TemplatesComponent, 
    children: [
      { path: 'nueva', component: TemplatesComponent },
      { path: 'editar/:id', component: TemplatesComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
