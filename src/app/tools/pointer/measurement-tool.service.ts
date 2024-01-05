import { Injectable } from '@angular/core';
import { TextObject3d } from 'app/modules/three-js/objects/text-object';
import { DebugTextService } from 'app/services/debug/debug-text.service';
import { SceneService } from 'app/services/scene.service';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class MeasurementToolService {

	constructor (
		private debugTextService: DebugTextService,
	) { }

	showTextAt ( text: string, position: Vector3, size: number ) {

		const textObject = this.debugTextService.createTextObject( text, size );

		textObject.position.copy( position );

		SceneService.addToolObject( textObject );

		return textObject;
	}

	updateText ( object: TextObject3d, text: string ) {

		this.debugTextService.updateText( object, text );

	}

}
