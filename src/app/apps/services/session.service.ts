import { Injectable } from '@angular/core';
import { ISession } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private session: ISession;

  constructor(){}

  get _session(): ISession{
    return this.session;
  }

  setSession(session: ISession){
    this.session = session;
  }

  clear():void{
    this.session = {};
  }
}
