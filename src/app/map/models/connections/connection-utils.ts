/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector2, Vector3 } from "three";
import { TurnType, TvContactPoint, TvLaneType, TvOrientation } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { TvRoadCoord } from "../TvRoadCoord";
import { TvRoad } from "../tv-road.model";

// Configurable thresholds
const MIN_DEFLECTION_ANGLE_DEGREES = 5; // aligns with common roadway design tolerances (AASHTO / DMRB)
const MIN_LATERAL_OFFSET_METERS = 1.2; // ≈ one lane width; treat smaller offsets as alignment adjustments
const COLINEAR_EPSILON = 1e-10; // threshold for zero determination

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

	return findTurnType( entryPosition.position, exitPosition.position, entryPosition.normalizedHdg, exitPosition.normalizedHdg );
}

export function findTurnTypeForRampRoad ( entry: TvLaneCoord, exit: TvLaneCoord | Vector3 ): TurnType {

	const entryPosition = entry.posTheta;
	const exitPosition = exit instanceof Vector3 ? exit : exit.position;
	const entryHeading = entry.getLaneHeading();
	const exitHeading = exit instanceof Vector3 ? undefined : exit.getLaneHeading();

	return findTurnType( entryPosition.position, exitPosition, entryHeading, exitHeading );

}

export function findTurnTypeOfConnectingRoad ( connectingRoad: TvRoad ): TurnType {

	const start = connectingRoad.getStartPosTheta();
	const end = connectingRoad.getEndPosTheta();

	return findTurnType( start.position, end.position, start.normalizedHdg, end.normalizedHdg );
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

function findTurnType ( entry: Vector3, exit: Vector3, entryHeading: number, exitHeading?: number ): TurnType {

	// Create vectors for positions of A and B
	const positionA = new Vector2( entry.x, entry.y );
	const positionB = new Vector2( exit.x, exit.y );

	// Check for extremely close points to avoid numerical instability
	const rawVector = new Vector2().subVectors( positionB, positionA );
	const distance = rawVector.length();

	if ( distance < 0.0001 ) {
		return TurnType.STRAIGHT;
	}

	// Calculate vector from A to B
	const vectorAB = rawVector.clone().normalize();

	// Create heading vector for A
	const headingVector = new Vector2( Math.cos( entryHeading ), Math.sin( entryHeading ) ).normalize();

	// Determine the effective deflection using heading difference rather than point offset
	const exitHeadingValue = exitHeading ?? Math.atan2( rawVector.y, rawVector.x );
	const entryHeadingVector = headingVector;
	const exitHeadingVector = new Vector2( Math.cos( exitHeadingValue ), Math.sin( exitHeadingValue ) ).normalize();

	const headingDot = Math.max( -1, Math.min( 1, entryHeadingVector.dot( exitHeadingVector ) ) );
	const headingCross = entryHeadingVector.x * exitHeadingVector.y - entryHeadingVector.y * exitHeadingVector.x;
	const headingAngleDegrees = Math.abs( MathUtils.radToDeg( Math.atan2( headingCross, headingDot ) ) );

	const normalizedCross = headingVector.x * vectorAB.y - headingVector.y * vectorAB.x;
	const lateralDistance = Math.abs( normalizedCross ) * distance;

	const isDeflectionSmall = headingAngleDegrees <= MIN_DEFLECTION_ANGLE_DEGREES;
	const isOffsetSmall = lateralDistance <= MIN_LATERAL_OFFSET_METERS;

	// Treat gentle deflections with minimal lateral shift as straight continuations
	if ( isDeflectionSmall && isOffsetSmall ) {
		return TurnType.STRAIGHT;
	}

	if ( Math.abs( normalizedCross ) < COLINEAR_EPSILON && isDeflectionSmall ) {
		// Special case: almost exactly 0° or 180° - treat as straight/merge
		return TurnType.STRAIGHT;
	}

	const turnIndicator = Math.abs( headingCross ) > COLINEAR_EPSILON ? headingCross : normalizedCross;

	return turnIndicator > 0 ? TurnType.RIGHT : TurnType.LEFT;

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
