/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { IFile } from '../../../core/io/file';
import { TvMap } from '../models/tv-map.model';
import { Object3D, Event } from 'three';
import { SceneService } from 'app/core/services/scene.service';

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

	static removeProp ( prop: Object3D ): void {
		SceneService.remove( prop );
	}

	static addProp ( prop: Object3D ): void {
		SceneService.add( prop );
	}

}
