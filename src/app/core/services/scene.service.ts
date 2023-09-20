/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import * as THREE from 'three';
import { Mesh, Object3D } from 'three';
import { GameObject } from '../game-object';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';

@Injectable( {
	providedIn: 'root'
} )
export class SceneService {

	public static scene: THREE.Scene = new THREE.Scene;
	public static objects: Object3D[] = [];
	public static sceneHelpers: Object3D[] = [];
	public static renderer: THREE.WebGLRenderer;
	public static changed = new EventEmitter();

	constructor () {


	}

	public static get children () {
		return this.scene.children;
	}

	static raycastableObjects () {

		const raycastableObjects = [];

		this.scene.traverse( object => {

			if ( object instanceof THREE.Points && object.visible ) {

				raycastableObjects.push( object );

			}

		} );

		raycastableObjects.push( ThreeService.bgForClicks );

		raycastableObjects.push( TvMapInstance.map.gameObject );

		return raycastableObjects;

	}

	static addHelper ( object: Object3D ): void {

		this.scene.add( object );

		this.sceneHelpers.push( object );

		// object.layers.set( 31 );

	}

	static removeHelper ( object: Object3D ): void {

		if ( object == null ) return;

		this.scene.remove( object );

		for ( let i = 0; i < this.sceneHelpers.length; i++ ) {

			const element = this.sceneHelpers[ i ];

			if ( element.id === object.id ) {

				this.sceneHelpers.splice( i, 1 );

				break;
			}
		}
	}

	static clear () {

		this.removeObjects();

	}

	static removeObjects () {

		this.objects.forEach( object => this.remove( object ) );

		this.changed.emit();

	}

	static add ( object: Object3D, raycasting: boolean = true ): void {

		if ( object == null ) return;

		this.scene.add( object );

		if ( raycasting ) this.objects.push( object );

		this.changed.emit();

	}

	static deselect ( object: Object3D ): void {

		throw new Error( 'Not implemented' );

	}

	static focus ( object: Object3D ): void {

		throw new Error( 'Not implemented' );

	}

	static remove ( object: Object3D, raycasting: boolean = true ): void {

		if ( object == null ) return;

		this.scene.remove( object );

		if ( raycasting ) {

			for ( let i = 0; i < this.objects.length; i++ ) {

				const element = this.objects[ i ];

				if ( element.id === object.id ) {

					this.objects.splice( i, 1 );

					break;

				}
			}
		}

		this.changed.emit();
	}

	static reset (): void {

		while ( this.scene.children.length > 0 ) {

			let obj = this.scene.children[ 0 ];

			this.scene.remove( obj );

			this.disposeHierarchy( obj, SceneService.disposeNode );

		}

		this.objects = [];

		this.changed.emit();
	}

	static select ( object: Object3D ): void {

		throw new Error( 'Not implemented' );

	}

	public static disposeHierarchy ( node, callback ) {

		for ( let i = node.children.length - 1; i >= 0; i-- ) {

			const child = node.children[ i ];

			this.disposeHierarchy( child, callback );

			callback( child );

		}
	}

	static removeWithChildren ( object: Object3D, raycasting: boolean = false ) {

		if ( !object ) return;

		while ( object.children.length > 0 ) {

			this.disposeNode( object.children[ 0 ] );

		}

		this.remove( object, raycasting );
	}

	private static disposeNode ( node ) {

		if ( node instanceof Mesh ) {

			node.parent.remove( node );
			node.parent = undefined;

			if ( node.geometry ) {

				node.geometry.dispose();

			}

			let material: any = node.material;

			if ( material ) {

				if ( material.map ) material.map.dispose();
				if ( material.lightMap ) material.lightMap.dispose();
				if ( material.bumpMap ) material.bumpMap.dispose();
				if ( material.normalMap ) material.normalMap.dispose();
				if ( material.specularMap ) material.specularMap.dispose();
				if ( material.envMap ) material.envMap.dispose();

				material.dispose();
			}

		} else if ( node instanceof Object3D ) {

			node.parent.remove( node );
			node.parent = undefined;

		} else if ( node instanceof GameObject ) {

			node.parent.remove( node );
			node.parent = undefined;

		} else {

			throw new Error( 'unknown type' );

		}
	}
}
