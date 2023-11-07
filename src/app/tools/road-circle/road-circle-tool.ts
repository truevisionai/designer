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

	private isDragging = false;

	private debug = false;

	constructor ( private circleRoadService: RoadCircleService ) {

		super();

	}

	get radius () {

		return Math.max( 10, this.currentRadius || 0 );

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

		// this.circleRoadService.showRoadNodes( road );

	}

	onPointerDownSelect ( e: PointerEventData ) {

		if ( this.debug ) console.log( 'onPointerDownSelect', e, this.isDragging, this.isPointerDown, this.currentRadius );

		this.circleRoadService.init( this.pointerDownAt, e.point, this.radius );

		this.isDragging = true;

	}

	onPointerUp ( e: PointerEventData ) {

		if ( this.debug ) console.log( 'onPointerUp', e, this.isDragging, this.isPointerDown, this.currentRadius );

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isDragging ) return;

		this.circleRoadService.createRoads();

		this.currentRadius = 0;

		this.isDragging = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( this.debug ) console.log( 'onPointerMoved', e, this.isDragging, this.isPointerDown, this.currentRadius );

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isPointerDown ) return;

		if ( !this.pointerDownAt ) return;

		if ( !this.isDragging ) return;

		this.pointerLastAt = e.point;

		this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

		this.circleRoadService.update( this.radius, this.pointerLastAt );
	}

}
