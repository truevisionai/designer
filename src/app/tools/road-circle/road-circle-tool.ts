/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { TextObject } from 'app/modules/three-js/objects/text-object';
import { Vector3 } from 'three';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadCircleService } from "../../services/road/road-circle.service";

export class RoadCircleTool extends BaseTool {

	public name: string = 'RoadCircleTool';
	public toolType = ToolType.RoadCircle;

	private pointerLastAt: Vector3;
	private currentRadius: number = 0;

	private circleRoadService: RoadCircleService;

	constructor () {

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

		// this.map.getRoads().forEach( road => road.hideHelpers() );

		// this.clearToolObjects();

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.initCircle( this.pointerDownAt, e.point, this.radius );
	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.createRoads();

		this.circleRoadService = null;
		this.currentRadius = 0;
	}

	createRoads () {

		if ( this.circleRoadService ) this.circleRoadService.createRoads();

	}

	onPointerMoved ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isPointerDown ) return;
		if ( !this.pointerDownAt ) return;

		this.pointerLastAt = e.point;

		this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

		if ( this.circleRoadService ) this.updateCircle( this.pointerLastAt, this.radius );
	}

	initCircle ( centre: Vector3, end: Vector3, radius: number ) {

		this.circleRoadService = new RoadCircleService( centre, end, radius );

	}

	updateCircle ( end: Vector3, radius: number ) {

		if ( !this.circleRoadService ) return;

		this.circleRoadService.update( radius, end );

	}

}
