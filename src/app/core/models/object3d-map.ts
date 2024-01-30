/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import { Object3D } from 'three';

export class Object3DMap<K, T extends Object3D> {

	private map: Map<K, T>;

	private parent: Object3D;

	constructor ( parent?: Object3D ) {

		this.map = new Map();

		this.parent = parent || SceneService.getToolLayer();

	}

	setParent ( parent: Object3D ) {

		this.parent = parent;

	}

	add ( key: K, value: T ) {

		if ( this.map.has( key ) ) {

			this.parent.remove( this.map.get( key ) );

		}

		this.map.set( key, value );

		this.parent.add( value );

	}

	remove ( key: K ) {

		this.parent.remove( this.map.get( key ) );

		this.map.delete( key );
	}

	get ( key: K ): T {

		return this.map.get( key );

	}

	has ( key: K ): boolean {

		return this.map.has( key );

	}

	values () {

		return this.map.values();

	}

	keys () {

		return this.map.keys();

	}

	clear () {

		this.map.forEach( value => {

			this.parent.remove( value );

		} );

		this.map.clear();

	}

}

