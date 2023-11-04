/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export class TextObject {

	private static font: Font;
	private textMesh: THREE.Mesh;

	private matLite = new THREE.MeshBasicMaterial( {
		color: this.color,
		side: THREE.FrontSide
	} );

	constructor ( private message: string, private position: Vector3, private size: number = 10, private color: number = 0xffffff ) {
		if ( !TextObject.font ) {
			const loader = new FontLoader();
			loader.load( 'assets/fonts/helvetiker_regular.typeface.json', ( font ) => {
				TextObject.font = font;
				this.createText();
			} );
		} else {
			this.createText();
		}
	}

	update ( message: string, position: Vector3, size: number = this.size, color: number = this.color ) {
		// Remove the old text from the scene
		SceneService.removeFromTool( this.textMesh );

		// Update the text properties
		this.message = message;
		this.position = position;
		this.size = size;
		this.color = color;

		// Create the new text
		this.createText();
	}

	updateText ( message: string ) {
		// Remove the old text from the scene
		SceneService.removeFromTool( this.textMesh );

		this.message = message;

		this.createText();
	}

	hide () {
		this.textMesh.visible = false;
	}

	show () {
		this.textMesh.visible = true;
	}

	remove () {
		// Remove the text from the scene
		SceneService.removeFromTool( this.textMesh );
	}

	private createText () {

		const shapes = TextObject.font.generateShapes( this.message, this.size );
		const geometry = new THREE.ShapeGeometry( shapes );
		geometry.computeBoundingBox();

		const xMid = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		geometry.translate( xMid, 0, 0 );

		this.textMesh = new THREE.Mesh( geometry, this.matLite );
		this.textMesh.position.copy( this.position );

		SceneService.addToolObject( this.textMesh );
	}
}
