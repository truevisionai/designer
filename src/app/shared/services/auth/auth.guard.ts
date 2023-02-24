/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
    public authToken;
    private isAuthenticated = true; // Set this value dynamically

    constructor ( private router: Router ) {
    }

    canActivate ( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        if ( this.isAuthenticated ) {
            return true;
        }
        this.router.navigate( [ '/sessions/signin' ] );
        return false;
    }
}
