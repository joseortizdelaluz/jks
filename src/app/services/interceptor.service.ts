import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { catchError, Observable, throwError, EMPTY, of } from "rxjs";
import { finalize } from 'rxjs/operators';

import { LoaderService } from './loader.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(
    private router: Router, 
    private loadingService: LoaderService,
  ) {}
  
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const cloned = req.clone({
        headers: req.headers.set("Authorization", "Bearer " + accessToken)
      });
      this.loadingService.setLoading(true);

      return next.handle(cloned).pipe(
        finalize(() => {
          this.loadingService.setLoading(false);
        }),
        catchError((error) => {
          if(error instanceof HttpErrorResponse){
            if (error.status == 401 && error.statusText.toLowerCase() == "unauthorized" && error.error.detail == "Could not validate credentials"){
              this.router.navigate(['/login']);
              localStorage.clear();
            }else if(error.status == 401 && error.statusText.toLowerCase() == "unauthorized" && error.error.detail == "Not authenticated"){
              this.router.navigate(['/login']);
            }
          }
          return throwError(error);
        })
      );
    }else {

      this.loadingService.setLoading(true);
      return next.handle(req).pipe(
        finalize(() => {
          this.loadingService.setLoading(false);
        }),
        catchError((error) => {
          if(error instanceof HttpErrorResponse){
            if (error.status == 401 && 
              error.statusText.toLowerCase() == "unauthorized" && 
              (
                error.error.detail == "Could not validate credentials" || 
                error.error.detail == "Not authenticated"
              )
            ){
              this.router.navigate(['/login']);
            }
          }
          return throwError(error);
        }),
        
      );
    }
  }
  
  handleError(error: HttpErrorResponse) {
    if (error.status == 401 && error.statusText.toLowerCase() == "unauthorized" && (error.error.detail=="Could not validate credentials" || error.error.detail == "Not authenticated")){
      this.router.navigate(['/login']);
    }
    return throwError(error);
  }
}