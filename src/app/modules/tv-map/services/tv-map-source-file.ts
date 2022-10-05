/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { IFile } from '../../../core/models/file';
import { TvMap } from '../models/tv-map.model';

export class TvMapInstance {

	static mapChanged = new EventEmitter<TvMap>();
	static currentFile: IFile;

	private static _map: TvMap = new TvMap;

	static get map (): TvMap {
		return this._map;
	}

	static set map ( value: TvMap ) {
		this._map = value;
		this.mapChanged.emit( value );
	}

	static clearOpenDrive () {
		// console.error( 'method not implemented' );
	}

	static clearScene () {
		// console.error( 'method not implemented' );
	}

	static redraw () {
		this.mapChanged.emit( this.map );
	}
}
