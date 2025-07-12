import { Component, OnInit } from '@angular/core';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit{
  constructor(
    private router: Router, 
    private loginService: LoginService,
  ){}
  
  ngOnInit(): void {
    if (this.loginService.hasToken()){
      if (this.loginService.isLoggedIn()){
        this.router.navigate(['/app']);
      }else{
        // localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
  }
}
