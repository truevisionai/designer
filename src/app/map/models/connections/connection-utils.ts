import { MathUtils, Vector2, Vector3 } from "three";
import { TurnType, TvContactPoint, TvLaneType, TvOrientation } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { TvRoadCoord } from "../TvRoadCoord";
import { TvRoad } from "../tv-road.model";

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

export function findTurnTypeForRampRoad ( entry: TvLaneCoord, exit: TvLaneCoord | Vector3 ): TurnType {

	const entryPosition = entry.posTheta;
	const exitPosition = exit instanceof Vector3 ? exit : exit.position;
	const entryHeading = entry.getLaneHeading();

	return findTurnType( entryPosition.position, exitPosition, entryHeading );

}

export function findTurnTypeOfConnectingRoad ( connectingRoad: TvRoad ): TurnType {

	const start = connectingRoad.getStartPosTheta();
	const end = connectingRoad.getEndPosTheta();

	return findTurnType( start.position, end.position, start.normalizedHdg );
}

export function findOrientation ( entry: TvLaneCoord, exit: TvLaneCoord | Vector3 ): TvOrientation {

	const entryPosition = entry.posTheta.position;
	const entryHeading = entry.getLaneDirectionVector();
	const exitPosition = exit instanceof Vector3 ? exit : exit.position;

	const vectorToExit = exitPosition.sub( entryPosition );

	// Entry heading vector
	const entryHeadingVector = entryHeading.normalize();

	// Dot product to project vectorToExit onto entryHeadingVector
	const dotProduct = vectorToExit.dot( entryHeadingVector );

	// If the dot product is positive, the exit is ahead; if negative, it's behind
	if ( dotProduct >= 0 ) {
		return TvOrientation.PLUS
	}

	return TvOrientation.MINUS;
}

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
