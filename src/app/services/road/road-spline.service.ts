import { Injectable } from '@angular/core';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvContactPoint, TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Vector3 } from 'three';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseService } from '../base.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSplineService extends BaseService {

	updateRoadSpline ( spline: AbstractSpline, rebuild: boolean = false ) {

		if ( spline.controlPoints.length < 2 ) return;

		spline.getRoadSegments().forEach( segment => {

			if ( segment.roadId == -1 ) return;

			const road = this.map.getRoadById( segment.roadId );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			if ( rebuild ) this.rebuildRoad( road );

		} );

	}

	rebuildSplineRoads ( spline: AbstractSpline ): void {

		this.updateRoadSpline( spline, true );

	}

	addRoadSegment ( road: TvRoad ) {

		const spline = road.spline;

		if ( spline == null ) return;

		this.map.addSpline( spline );

		// if no road segments are present in the spline,
		// then add the road this
		spline.addRoadSegment( road.sStart, road.id );

	}

	removeRoadSegment ( road: TvRoad ) {

		const spline = road.spline;

		if ( spline == null ) return;

		// get road segment and update if next road segment exists
		// this is to make sure we maintains gaps if intended
		const segment = spline.getRoadSegments().find( i => i.roadId == road.id );

		if ( segment == null ) return;

		const nextSegment = spline.getRoadSegments().find( i => i.start > segment.start );

		if ( nextSegment ) {

			// if next segment exists,
			segment.roadId = -1;

		} else {

			spline.removeRoadSegmentByRoadId( road.id );


		}

		if ( spline.getRoadSegments().length == 0 ) {

			this.map.removeSpline( spline );

		}
	}

	createSplineFromNodes ( firstNode: RoadNode, secondNode: RoadNode ) {

		if ( firstNode == null ) throw new Error( 'firstNode is null' );
		if ( secondNode == null ) throw new Error( 'secondNode is null' );

		const a = firstNode.getPosition().toVector3();
		const b = secondNode.getPosition().toVector3();

		let aDirection: Vector3, bDirection: Vector3;

		if ( firstNode.contact === TvContactPoint.START ) {
			aDirection = firstNode.getPosition().toDirectionVector().multiplyScalar( -1 );
		} else {
			aDirection = firstNode.getPosition().toDirectionVector();
		}

		if ( secondNode.contact === TvContactPoint.START ) {
			bDirection = secondNode.getPosition().toDirectionVector().multiplyScalar( -1 );
		} else {
			bDirection = secondNode.getPosition().toDirectionVector();
		}

		return this.createSpline( a, aDirection, b, bDirection );
	}

	createRampRoadSpline ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide ): AbstractSpline {

		if ( entry == null ) throw new Error( 'entry is null' );
		if ( exit == null ) throw new Error( 'exit is null' );
		if ( side == null ) throw new Error( 'side is null' );

		// const nodes = this.getSplinePositions( entry, exit, side );

		const spline = new AutoSplineV2();

		// spline.addControlPointAt( nodes.start )
		// spline.addControlPointAt( nodes.a2.toVector3() )
		// spline.addControlPointAt( nodes.b2.toVector3() )
		// spline.addControlPointAt( nodes.end )

		// spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

		return spline;
	}

	createManeuverSpline ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide = TvLaneSide.RIGHT ): AbstractSpline {

		if ( entry == null ) throw new Error( 'entry is null' );
		if ( exit == null ) throw new Error( 'exit is null' );
		if ( side == null ) throw new Error( 'side is null' );

		return this.createSpline( entry.position, entry.direction, exit.position, exit.direction );
	}

	/**
	 * returns a spline that connects the entry and exit on the junction
	 *
	 * @param entry
	 * @param exit
	 * @param side
	 * @returns
	 */
	createJunctionSpline ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide = TvLaneSide.RIGHT ): AbstractSpline {

		if ( entry == null ) throw new Error( 'entry is null' );
		if ( exit == null ) throw new Error( 'exit is null' );
		if ( side == null ) throw new Error( 'side is null' );

		// const entryPosition = entry.position;
		const entryDirection = entry.getJunctionPosTheta().toDirectionVector();

		// const exitPosition = exit.position;
		const exitDirection = exit.getJunctionPosTheta().toDirectionVector();

		const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
		const aPosTheta = new TvPosTheta();
		const entryPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );

		const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
		const bPosTheta = new TvPosTheta();
		const exitPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );

		return this.createSpline( entryPosition, entryDirection, exitPosition, exitDirection );
	}

	createSpline ( v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		if ( v1 == null ) throw new Error( 'entry is null' );
		if ( v1Direction == null ) throw new Error( 'entryDirection is null' );
		if ( v4 == null ) throw new Error( 'exit is null' );
		if ( v4Direction == null ) throw new Error( 'exitDirection is null' );

		// directions must be normalized
		const d1 = v1Direction.clone().normalize();
		const d4 = v4Direction.clone().normalize();

		const distanceAB = v1.distanceTo( v4 );

		const v2 = v1.clone().add( d1.clone().multiplyScalar( distanceAB / 4 ) );
		const v3 = v4.clone().add( d4.clone().multiplyScalar( distanceAB / 4 ) );

		const spline = new AutoSplineV2();

		spline.addControlPointAt( v1 );
		spline.addControlPointAt( v2 );
		spline.addControlPointAt( v3 );
		spline.addControlPointAt( v4 );

		return spline;
	}

	// end position is always at the exit
	private getSplinePositions ( entry: JunctionEntryObject, exit: JunctionEntryObject, laneSide: TvLaneSide ) {

		const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
		const aPosTheta = new TvPosTheta();
		const aPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );

		const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
		const bPosTheta = new TvPosTheta();
		const bPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );

		let a2: TvPosTheta;
		let b2: TvPosTheta;

		const distance = aPosition.distanceTo( bPosition ) * 0.3;

		if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( -distance );

		} else if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( -distance );

		}

		return {
			side: laneSide,
			start: aPosition,
			startPos: aPosTheta,
			end: bPosition,
			endPos: bPosTheta,
			a2: a2,
			b2: b2,
		};
	}
}
