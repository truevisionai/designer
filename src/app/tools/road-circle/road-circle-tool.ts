/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { TextObject } from 'app/modules/three-js/objects/text-object';
import { Vector3 } from 'three';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadCircleService } from "../../services/road/road-circle.service";
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

export class RoadCircleTool extends BaseTool {

	public name: string = 'RoadCircleTool';
	public toolType = ToolType.RoadCircle;

	private pointerLastAt: Vector3;
	private currentRadius: number = 0;

	constructor ( private circleRoadService: RoadCircleService ) {

		super();

	}

	get radius () {
		return Math.max( 7.5, this.currentRadius || 0 );
	}

	init () {

		// HACK: to load the font
		const tempText = new TextObject( '', new Vector3() );
		setTimeout( () => tempText.remove(), 2000 );

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

	}

	onRoadCreated ( road: TvRoad ): void {

		this.circleRoadService.showRoadNodes( road );

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.circleRoadService.init( this.pointerDownAt, e.point, this.radius );
	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.circleRoadService.createRoads();

		this.currentRadius = 0;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isPointerDown ) return;
		if ( !this.pointerDownAt ) return;

		this.pointerLastAt = e.point;

		this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

		this.circleRoadService.update( this.radius, this.pointerDownAt );
	}

}
