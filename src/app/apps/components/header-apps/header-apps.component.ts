import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-apps-label',
  templateUrl: './header-apps.component.html',
  styleUrls: ['./header-apps.component.css']
})
export class HeaderAppsComponent {
  @Input() appName: string;
}
