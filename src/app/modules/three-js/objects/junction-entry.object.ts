/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Color, PointsMaterial, Vector3 } from 'three';
import { TvJunction } from '../../tv-map/models/tv-junction';
import { TvJunctionConnection } from '../../tv-map/models/tv-junction-connection';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { BaseControlPoint } from './control-point';
import { ISelectable } from './i-selectable';

export class JunctionEntryObject extends BaseControlPoint implements ISelectable {

	public static tag = 'junction-dot';

	public contact: TvContactPoint;

	public road: TvRoad;

	public lane: TvLane;

	constructor ( name: string, position: Vector3, contact: TvContactPoint, road: TvRoad, lane: TvLane ) {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const material = new PointsMaterial( {
			size: 20,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.SKYBLUE,
			depthTest: true
		} );

		super( geometry, material );

		this.contact = contact;

		this.road = road;

		this.lane = lane;

		this.name = name;

		if ( position ) this.copyPosition( position );

		this.tag = JunctionEntryObject.tag;

		this.renderOrder = 3;

	}

	get map () {
		return TvMapInstance.map;
	}

	select () {

		this.isSelected = true;

		( this.material as PointsMaterial ).color = new Color( COLOR.RED );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		( this.material as PointsMaterial ).color = new Color( COLOR.SKYBLUE );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	get isEntry (): boolean {
		return ( this.lane.travelDirection === TravelDirection.forward && this.contact === TvContactPoint.END ) ||
			( this.lane.travelDirection === TravelDirection.backward && this.contact === TvContactPoint.START );
	}

	get isExit (): boolean {
		return ( this.lane.travelDirection === TravelDirection.forward && this.contact === TvContactPoint.START ) ||
			( this.lane.travelDirection === TravelDirection.backward && this.contact === TvContactPoint.END );
	}

	get junctionType () {
		return this.isEntry ? TvContactPoint.START : TvContactPoint.END;
	}

	getPosTheta (): TvPosTheta {
		if ( this.contact === TvContactPoint.START ) {
			return this.road.getStartCoord();
		} else {
			return this.road.getEndCoord();
		}
	}

	/**
	 * This adjusts the hdg towards junction entry
	 * @returns the position of the junction entry point
	 */
	getJunctionPosTheta (): TvPosTheta {
		if ( this.contact === TvContactPoint.START ) {
			// rotate by 180 degrees because start road is going away from junction
			return this.road.getStartCoord().rotateRadian( Math.PI );
		} else {
			return this.road.getEndCoord();
		}
	}

	isLastDrivingLane (): boolean {

		if ( this.lane.id < 0 ) {

			const lanesIds = this.lane.laneSection.getRightLanes().filter( lane => lane.type === TvLaneType.driving ).map( l => l.id );

			const lastLaneId = Math.min( ...lanesIds );

			return lastLaneId == this.lane.id;

		} else {

			const lanesIds = this.lane.laneSection.getLeftLanes().filter( lane => lane.type === TvLaneType.driving ).map( l => l.id );

			const lastLaneId = Math.max( ...lanesIds );

			return lastLaneId == this.lane.id;

		}

	}

	isRightMost (): boolean {


	}

	hasJunction ( b: JunctionEntryObject ): TvJunction {

		const entry = this.isEntry ? this : b;
		const exit = this.isExit ? this : b;

		return TvMapInstance.map.findJunction( entry.road, exit.road );
	}


	hasLinkWith ( b: JunctionEntryObject ): boolean {

		if ( !this.hasJunction( b ) ) return false;

		if ( !this.hasConnection( b ) ) return false;

		const connection = this.hasConnection( b );

		const entry = this.isEntry ? this : b;
		const exit = this.isExit ? this : b;

		return connection.laneLink.find( laneLink => laneLink.incomingLane.id === entry.lane.id ) != null;
	}

	get connections (): TvJunctionConnection[] {

		const results = [];

		const junctions = this.map.getJunctions();

		for ( let i = 0; i < junctions.length; i++ ) {

			const junction = junctions[ i ];

			junction.getConnections()
				.filter( c => c.incomingRoadId === this.road.id )
				.filter( c => c.contactPoint === this.contact )
				.forEach( c => results.push( c ) );

		}

		return results;

	}

	get links (): TvJunctionLaneLink[] {

		const results = [];

		this.connections.forEach( connection => {

			connection.laneLink.forEach( laneLink => {

				if ( laneLink.incomingLane.id === this.lane.id ) {

					results.push( laneLink );

				}

			} );


		} );

		return results;
	}

	hasConnection ( b: JunctionEntryObject ): TvJunctionConnection {

		if ( !this.hasJunction( b ) ) return null;

		const junction = this.hasJunction( b );

		const entry = this.isEntry ? this : b;
		const exit = this.isExit ? this : b;

		return junction.findRoadConnection( entry.road, exit.road );

	}

	canConnect ( right: JunctionEntryObject, type = 'simple' ) {

		// dont merge same road
		if ( this.road.id == right.road.id ) return false;

		// we only want to merge
		// 1 with 1 or
		// -1 with 1 or
		// 1 with -1
		// -1 with -1
		// to ensure we have straight connections first
		if ( type == 'simple' && Math.abs( this.lane.id ) != Math.abs( right.lane.id ) ) return false;

		// don't merge if both are entries
		if ( this.isEntry && right.isEntry ) return false;

		// don't merge if both are exits
		if ( this.isExit && right.isExit ) return false;

		// if
		if ( this.hasLinkWith( right ) ) return false;

		return true;
	}

	isStraightConnection ( b: JunctionEntryObject ): boolean {

		const aPos = this.getJunctionPosTheta();
		const bPos = b.getJunctionPosTheta();

		const sideAngle = aPos.computeSideAngle( bPos );

		if ( sideAngle.angleDiff <= 20 ) {

			return true;

		}

		return false;
	}

	isLeftConnection ( b: JunctionEntryObject ) {

		const aPos = this.getJunctionPosTheta();
		const bPos = b.getJunctionPosTheta();

		const sideAngle = aPos.computeSideAngle( bPos );

		if ( sideAngle.angleDiff >= 20 && sideAngle.side == TvLaneSide.LEFT ) {

			return true;

		}

		return false;
	}

	isRightConnection ( b: JunctionEntryObject ) {

		const aPos = this.getJunctionPosTheta();
		const bPos = b.getJunctionPosTheta();

		const sideAngle = aPos.computeSideAngle( bPos );

		if ( sideAngle.angleDiff >= 20 && sideAngle.side == TvLaneSide.RIGHT ) {

			return true;

		}

		return false;
	}
}
