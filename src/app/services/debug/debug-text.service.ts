import { Injectable } from '@angular/core';
import { TextObject3d } from 'app/modules/three-js/objects/text-object';
import { TextObjectService } from 'app/tools/marking-point/text-object.service';
import { FrontSide, MeshBasicMaterial } from 'three';

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
}
