/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector2, Vector3 } from "three";
import { TurnType, TvContactPoint, TvLaneType, TvOrientation } from "../tv-common";
import { Maths } from "app/utils/maths";
import { TvLaneCoord } from "../tv-lane-coord";
import { TvRoadCoord } from "../TvRoadCoord";
import { TvRoad } from "../tv-road.model";

// Configurable thresholds
const STRAIGHT_THRESHOLD = 10; // degrees
const STRAIGHT_LATERAL_OFFSET_METERS = 1.2; // ≈ one lane width; treat smaller offsets as alignment adjustments
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

	const entryPose = getPoseForCoord( entry, true );
	const exitPose = getPoseForCoord( exit, false );

	return findTurnType( entryPose.position, exitPose.position, entryPose.heading, exitPose.heading );
}

export function findTurnTypeForRampRoad ( entry: TvLaneCoord, exit: TvLaneCoord | Vector3 ): TurnType {

	const entryPose = getPoseForCoord( entry, true );
	const exitPose = exit instanceof Vector3 ? undefined : getPoseForCoord( exit, false );
	const exitPosition = exit instanceof Vector3 ? exit.clone() : exitPose.position;
	const exitHeading = exitPose?.heading;

	return findTurnType( entryPose.position, exitPosition, entryPose.heading, exitHeading );

}

export function findTurnTypeOfConnectingRoad ( connectingRoad: TvRoad ): TurnType {

	const start = connectingRoad.getStartPosTheta();
	const end = connectingRoad.getEndPosTheta();

	return findTurnType( cloneVector3( start.position ), cloneVector3( end.position ), start.normalizedHdg, end.normalizedHdg );
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

	const displacement = new Vector2().subVectors( positionB, positionA );
	const distance = displacement.length();

	// Check for extremely close points to avoid numerical instability
	if ( distance < 0.0001 ) {
		return TurnType.STRAIGHT;
	}

	const directionVector = displacement.clone().normalize();
	const entryVector = new Vector2( Math.cos( entryHeading ), Math.sin( entryHeading ) );
	const referenceExitVector = exitHeading !== undefined ? new Vector2( Math.cos( exitHeading ), Math.sin( exitHeading ) ) : directionVector.clone();

	const headingCross = entryVector.x * referenceExitVector.y - entryVector.y * referenceExitVector.x;
	const headingDot = Math.max( -1, Math.min( 1, entryVector.dot( referenceExitVector ) ) );
	const headingAngleDegrees = Math.abs( MathUtils.radToDeg( Math.atan2( headingCross, headingDot ) ) );

	const lateralOffsetSigned = displacement.dot( Maths.getRightNormalVector( entryHeading ) );
	const lateralDistance = Math.abs( lateralOffsetSigned );

	if ( headingAngleDegrees <= STRAIGHT_THRESHOLD && lateralDistance <= STRAIGHT_LATERAL_OFFSET_METERS ) {
		return TurnType.STRAIGHT;
	}

	if ( headingAngleDegrees > STRAIGHT_THRESHOLD ) {
		return headingCross < 0 ? TurnType.RIGHT : TurnType.LEFT;
	}

	if ( lateralDistance > STRAIGHT_LATERAL_OFFSET_METERS ) {
		return lateralOffsetSigned > 0 ? TurnType.RIGHT : TurnType.LEFT;
	}

	const displacementCross = entryVector.x * directionVector.y - entryVector.y * directionVector.x;

	if ( Math.abs( displacementCross ) < CROSS_PRODUCT_EPSILON ) {
		return TurnType.STRAIGHT;
	}

	return displacementCross < 0 ? TurnType.RIGHT : TurnType.LEFT;

}


function getPoseForCoord ( coord: TvLaneCoord | TvRoadCoord, isEntry: boolean ): { position: Vector3, heading: number } {

	if ( isLaneCoord( coord ) ) {

		return {
			position: cloneVector3( coord.position as Vector3 ),
			heading: coord.getLaneHeading(),
		};

	}

	const pose = coord.road.getPosThetaByContact( coord.contact );

	if ( isEntry && coord.contact === TvContactPoint.START ) {
		pose.rotateDegree( 180 );
	}

	return {
		position: cloneVector3( pose.position ),
		heading: pose.normalizedHdg,
	};
}

function isLaneCoord ( coord: TvLaneCoord | TvRoadCoord ): coord is TvLaneCoord {
	return ( coord as TvLaneCoord ).lane !== undefined;
}

function cloneVector3 ( source: Vector3 ): Vector3 {
	return new Vector3( source.x, source.y, source.z );
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
