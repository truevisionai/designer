/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from '../models/tv-map.model';
import { EventEmitter } from '@angular/core';
import { IFile } from '../../../core/models/file';

export class TvMapSourceFile {

    static roadNetworkChanged = new EventEmitter<TvMap>();
    static currentFile: IFile;

    private static _openDrive: TvMap = new TvMap;

    static get openDrive (): TvMap {
        return this._openDrive;
    }

    static set openDrive ( value: TvMap ) {
        this._openDrive = value;
        this.roadNetworkChanged.emit( value );
    }

    static clearOpenDrive () {
        // console.error( 'method not implemented' );
    }

    static clearScene () {
        // console.error( 'method not implemented' );
    }

    static redraw () {
        this.roadNetworkChanged.emit( this.openDrive );
    }
}
