import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISession } from '../../models/user';

@Component({
  selector: 'app-header-apps',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('subMenu') subMenu: ElementRef;
  @Input() user: ISession = {};
  
  constructor(private router: Router){}
  

  ngOnInit(): void {
  }

  logout(){
    this.subMenu.nativeElement.classList.toggle("menu-open");
    window.localStorage.clear();
    this.user = {};
    this.router.navigate(['/login']);
  }

  toggleMenu(){
    this.subMenu.nativeElement.classList.toggle("menu-open");
  }

  goTo(url: String){
    this.subMenu.nativeElement.classList.toggle("menu-open");
    this.router.navigate([url]);
  }
}
