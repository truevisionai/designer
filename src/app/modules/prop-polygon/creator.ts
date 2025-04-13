import { Injectable } from "@angular/core";
import { FreeValidationCreationStrategy } from "app/core/interfaces/base-creation-strategy";
import { ValidationFailed, ValidationPassed, ValidationResult } from "app/core/interfaces/creation-strategy";
import { PointerEventData } from "app/events/pointer-event-data";
import { PropManager } from "app/managers/prop-manager";
import { PropModel } from "app/map/prop-point/prop-model.model";
import { PropPolygon } from "app/map/prop-polygon/prop-polygon.model";
import { Vector3 } from "three";
import { PropPolygonPoint } from "./objects/prop-polygon-point";


@Injectable()
export class PropPolygonCreator extends FreeValidationCreationStrategy<PropPolygon> {

	getPropModel (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data?.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data?.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	validate ( event: PointerEventData, lastSelected?: any ): ValidationResult {

		if ( !this.getPropModel() ) {
			return new ValidationFailed( 'Select a prop from the project browser' );
		}

		return new ValidationPassed();

	}

	canCreate ( event: PointerEventData, lastSelected?: PropPolygon | PropPolygonPoint | null ): boolean {

		return lastSelected === null;

	}

	createObject ( event: PointerEventData, lastSelected?: PropPolygon | PropPolygonPoint | null ): PropPolygon {

		const prop = this.getPropModel();

		const polygon = new PropPolygon( prop.guid );

		const point = new PropPolygonPoint( polygon );

		point.position.copy( event.point );

		polygon.spline.addControlPoint( point );

		return polygon;

	}

}

@Injectable()
export class PropPolygonPointCreator extends FreeValidationCreationStrategy<PropPolygonPoint> {

	canCreate ( event: PointerEventData, lastSelected?: PropPolygon | PropPolygonPoint | null ): boolean {

		return this.getPolygon( lastSelected ) !== undefined;

	}

	getPolygon ( lastSelected: PropPolygon | PropPolygonPoint ): PropPolygon {

		if ( lastSelected instanceof PropPolygon ) {

			return lastSelected;

		} else if ( lastSelected instanceof PropPolygonPoint ) {

			return lastSelected.polygon;

		}

	}

	createObject ( event: PointerEventData, lastSelected?: PropPolygon | PropPolygonPoint | null ): PropPolygonPoint {

		const polygon = this.getPolygon( lastSelected );

		const point = new PropPolygonPoint( polygon );

		point.position.copy( event.point );

		return point;

	}

}
