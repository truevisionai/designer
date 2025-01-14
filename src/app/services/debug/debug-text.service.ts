/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TextObject3d } from 'app/objects/text-object';
import { TextObjectService } from 'app/services/text-object.service';
import { FrontSide, MeshBasicMaterial } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class DebugTextService {

	private debugTextMaterial = new MeshBasicMaterial( {
		color: 0xffffff,
		side: FrontSide,
		depthTest: false,
		depthWrite: false,
	} );

	constructor (
		private textObjectService: TextObjectService
	) { }

	createTextObject ( text: string, size: number = 1 ): TextObject3d {

		return this.textObjectService.createWithMaterial( text, size, this.debugTextMaterial );

	}

	updateText ( object3d: TextObject3d, text: string ): void {

		this.textObjectService.updateText( object3d, text );

	}

	calculateTextSize ( cameraDistance: number ): number {

		const minTextSize = 1; // minimum text size
		const maxTextSize = 30; // maximum text size
		const minCameraDistance = 10; // minimum expected camera distance
		const maxCameraDistance = 1000; // maximum expected camera distance

		let textSize: number;

		if ( cameraDistance <= minCameraDistance ) {

			textSize = minTextSize;

		} else if ( cameraDistance >= maxCameraDistance ) {

			textSize = maxTextSize;

		} else {

			// Linear interpolation between minTextSize and maxTextSize
			const fraction = ( cameraDistance - minCameraDistance ) / ( maxCameraDistance - minCameraDistance );

			textSize = minTextSize + fraction * ( maxTextSize - minTextSize );

		}

		textSize = Math.min( Math.max( textSize, minTextSize ), maxTextSize ); // Clamping the value

		return textSize;

	}
}
