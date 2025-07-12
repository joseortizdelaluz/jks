import { Component, Input } from '@angular/core';
import { Session } from 'src/app/page/models/session';
import { ISession } from '../../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
  @Input() user: ISession = {};

  private user_profile: any = {};
  
}