import { Injectable } from '@angular/core';
import { TextObject3d } from 'app/modules/three-js/objects/text-object';
import { FrontSide, MeshBasicMaterial, ShapeGeometry } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';

@Injectable( {
	providedIn: 'root'
} )
export class TextObjectService {

	private font: Font;

	private defaultMaterial = new MeshBasicMaterial( {
		color: 0xffffff,
		side: FrontSide
	} );

	constructor () {

		const loader = new FontLoader();

		loader.load( 'assets/fonts/helvetiker_bold.typeface.json', ( font ) => {
			this.font = font;
		} );

	}

	createTextObject ( text: string, size: number = 1 ): TextObject3d {

		const shapes = this.font.generateShapes( text, size );

		console.log( shapes );

		const geometry = new ShapeGeometry( shapes );

		geometry.computeBoundingBox();

		const xMid = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

		geometry.translate( xMid, 0, 0 );

		return new TextObject3d( text, size, geometry, this.defaultMaterial.clone() );

	}


}
