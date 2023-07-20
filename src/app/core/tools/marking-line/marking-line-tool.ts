/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { ObjectTypes } from '../../../modules/tv-map/models/tv-common';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { TvObjectMarking } from '../../../modules/tv-map/models/tv-object-marking';
import { Crosswalk, TvCornerRoad, TvObjectOutline, TvRoadObject } from '../../../modules/tv-map/models/tv-road-object';
import { ToolType } from '../../models/tool-types.enum';
import { SceneService } from '../../services/scene.service';
import { ControlPointStrategy } from '../../snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from '../../snapping/select-strategies/on-road-strategy';
import { BaseTool } from '../base-tool';

export class MarkingLineTool extends BaseTool {

	name: string = 'MarkingLineTool';

	toolType = ToolType.MarkingLine;

	roadObject: TvRoadObject;

	roadStrategy = new OnRoadStrategy();

	controlPointStrategy = new ControlPointStrategy<TvCornerRoad>();

	coords: TvRoadCoord[] = [];
	point: TvCornerRoad;
	crosswalk: Crosswalk;

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

		const coord = this.roadStrategy.onPointerDown( pointerEventData );

		this.point = this.controlPointStrategy.onPointerDown( pointerEventData );

		if ( this.point ) {
			this.crosswalk = this.point.parent as Crosswalk;
			return
		}

		if ( !coord ) return;

		this.coords.push( coord );

		if ( this.coords.length < 2 ) return;

		const crosswalk = this.crosswalk = new Crosswalk( coord.s, coord.t, this.coords );

		SceneService.add( crosswalk );

		coord.road.addRoadObjectInstance( crosswalk );

		console.log( 'crosswalk', crosswalk );

		this.coords = [];
	}

	onPointerMoved ( pointerEventData: PointerEventData ) {

		if ( this.point?.isSelected && this.pointerDownAt ) {
			this.point?.copyPosition( pointerEventData.point );
			return;
		}

		this.point = this.controlPointStrategy.onPointerMoved( pointerEventData );

		console.log( 'point', this.point, pointerEventData.intersections );

		if ( this.point ) return;

		const coord = this.roadStrategy.onPointerMoved( pointerEventData );

		console.log( coord );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		console.log( 'onPointerUp', pointerEventData, this.point );

		if ( this.point?.isSelected && this.pointerDownAt ) {
			console.log( 'onPointerUp', pointerEventData, this.point );
			this.point?.copyPosition( pointerEventData.point );
			this.crosswalk?.update();
			return;
		}

	}
}
