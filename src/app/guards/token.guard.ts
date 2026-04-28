import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class TokenGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = route.paramMap.get('documentToken');

    if (!token) {
      this.router.navigate(['/invalid']);
      return false;
    }

    return true;
  }
}