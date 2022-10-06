/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../services/jwt.service';

@Injectable( {
    providedIn: 'root'
} )
export class AuthGuard implements CanActivate {

    private user: User;

    constructor ( public auth: AuthService, private jwt: JwtService, public router: Router ) {

        this.auth.currentUser.subscribe( user => this.user = user );

    }

    canActivate (): boolean {

        if ( this.jwt.hasToken() && !this.jwt.isTokenExpired() ) {

            return true;

        } else {

            this.router.navigate( [ '/sessions/signin' ] );

            return false;

        }

    }

}
