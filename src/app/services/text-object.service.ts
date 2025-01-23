/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TextObject3d } from 'app/objects/text-object';
import { ColorUtils } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, FrontSide, MeshBasicMaterial, ShapeGeometry } from "three";
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Log } from "../core/utils/log";

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

	createFromText ( text: string, size: number = 1, color: any = ColorUtils.WHITE ): TextObject3d {

		const geometry = this.createTextGeometry( text, size );

		const material = new MeshBasicMaterial( {
			color: color,
			side: FrontSide
		} );

		return this.createTextObject( text, size, geometry, material );

	}

	createWithMaterial ( text: string, size: number = 1, material: MeshBasicMaterial ): TextObject3d {

		const geometry = this.createTextGeometry( text, size );

		return this.createTextObject( text, size, geometry, material );

	}

	updateText ( textObject: TextObject3d, text: string ): void {

		textObject.geometry.dispose();

		textObject.geometry = this.createTextGeometry( text, textObject.size );

	}

	private createTextObject ( text: string, size: number, geometry: BufferGeometry, material: MeshBasicMaterial ): any {

		return new TextObject3d( text, size, geometry, material );

	}

	private createTextGeometry ( text: string, size: number = 1 ): BufferGeometry {

		if ( !this.font ) {
			Log.error( 'Font not loaded' );
			return new BufferGeometry();
		}

		const shapes = this.font.generateShapes( text, size );

		const geometry = new ShapeGeometry( shapes );

		geometry.computeBoundingBox();

		const xMid = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

		geometry.translate( xMid, 0, 0 );

		return geometry;

	}

}
