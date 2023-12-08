/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import * as THREE from 'three';
import { Group, Material, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D } from 'three';
import { GameObject } from '../core/game-object';

@Injectable( {
	providedIn: 'root'
} )
export class SceneService {

	public static scene: THREE.Scene = new THREE.Scene;
	public static renderer: THREE.WebGLRenderer;
	public static changed = new EventEmitter();

	private static editorLayer: Group = new Group();
	private static mainLayer: Group = new Group();
	private static toolLayer: Group = new Group();

	public static bgForClicks: THREE.Mesh;

	get scene (): THREE.Scene {
		return SceneService.scene;
	}

	constructor () {

		SceneService.editorLayer.name = 'Editor';
		SceneService.mainLayer.name = 'Main';
		SceneService.toolLayer.name = 'Tool';

		SceneService.scene.add( SceneService.editorLayer );
		SceneService.scene.add( SceneService.mainLayer );
		SceneService.scene.add( SceneService.toolLayer );

		SceneService.bgForClicks = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshBasicMaterial( {
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0
		} ) );

		SceneService.bgForClicks.name = 'bgForClicks';

	}

	static raycastableObjects () {

		const raycastableObjects = [];

		this.scene.traverse( object => {

			if ( object instanceof THREE.Points && object.visible ) {

				raycastableObjects.push( object );

			}

		} );

		raycastableObjects.push( this.bgForClicks );

		raycastableObjects.push( this.mainLayer );
		raycastableObjects.push( this.toolLayer );
		raycastableObjects.push( this.editorLayer );

		return raycastableObjects;

	}

	static addEditorObject ( object: Object3D ) {

		this.editorLayer.add( object );

		this.changed.emit();
	}

	static removeFromEditor ( object: Object3D ) {

		if ( object == null ) return;

		this.editorLayer.remove( object );

		this.changed.emit();

	}

	static addToolObject ( object: Object3D ): void {

		// BUG FIX: this is a hack to fix the issue of removing an object from the scene
		if ( object.parent === undefined ) {
			object.parent = null;
		}

		this.toolLayer.add( object );

		this.changed.emit();
	}

	static removeToolObjects (): void {

		this.disposeHierarchy( this.toolLayer, this.disposeNode );

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

			function disposeMaterial ( material: any ) {

				if ( material.map != null || material.map != undefined ) {
					material.map.dispose();
				}

				if ( material.lightMap != null || material.lightMap != undefined ) {
					material.lightMap.dispose();
				}

				if ( material.bumpMap != null || material.bumpMap != undefined ) {
					material.bumpMap.dispose();
				}

				if ( material.normalMap != null || material.normalMap != undefined ) {
					material.normalMap.dispose();
				}

				if ( material.specularMap != null || material.specularMap != undefined ) {
					material.specularMap.dispose();
				}

				if ( material.envMap != null || material.envMap != undefined ) {
					material.envMap.dispose();
				}

				if ( material.alphaMap != null || material.alphaMap != undefined ) {
					material.alphaMap.dispose();
				}

				if ( material.aoMap != null || material.aoMap != undefined ) {
					material.aoMap.dispose();
				}

				if ( material.displacementMap != null || material.displacementMap != undefined ) {
					material.displacementMap.dispose();
				}

				if ( material.emissiveMap != null || material.emissiveMap != undefined ) {
					material.emissiveMap.dispose();
				}

				if ( material.gradientMap != null || material.gradientMap != undefined ) {
					material.gradientMap.dispose();
				}

				if ( material.metalnessMap != null || material.metalnessMap != undefined ) {
					material.metalnessMap.dispose();
				}

				material.dispose();
			}

			if ( node.material instanceof Array ) {

				node.material.forEach( material => {

					disposeMaterial( material );

				} )

			} else if ( node.material instanceof Material ) {

				disposeMaterial( node.material );

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
