import { Vector3 } from 'three';
import { TvPosTheta } from '../../../modules/tv-map/models/tv-pos-theta';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectStrategy } from '../select-strategies/select-strategy';
import { RoadTangentPoint } from 'app/modules/three-js/objects/road-tangent-point';

export interface MoveStrategy {
	getPosTheta ( position: Vector3 ): TvPosTheta;

	getVector3 ( s: number ): Vector3;
}

export class RoadPointMovingStrategy implements MoveStrategy {

	constructor ( private point: RoadControlPoint ) { }

	getPosTheta ( position: Vector3 ): TvPosTheta {

		const original = new TvPosTheta( position.x, position.y, position.z, this.point.hdg );;

		if ( this.point.road.isJunction ) {

			// return if point is first or last control point
			if ( this.point.tagindex === 0 ) return original;

			if ( this.point.tagindex === this.point.road.spline.controlPoints.length - 1 ) return original;

			const previous = this.point.road.spline.controlPoints[ this.point.tagindex - 1 ] as RoadControlPoint;

			if ( !previous ) return original;

			const hdg = previous.hdg;

			const final = calculatePointC( this.point.position, hdg, position );

			return new TvPosTheta( final.x, final.y, final.z, hdg );

		}

		return original;
	}

	getVector3 ( s: number ): Vector3 {

		const position = this.point.road.getPositionAt( s );

		return position.toVector3();

	}


}

export class RoadTangentMovingStrategy implements MoveStrategy {

	constructor ( private tangent: RoadTangentPoint ) { }

	getPosTheta ( position: Vector3 ): TvPosTheta {

		// our main point
		const point = this.tangent.controlPoint;

		if ( this.tangent.road.isJunction ) {

			const hdg = point.hdg;

			const final = calculatePointC( this.tangent.position, hdg, position );

			return new TvPosTheta( final.x, final.y, final.z, hdg );

		} else {

			return new TvPosTheta( position.x, position.y, position.z, point.hdg );

		}


	}

	getVector3 ( s: number ): Vector3 {

		const position = this.tangent.road.getPositionAt( s );

		return position.toVector3();

	}


}

// Function to calculate the position of point C
function calculatePointC ( A: Vector3, hdg: number, B: Vector3 ): Vector3 {
	// Step 1: Find the direction vector of A's heading
	const dir_vector_A = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 );

	// Step 2: Find the vector between A and B
	const AB_vector = B.clone().sub( A );

	// Step 3: Project AB_vector onto the direction of dir_vector_A
	const projection_scalar = AB_vector.dot( dir_vector_A );
	const projection_vector = dir_vector_A.clone().multiplyScalar( projection_scalar );

	// Step 4: Calculate the position of point C
	const C = A.clone().add( projection_vector );

	return C;
}

export class RoadPointerStrategy extends SelectStrategy<RoadControlPoint> {

	onPointerDown ( pointerEventData: PointerEventData ): RoadControlPoint {

		throw new Error( 'Method not implemented.' );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): RoadControlPoint {

		throw new Error( 'Method not implemented.' );

	}

	onPointerUp ( pointerEventData: PointerEventData ): RoadControlPoint {

		throw new Error( 'Method not implemented.' );

	}

	dispose (): void {
		throw new Error( 'Method not implemented.' );
	}

}
