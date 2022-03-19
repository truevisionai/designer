/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapSourceFile } from '../../modules/tv-map/services/tv-map-source-file';
import { HostListener } from '@angular/core';

enum KEY_CODE {
    DELETE = 46
}

export abstract class BaseInspector {

    get openDrive () {
        return TvMapSourceFile.openDrive;
    }

    @HostListener( 'window:keydown', [ '$event' ] )
    baseOnKeyDown ( event: KeyboardEvent ) {

        if ( event.keyCode === KEY_CODE.DELETE ) {

            this.onDelete();

        }

    }


    onDelete () {

    }
}