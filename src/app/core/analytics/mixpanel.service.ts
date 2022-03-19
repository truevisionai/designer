/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';

@Injectable( {
    providedIn: 'root'
} )
export class MixpanelService {


    constructor () {
    }

    /**
     * Initialize mixpanel.
     *
     * @param {string} userToken
     * @memberof MixpanelService
     */
    init ( userToken: string, identifier: string = null ): void {
        mixpanel.init( userToken );
        mixpanel.identify( identifier || userToken );
    }

    /**
     * Push new action to mixpanel.
     *
     * @param {string} id Name of the action to track.
     * @param {*} [action={}] Actions object with custom properties.
     * @memberof MixpanelService
     */
    track ( id: string, action: any = {} ): void {
        mixpanel.track( id, action );
    }

    setEmail ( email: string ) {
        mixpanel.people.set( {
            $email: email
        } );
    }
}
