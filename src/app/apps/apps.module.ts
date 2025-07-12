import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AppsRoutingModule } from './router';
import { UsersComponent } from './components/settings/users/users.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { CustomersComponent } from './components/catalogs/customers/customers.component';
import { CompanysComponent } from './components/catalogs/companys/companys.component';
import { BanksComponent } from './components/catalogs/banks/banks.component';
import { BranchsCompanyComponent } from './components/catalogs/branchs-company/branchs-company.component';
import { AccountsCompanyComponent } from './components/catalogs/account-company/accounts-company.component';
import { AccountsCustomerComponent } from './components/catalogs/accounts-customer/accounts-customer.component';

import { NgbModule, NgbTypeaheadModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';

import { NgSelectModule } from '@ng-select/ng-select';
import { InvoiceComponent } from './components/billing/invoice/invoice.component';
import { TaxComponent } from './components/billing/tax/tax.component';
import { ConceptComponent } from './components/billing/concept/concept.component';
import { DesignComponent } from './components/settings/design/design.component';
import { ProveedorComponent } from './components/catalogs/proveedor/proveedor.component';
import { ProductoComponent } from './components/catalogs/producto/producto.component';

import { DecimalX100Pipe } from '../pipes/decimal-x100.pipe';
import { TemplateComponent } from './components/settings/template/template.component';
import { StaffsComponent } from './components/servicios/staffs/staffs.component';
import { PrepagoComponent } from './components/servicios/prepago/prepago.component';
import { PremiumComponent } from './components/servicios/premium/premium.component';
import { CotizacionesComponent } from './components/billing/cotizaciones/cotizaciones.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HeaderAppsComponent } from './components/header-apps/header-apps.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { DepartamentosCompanyComponent } from './components/catalogs/departamentos-company/departamentos-company.component';
import { RpatronalComponent } from './components/catalogs/companys/rpatronal/rpatronal.component';
import { SalesComponent } from './components/billing/sales/sales.component';



@NgModule({
    declarations: [
      UsersComponent,
      DashboardComponent,
      HeaderComponent,
      CustomersComponent,
      CompanysComponent,
      BanksComponent,
      BranchsCompanyComponent,
      AccountsCompanyComponent,
      AccountsCustomerComponent,
      InvoiceComponent,
      TaxComponent,
      ConceptComponent,
      DesignComponent,
      ProveedorComponent,
      ProductoComponent,
      DecimalX100Pipe,
      TemplateComponent,
      StaffsComponent,
      PrepagoComponent,
      PremiumComponent,
      CotizacionesComponent,
      ProfileComponent,
      HeaderAppsComponent,
      DepartamentosCompanyComponent,
      RpatronalComponent,
      SalesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppsRoutingModule,
        jqxGridModule,
        NgSelectModule,
        NgbTypeaheadModule,
        NgbProgressbarModule,
        NgxDropzoneModule,
        NgbModule,
        NgChartsModule,
        EditorModule
    ],
  /// Exportamos nuestros componentes genericos.
  /// Para usarlos en las vistas.
    exports: [
      HeaderComponent,
      DecimalX100Pipe,
    ],
    providers: [
      DecimalX100Pipe,
    ]
})
export class DashboardModule { 
  // init: EditorComponent['init'] = {
  //   plugins: 'lists link image table code help wordcount'
  // };
}
