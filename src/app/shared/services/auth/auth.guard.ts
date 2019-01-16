import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ArdorAccountService } from '../ardor/ardor-account.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;
  
  constructor(private router: Router, private ardorAS: ArdorAccountService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if ((this.ardorAS.account === undefined)) {
      this.router.navigate(['/sessions/login']);
      return false;
    }
    return true;
  }
}