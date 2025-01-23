/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import { Object3D } from "three";

export class Object3DMap<K, T extends Object3D> {

	private map: Map<K, T>;

	private parent: Object3D;

	constructor ( parent?: Object3D ) {

		this.map = new Map();

		this.parent = parent || SceneService.getToolLayer();

	}

	add ( key: K, value: T ): void {

		if ( this.map.has( key ) ) {

			this.parent.remove( this.map.get( key ) );

		}

		this.map.set( key, value );

		this.parent.add( value );

	}

	remove ( key: K ): void {

		this.parent.remove( this.map.get( key ) );

		this.map.delete( key );
	}

	get ( key: K ): T {

		return this.map.get( key );

	}

	has ( key: K ): boolean {

		return this.map.has( key );

	}

	entries (): IterableIterator<[ K, T ]> {

		return this.map.entries();

	}

	values (): IterableIterator<T> {

		return this.map.values();

	}

	keys (): IterableIterator<K> {

		return this.map.keys();

	}

	clear (): void {

		this.map.forEach( value => {

			this.parent.remove( value );

		} );

		this.map.clear();

	}

}

