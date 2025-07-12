import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsComponent } from './apps.component';
import { UsersComponent } from './components/settings/users/users.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/catalogs/customers/customers.component';
import { CompanysComponent } from './components/catalogs/companys/companys.component';
import { BanksComponent } from './components/catalogs/banks/banks.component';
import { AccountsCompanyComponent } from './components/catalogs/account-company/accounts-company.component';
import { AccountsCustomerComponent } from './components/catalogs/accounts-customer/accounts-customer.component';
import { BranchsCompanyComponent } from './components/catalogs/branchs-company/branchs-company.component';
import { InvoiceComponent } from './components/billing/invoice/invoice.component';
import { TaxComponent } from './components/billing/tax/tax.component';
import { ProveedorComponent } from './components/catalogs/proveedor/proveedor.component';
import { ProductoComponent } from './components/catalogs/producto/producto.component';
import { TemplateComponent } from './components/settings/template/template.component';
import { StaffsComponent } from './components/servicios/staffs/staffs.component';
import { PrepagoComponent } from './components/servicios/prepago/prepago.component';
import { PremiumComponent } from './components/servicios/premium/premium.component';
import { CotizacionesComponent } from './components/billing/cotizaciones/cotizaciones.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DepartamentosCompanyComponent } from './components/catalogs/departamentos-company/departamentos-company.component';
import { RpatronalComponent } from './components/catalogs/companys/rpatronal/rpatronal.component';
import { SalesComponent } from './components/billing/sales/sales.component';

const routes: Routes = [
    {path: 'app', component: AppsComponent, children: [
        {path: '', component: DashboardComponent},
        {path: 'dashboard', component: DashboardComponent},
        {path: 'profile', component: ProfileComponent},

        {path: 'catalogos', component: AppsComponent, children: [
            {path: 'clientes', component: CustomersComponent},
            // {path: 'empresas', component: CompanysComponent, }
            {path: 'empresas', component: CompanysComponent},
            {path: 'empresas/rpatronales', component: RpatronalComponent},
            {path: 'empresas/sucursales', component: BranchsCompanyComponent},
            {path: 'empresas/cuentas', component: AccountsCompanyComponent},

            {path: 'bancos', component: BanksComponent},
            {path: 'departamentos-empresa', component: DepartamentosCompanyComponent},
            
            {path: 'cuentas-cliente', component: AccountsCustomerComponent},
            {path: 'proveedores', component: ProveedorComponent},
            {path: 'productos', component: ProductoComponent},
        ]},

        //Catalogos
        /*{path: 'catalogos/clientes', component: CustomersComponent},
        {path: 'catalogos/empresas', component: CompanysComponent},
        {path: 'catalogos/bancos', component: BanksComponent},
        {path: 'catalogos/sucursales-empresa', component: BranchsCompanyComponent},
        {path: 'catalogos/cuentas-empresa', component: AccountsCompanyComponent},
        {path: 'catalogos/cuentas-cliente', component: AccountsCustomerComponent},
        {path: 'catalogos/proveedores', component: ProveedorComponent},
        {path: 'catalogos/productos', component: ProductoComponent},
        */
        
        {path: 'herramientas/usuarios', component: UsersComponent},
        {path: 'herramientas/plantillas', component: TemplateComponent},

        {path: 'facturacion/documentos', component: InvoiceComponent},
        {path: 'facturacion/impuestos', component: TaxComponent},
        {path: 'cotizaciones', component: CotizacionesComponent},
        {path: 'ventas', component: SalesComponent},
        {path: 'servicios/staffs', component: StaffsComponent },
        {path: 'servicios/prepago', component: PrepagoComponent },
        {path: 'servicios/premium', component: PremiumComponent },
    ]},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppsRoutingModule { }