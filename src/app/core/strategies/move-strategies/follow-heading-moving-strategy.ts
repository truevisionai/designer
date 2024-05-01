import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { Position } from 'app/scenario/models/position';
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { MovingStrategy } from './move-strategy';
import { AbstractControlPoint } from "../../../objects/abstract-control-point";
import { AbstractSpline } from 'app/core/shapes/abstract-spline';


export class FollowHeadingMovingStrategy extends MovingStrategy<AbstractControlPoint> {

	getPosition ( event: PointerEventData, target: AbstractControlPoint ): Position {

		const pointerPointer = event.point.clone();

		let targetHdg = target[ 'hdg' ];

		const spline = target[ 'spline' ];

		if ( spline instanceof AbstractSpline ) {

			const index = spline.controlPoints.indexOf( target );

			if ( index == 1 ) {
				targetHdg = spline.controlPoints[ 0 ][ 'hdg' ] || targetHdg;
			}

		}

		// the new adjusted position should be the mouse position projected on the heading of the point
		const projected = target.position.clone().add( new Vector3( Math.cos( targetHdg ), Math.sin( targetHdg ), 0 ).multiplyScalar( pointerPointer.sub( target.position ).dot( new Vector3( Math.cos( targetHdg ), Math.sin( targetHdg ), 0 ) ) ) );

		return new WorldPosition( projected );

	}

}
