/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { map } from 'rxjs/operators';
import { JwtService } from './jwt.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable( {
    providedIn: 'root'
} )
export class AuthService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor ( private api: ApiService, private jwt: JwtService ) {

        this.currentUserSubject = new BehaviorSubject<User>( JSON.parse( localStorage.getItem( 'currentUser' ) ) );
        this.currentUser = this.currentUserSubject.asObservable();

    }

    public get email (): string {

        if ( window.localStorage.getItem( 'email' ) ) {
            return window.localStorage.getItem( 'email' );
        }

        return null;
    }

    public refresh () {

        return this.api.post( '/auth/refresh' ).pipe( map( response => {

            if ( response && response.token ) {

                this.jwt.saveToken( response.token );

                window.localStorage.setItem( 'currentUser', JSON.stringify( response ) );

                this.currentUserSubject.next( response );

            }

            return response;

        } ) );

    }

    public logout () {

        window.localStorage.clear();

        this.jwt.destroyToken();

    }

    public login ( email: string, password: string ) {

        return this.api.post( '/auth/login', { email, password } )

            .pipe( map( response => {

                // login successful if there's a jwt token in the response
                if ( response && response.token ) {

                    this.jwt.saveToken( response.token );

                    window.localStorage.setItem( 'currentUser', JSON.stringify( response ) );
                    window.localStorage.setItem( 'email', email );

                    this.currentUserSubject.next( response );

                }

                return response;

            } ) );

    }

    public register (
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
        agreed: boolean
    ) {

        return this.api.post( '/auth/register', {
            name,
            email,
            password,
            password_confirmation: confirmPassword,
            agreed
        } )

            .pipe( map( response => {

                // login successful if there's a jwt token in the response
                if ( response && response.token ) {

                    this.jwt.saveToken( response.token );

                    window.localStorage.setItem( 'currentUser', JSON.stringify( response ) );
                    window.localStorage.setItem( 'email', email );

                    this.currentUserSubject.next( response );

                }

                return response;

            } ) );

    }

    public forgotPassword ( email: string ) {

        return this.api.post( '/auth/forgot-password', { email } );

    }

}
