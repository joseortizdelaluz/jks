import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class ApiSettings {
    public static urlAPI = 'http://localhost:8000';
    // public static urlAPI = "https://crmapi-23770faa6b83.herokuapp.com";
}