/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import { Object3D } from 'three';

export class Object3DMap<K, T extends Object3D> {

	private map: Map<K, T>;

	constructor ( private parent?: Object3D ) {

		this.map = new Map();

	}

	setParent ( parent: Object3D ) {

		this.parent = parent;

	}

	add ( key: K, value: T ) {

		if ( this.map.has( key ) ) {

			SceneService.removeFromTool( this.map.get( key ) );

		}

		this.map.set( key, value );

		SceneService.addToolObject( value );

	}

	remove ( key: K ) {

		SceneService.removeFromTool( this.map.get( key ) );

		this.map.delete( key );
	}

	get ( key: K ): T {

		return this.map.get( key );

	}

	values () {

		return this.map.values();

	}

	keys () {

		return this.map.keys();

	}

	clear () {

		this.map.forEach( value => {

			SceneService.removeFromTool( value );

		} );

		this.map.clear();

	}

}

