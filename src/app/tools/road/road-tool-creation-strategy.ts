/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ValidationFailed, ValidationPassed, ValidationResult } from "../../core/interfaces/creation-strategy";
import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvRoad } from "app/map/models/tv-road.model";
import { SelectionService } from "../selection.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { AutoSpline } from "app/core/shapes/auto-spline-v2";
import { ExplicitSpline } from "app/core/shapes/explicit-spline";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { SplineFactory } from "app/services/spline/spline.factory";
import { SplineService } from "app/services/spline/spline.service";
import { BaseCreationStrategy } from "app/core/interfaces/base-creation-strategy";
import { RoadService } from "app/services/road/road.service";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { RoadControlPoint } from "app/objects/road/road-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class SplineCreationRoadToolStrategy extends BaseCreationStrategy<AbstractSpline> {

	constructor (
		private selectionService: SelectionService,
	) {
		super();
	}

	get selectedRoad (): TvRoad {

		return this.selectionService.findSelectedObject<TvRoad>( TvRoad );

	}

	get selectedSpline (): AbstractSpline | undefined {

		if ( this.selectionService.findSelectedObject( AutoSpline ) ) {

			return this.selectionService.findSelectedObject<AbstractSpline>( AutoSpline );

		} else if ( this.selectionService.findSelectedObject( ExplicitSpline ) ) {

			return this.selectionService.findSelectedObject<AbstractSpline>( ExplicitSpline );

		} else if ( this.selectedRoad ) {

			return this.selectedRoad.spline;

		}
	}

	canCreate ( event: PointerEventData, lastSelected?: object ): boolean {

		return !lastSelected;

	}

	validate ( event: PointerEventData ): ValidationResult {

		return new ValidationPassed();

	}

	createObject ( e: PointerEventData ): AbstractSpline {

		return SplineFactory.createAtPosition( e.point );

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class PointCreationRoadToolStrategy extends BaseCreationStrategy<AbstractControlPoint> {

	constructor (
		private splineService: SplineService,
		private roadService: RoadService,
	) {
		super();
	}

	canCreate ( event: PointerEventData, lastSelected?: any ): boolean {

		return this.checkForSpline( lastSelected ) !== undefined;

	}

	// eslint-disable-next-line max-lines-per-function
	validate ( event: PointerEventData, lastSelected?: any ): ValidationResult {

		const spline = this.checkForSpline( lastSelected );

		if ( !spline ) {
			return new ValidationFailed( 'Select a road to add a control point' );
		}

		const hasSuccessor = spline.hasSuccessor()
		const hasPredecessor = spline.hasPredecessor();

		const roadCoord = this.roadService.findRoadCoord( event.point );
		const clickedSameRoad = roadCoord ? roadCoord.road.spline === spline : false;
		const clickedOtherRoad = roadCoord ? roadCoord.road.spline !== spline : false;

		if ( clickedOtherRoad && hasSuccessor ) {
			return new ValidationFailed( 'Cannot add a control point to a road with a successor' );
		}

		if ( !clickedSameRoad && hasSuccessor ) {
			return new ValidationFailed( 'Cannot add a control point to a road with a successor' );
		}

		let index = null;

		if ( clickedSameRoad ) {
			index = this.splineService.findIndex( spline, event.point );
		}

		if ( index === 0 && hasSuccessor ) {
			return new ValidationFailed( 'Cannot add a control point to the start of a road' );
		}

		if ( index === 0 && hasPredecessor ) {
			return new ValidationFailed( 'Cannot add a control point to the start of a road with a predecessor' );
		}

		if ( index == spline.controlPoints.length - 1 && hasSuccessor && !clickedSameRoad ) {
			return new ValidationFailed( 'Cannot add a control point to the end of a road with a successor' );
		}

		return new ValidationPassed();
	}

	checkForSpline ( lastSelected: any ): AbstractSpline {

		let spline: AbstractSpline;

		if ( lastSelected instanceof AbstractSpline ) {
			spline = lastSelected;
		}

		if ( lastSelected instanceof SplineControlPoint || lastSelected instanceof RoadControlPoint ) {
			spline = lastSelected.spline;
		}

		return spline;
	}

	createObject ( event: PointerEventData, lastSelected?: any ): AbstractControlPoint {

		const spline = this.checkForSpline( lastSelected );

		const roadCoord = this.roadService.findRoadCoord( event.point );

		const clickedSameRoad = roadCoord ? roadCoord.road.spline === spline : false;

		let index = null;

		if ( clickedSameRoad ) {
			index = this.splineService.findIndex( spline, event.point );
		}

		const point = ControlPointFactory.createControl( spline, event.point, index );

		point.userData.insert = clickedSameRoad;

		return point;

	}

}
