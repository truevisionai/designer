/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TextObject3d } from 'app/objects/text-object';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { DebugTextService } from 'app/services/debug/debug-text.service';
import { ToolTipService, TooltipRef } from 'app/services/debug/tool-tip.service';
import { SceneService } from 'app/services/scene.service';
import { Vector3 } from 'app/core/maths';

@Injectable( {
	providedIn: 'root'
} )
export class MeasurementToolService {

	constructor (
		public debugService: DebugDrawService,
		public debugTextService: DebugTextService,
		public toolTipService: ToolTipService,
		public controlPointFactory: ControlPointFactory,
	) {
	}

	showToolTipAt ( text: string, position: Vector3 ): any {

		return this.toolTipService.createFrom3D( text, position );

	}

	updateToolTip ( id: number, text: string ): void {

		this.toolTipService.updateTooltipContent( id, text );

	}

	removeToolTip ( toolTip: TooltipRef ): void {

		this.toolTipService.removeToolTip( toolTip );

	}

	showTextAt ( text: string, position: Vector3, size: number ): any {

		const textObject = this.debugTextService.createTextObject( text, size );

		textObject.position.copy( position );

		SceneService.addToolObject( textObject );

		return textObject;
	}

	updateText ( object: TextObject3d, text: string ): void {

		this.debugTextService.updateText( object, text );

	}

}
