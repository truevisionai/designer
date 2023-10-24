/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import * as THREE from 'three';
import { Group, Mesh, Object3D } from 'three';
import { GameObject } from '../game-object';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';

@Injectable( {
	providedIn: 'root'
} )
export class SceneService {

	public static scene: THREE.Scene = new THREE.Scene;
	public static renderer: THREE.WebGLRenderer;
	public static changed = new EventEmitter();

	private static editorLayer: Group;
	private static mainLayer: Group;
	private static toolLayer: Group;

	constructor () {

		SceneService.editorLayer = new Group();
		SceneService.editorLayer.name = 'Editor';

		SceneService.mainLayer = new Group();
		SceneService.mainLayer.name = 'Main';

		SceneService.toolLayer = new Group();
		SceneService.toolLayer.name = 'Tool';

		SceneService.scene.add( SceneService.editorLayer );
		SceneService.scene.add( SceneService.mainLayer );
		SceneService.scene.add( SceneService.toolLayer );

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

	static addEditorObject ( object: Object3D ) {

		this.editorLayer.add( object );

		this.changed.emit();
	}

	static addToolObject ( object: Object3D ): void {

		this.toolLayer.add( object );

		this.changed.emit();
	}

	static removeToolObjects (): void {

		this.toolLayer.children.forEach( object => this.toolLayer.remove( object ) );

		this.changed.emit();

	}

	static removeFromTool ( object: Object3D, fireEvent = true ): void {

		if ( object == null ) return;

		this.toolLayer.remove( object );

		if ( fireEvent ) this.changed.emit();
	}

	static clear () {

		this.disposeHierarchy( this.mainLayer, this.disposeNode );

		this.disposeHierarchy( this.toolLayer, this.disposeNode );

		this.changed.emit();

	}

	static addToMain ( object: Object3D, raycasting: boolean = true ): void {

		if ( object == null ) return;

		this.mainLayer.add( object );

		this.changed.emit();

	}

	static removeFromMain ( object: Object3D, raycasting: boolean = true ): void {

		if ( object == null ) return;

		this.mainLayer.remove( object );

		this.changed.emit();
	}

	private static disposeHierarchy ( node, callback ) {

		for ( let i = node.children.length - 1; i >= 0; i-- ) {

			const child = node.children[ i ];

			this.disposeHierarchy( child, callback );

			callback( child );

		}
	}

	private static disposeNode ( node: any ) {

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

			console.error( 'unknown type' );

		}
	}
}
