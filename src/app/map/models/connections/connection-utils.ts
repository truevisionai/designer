import { Vector3, Vector2, MathUtils } from "three";
import { TurnType, TvContactPoint } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { TvRoadCoord } from "../TvRoadCoord";

// Configurable thresholds
const STRAIGHT_THRESHOLD = 10; // degrees
const CROSS_PRODUCT_EPSILON = 1e-10; // threshold for zero determination

export function determineTurnType ( entry: TvLaneCoord | TvRoadCoord, exit: TvLaneCoord | TvRoadCoord ): TurnType {

	// TODO: for now, if spline is same then it is straight
	// We can improve this later
	if ( entry.road.spline.equals( exit.road.spline ) ) {
		return TurnType.STRAIGHT;
	}

	const entryPosition = entry.road.getPosThetaByContact( entry.contact );
	const exitPosition = exit.road.getPosThetaByContact( exit.contact );

	if ( entry.contact == TvContactPoint.START ) {
		entryPosition.rotateDegree( 180 );
	}

	if ( exit.contact == TvContactPoint.START ) {
		exitPosition.rotateDegree( 180 );
	}

	return findTurnType( entryPosition.position, exitPosition.position, entryPosition.normalizedHdg );
}

// eslint-disable-next-line max-lines-per-function
function findTurnType ( entry: Vector3, exit: Vector3, entryHeading: number ): TurnType {

	// Create vectors for positions of A and B
	const positionA = new Vector2( entry.x, entry.y );
	const positionB = new Vector2( exit.x, exit.y );

	// Check for extremely close points to avoid numerical instability
	if ( positionA.distanceTo( positionB ) < 0.0001 ) {
		return TurnType.STRAIGHT;
	}

	// Calculate vector from A to B
	const vectorAB = new Vector2().subVectors( positionB, positionA ).normalize();

	// Create heading vector for A
	const headingVector = new Vector2( Math.cos( entryHeading ), Math.sin( entryHeading ) ).normalize();

	// Calculate dot product with normalized vectors
	const dot = headingVector.dot( vectorAB );

	// / Handle numerical precision issues near ±1
	const clampedDot = Math.max( -1, Math.min( 1, dot ) );
	const angleRadians = Math.acos( clampedDot );
	const angleDegrees = MathUtils.radToDeg( angleRadians );

	// Calculate the determinant (similar to cross product z-component in 3D) to determine direction
	const crossZ = headingVector.x * vectorAB.y - headingVector.y * vectorAB.x;

	if ( Math.abs( angleDegrees ) <= STRAIGHT_THRESHOLD ) {

		return TurnType.STRAIGHT;

	} else if ( Math.abs( crossZ ) < CROSS_PRODUCT_EPSILON ) {

		// Special case: almost exactly 180 degrees
		return TurnType.STRAIGHT;

	} else if ( crossZ > 0 ) {

		return TurnType.LEFT;

	} else {

		return TurnType.RIGHT;

	}

}


// eslint-disable-next-line max-lines-per-function
function determineConnectionType ( incomingCoord: TvLaneCoord, outgoingCoord: TvLaneCoord ): string {

	const incomingLaneId = incomingCoord.lane.id;
	const outgoingLaneId = outgoingCoord.lane.id;

	if ( incomingCoord.contact === TvContactPoint.START ) {

		if ( incomingLaneId === outgoingLaneId ) {
			return "straight";
		} else if ( incomingLaneId > outgoingLaneId ) {
			return "left";
		} else {
			return "right";
		}

	} else { // TvContactPoint.END
		if ( incomingLaneId === outgoingLaneId ) {
			return "straight";
		} else if ( incomingLaneId < outgoingLaneId ) {
			return "left";
		} else {
			return "right";
		}
	}

}
