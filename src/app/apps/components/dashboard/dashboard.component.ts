import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { DashboardService } from '../../services/dashboard.service';
import { StatusCfdi } from '../../enums';
import { ISession } from '../../models/user';
import { SessionService } from '../../services/session.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public dashboard: any = {};
  public years: any[] = [];
  public year: any;

  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: any;
  public user: ISession = {};
  @Input() session: ISession = {};

  public diff_days(fecha: string){
    const now: any = new Date();
    const date: any = new Date(fecha);

    const diffTime = Math.floor(date - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  }


  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {}
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  constructor(
    private service: DashboardService,
    private sessionService: SessionService,
  ){
    var d = new Date();
    this.year = d.getFullYear();
    for(var i = d.getFullYear(); i >= 2021; i--){
      this.years.push({year: i});
    }
  }
  

  createDataChart(data: any[] = []){
    const meses: any = {
      1: {sellado: 0, cancelado: 0, name:'Enero',},
      2: {sellado: 0, cancelado: 0, name:'Febrero',},
      3: {sellado: 0, cancelado: 0, name:'Marzo',},
      4: {sellado: 0, cancelado: 0, name:'Abril',},
      5: {sellado: 0, cancelado: 0, name:'Mayo',},
      6: {sellado: 0, cancelado: 0, name:'Junio',},
      7: {sellado: 0, cancelado: 0, name:'Julio',},
      8: {sellado: 0, cancelado: 0, name:'Agosto',},
      9: {sellado: 0, cancelado: 0, name:'Septiembre',},
      10: {sellado: 0, cancelado: 0, name:'Octubre',},
      11: {sellado: 0, cancelado: 0, name:'Noviembre',},
      12: {sellado: 0, cancelado: 0, name:'Diciembre',},
    };
    for(var i in data){
      if (data[i].status_cfdi == StatusCfdi.Sellado){
        meses[data[i].month].sellado += data[i].total;
      }else if(data[i].status_cfdi == StatusCfdi.Cancelado || data[i].status_cfdi == StatusCfdi.Cancelado_aceptacion){
        meses[data[i].month].cancelado += data[i].total;
      }
    }
    const sellados: any = {data: [], label: 'Sellados', backgroundColor: ['#2ECC71']};
    const cancelados: any = {data: [], label: 'Cancelados', backgroundColor: ['#FC5858']};

    for(var month in meses){
      sellados.data.push(meses[month].sellado);
      cancelados.data.push(meses[month].cancelado);
    }

    const barChartData: ChartConfiguration<'bar'>['data'] = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        cancelados,
        sellados,
      ]
    };
    return barChartData;
  }

  ngOnReady(){
    
  }


  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("session")!);
    try{
      if (this.user.is_superuser){
        
      }else if(this.user.is_staff){
  
      }else{
  
      }
    }catch(e){}
    this.loadAll();
  }

  loadAll(){
    this.service.loadInit().subscribe(data => {
      this.dashboard = data;
      if (!this.user.is_superuser){
        this.barChartData = this.createDataChart(this.dashboard.sellados_cancelados_por_mes || []);
      }
    });
  }

  loadDataYear(event: any){
    if(typeof event != "undefined"){
      this.service.dataChartYear(event.year).subscribe((data: any) => {
        this.barChartData = this.createDataChart(data || []);
      }, error => {});
    }
  }
}
