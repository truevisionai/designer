import { Injectable } from "@angular/core";
import { BaseCreationStrategy } from "app/core/interfaces/base-creation-strategy";
import { ValidationResult, ValidationFailed, ValidationPassed } from "app/core/interfaces/creation-strategy";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { PointerEventData } from "app/events/pointer-event-data";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { RoadControlPoint } from "app/objects/road/road-control-point";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { RoadService } from "app/services/road/road.service";
import { SplineService } from "app/services/spline/spline.service";


@Injectable( {
	providedIn: 'root'
} )
export class PointCreationRoadToolStrategy extends BaseCreationStrategy<AbstractControlPoint> {

	constructor (
		private splineService: SplineService,
		private roadService: RoadService
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

		const hasSuccessor = spline.hasSuccessor();
		const hasPredecessor = spline.hasPredecessor();

		const clickedSameRoad = this.isSameRoadClicked( event, spline );
		const clickedOtherRoad = !clickedSameRoad;

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

		const clickedSameRoad = this.isSameRoadClicked( event, spline );

		let index = null;

		if ( clickedSameRoad ) {
			index = this.splineService.findIndex( spline, event.point );
		}

		const point = ControlPointFactory.createControl( spline, event.point, index );

		point.userData.insert = clickedSameRoad;

		return point;

	}

	isSameRoadClicked ( event: PointerEventData, spline: AbstractSpline ): boolean {

		const roadCoord = this.roadService.findRoadCoord( event.point );

		return roadCoord ? roadCoord.road.spline === spline : false;

	}

}
