/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MixpanelService } from './mixpanel.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { Environment } from '../utils/environment';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable( {
    providedIn: 'root'
} )
export class AnalyticsService {

    private destroyed$ = new Subject();

    constructor ( private mixpanel: MixpanelService, private auth: AuthService, private router: Router ) {

        if ( Environment.production ) this.mixpanel.init( environment.mixpanel_id, this.auth.email );

        if ( this.email != null ) this.setEmail( this.email );

        this.auth.currentUser.subscribe( e => this.onUserChanged() );

    }

    get email () {

        return this.auth.email;

    }

    init () {

        if ( Environment.production ) this.trackPageChanges();

    }

    private trackPageChanges () {

        this.router.events
            .pipe(
                filter( ( event: RouterEvent ) => event instanceof NavigationEnd ),
                takeUntil( this.destroyed$ ),
            )
            .subscribe( ( event: NavigationEnd ) => {
                this.trackPageView( event.url );
            } );

    }

    onUserChanged (): void {

        if ( this.email != null ) this.setEmail( this.email );

    }

    send ( event: string, options: any ) {

        if ( !Environment.production ) return;

        this.mixpanel.track( event, options );

    }

    trackError ( error: Error ) {

        if ( !Environment.production ) return;

        this.mixpanel.track( 'error', {
            name: error.name,
            message: error.message,
            stack: error.stack
        } );

    }

    setEmail ( email: string ) {

        if ( Environment.production ) this.mixpanel.setEmail( email );

    }


    trackPageView ( url: string ) {

        if ( !Environment.production ) return;

        this.mixpanel.track( 'pageview', {
            url: url
        } );

    }
}
