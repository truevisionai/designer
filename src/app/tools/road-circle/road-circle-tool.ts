/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadCircleToolService } from "./road-circle-tool.service";
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Environment } from 'app/core/utils/environment';


export class RoadCircleTool extends BaseTool {

	public name: string = 'RoadCircleTool';

	public toolType = ToolType.RoadCircle;

	private pointerLastAt: Vector3;

	private currentRadius: number = 0;

	private isDragging = false;

	private debug = !Environment.production;

	constructor ( private tool: RoadCircleToolService ) {

		super();

	}

	get radius () {

		return Math.max( 10, this.currentRadius || 0 );

	}

	init () {


	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.onToolDisabled();

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadAdded( object );

		} else if ( object instanceof Array ) {

			object.forEach( object => this.onObjectAdded( object ) );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadRemoved( object );

		} else if ( object instanceof Array ) {

			object.forEach( object => this.onObjectRemoved( object ) );

		}

	}


	onRoadAdded ( road: TvRoad ) {

		this.tool.addRoad( road );

	}

	onRoadRemoved ( road: TvRoad ) {

		this.tool.removeRoad( road );

	}

	onPointerDownSelect ( e: PointerEventData ) {

		if ( this.debug ) console.log( 'onPointerDownSelect', e, this.isDragging, this.isPointerDown, this.currentRadius );

		this.tool.init( this.pointerDownAt, e.point, this.radius );

		this.isDragging = true;

	}

	onPointerUp ( e: PointerEventData ) {

		if ( this.debug ) console.log( 'onPointerUp', e, this.isDragging, this.isPointerDown, this.currentRadius );

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isDragging ) return;

		const roads = this.tool.createRoads();

		this.executeAddObject( roads );

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

		this.tool.update( this.radius, this.pointerLastAt );
	}

}
