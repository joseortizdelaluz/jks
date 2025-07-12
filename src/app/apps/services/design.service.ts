import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DesignService {
  constructor(
    private apiService: ApiService,
  ) { }

  
}
