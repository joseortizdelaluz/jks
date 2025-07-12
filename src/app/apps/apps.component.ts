import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppsService } from './services/apps.service';
import { ISession } from './models/user';
import { SessionService } from './services/session.service';
@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: [
    './apps.component.css',
  ]
})
export class AppsComponent{
  public user: ISession = {};
  constructor(
    private router: Router, 
    private service: AppsService,
    private sessionService: SessionService,
  ){
    try {
      var session: any = window.localStorage.getItem("session");
      if(session == null){
        this.router.navigate(['/login']);
        return;
      }
      this.user = JSON.parse(session);
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }
}
