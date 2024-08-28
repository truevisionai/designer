/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from "three";
import { SceneService } from "../../services/scene.service";

export class Object3DArrayMap<K, T extends Array<Object3D>> {

	private map: Map<K, Array<Object3D>>;

	constructor ( private parent?: Object3D ) {

		this.map = new Map();

	}

	setParent ( parent: Object3D ) {

		this.parent = parent;

	}

	addItems ( key: K, objects: T ) {

		objects.forEach( object => this.addItem( key, object ) );

	}

	addItem ( key: K, object: Object3D ) {

		if ( !this.map.has( key ) ) {

			this.map.set( key, [] );

		}

		this.map.get( key ).push( object );

		SceneService.addToolObject( object );

	}

	getItems  ( key: K ): T {

		return this.map.get( key ) as T;

	}

	getKeys (): IterableIterator<K> {

		return this.map.keys();

	}

	forEachKey ( callback: ( key: K, objects: T ) => void ): void {

		this.map.forEach( ( objects, key ) => callback( key, objects as T ) );

	}

	has ( key: K ) {

		return this.map.has( key );

	}

	removeItem ( key: K, object: Object3D ) {

		if ( !this.map.has( key ) ) return;

		this.map.get( key ).splice( this.map.get( key ).indexOf( object ), 1 );

		SceneService.removeFromTool( object );

	}

	removeKey ( key: K ) {

		if ( !this.map.has( key ) ) return;

		this.map.get( key ).forEach( object => {

			SceneService.removeFromTool( object );

		} );

		this.map.delete( key );
	}

	clear () {

		this.map.forEach( objects => {

			objects.forEach( object => SceneService.removeFromTool( object ) );

		} );

		this.map.clear();

	}

}
