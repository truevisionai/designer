/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadObject } from '../../../modules/tv-map/models/tv-road-object';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';


class OnRoadStrategy {
	onPointerDown ( pointerEventData: PointerEventData ) {
	}

	onPointerMoved ( pointerEventData: PointerEventData ) {
	}

	onPointerUp ( pointerEventData: PointerEventData ) {
	}
}


export class MarkingLineTool extends BaseTool {

	name: string = 'MarkingLineTool';

	toolType = ToolType.MarkingLine;

	markingObject: TvRoadObject;

	strategy = new OnRoadStrategy();

	constructor () {

		super();

	}

	init () {

		super.init();

	}

	enable () {

		super.enable();

		// this.showMarkingObjects();

	}

	disable (): void {

		super.disable();

		// this.hideMarkingObjects();

	}

	onPointerDown ( pointerEventData: PointerEventData ) {

		this.strategy.onPointerDown( pointerEventData );

	}

}
