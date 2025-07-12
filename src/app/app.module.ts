import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppsComponent } from './apps/apps.component';
import { PageComponent } from './page/page.component';

import { DashboardModule } from './apps/apps.module';
import { PageModule } from './page/page.module';

import { InterceptorService } from './services/interceptor.service';
import { TemplateModule } from './template/template.module';
import { SpinnerComponent } from './components/spinner/spinner.component';





@NgModule({
  declarations: [
    AppComponent,
    AppsComponent,
    PageComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    jqxGridModule,
    HttpClientModule,
    //
    DashboardModule,
    PageModule,
    // Para el manejo de las rutas
    AppRoutingModule,
    TemplateModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
