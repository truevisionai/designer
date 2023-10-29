/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvRoadLinkChild } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { RoadSegment } from 'app/core/shapes/auto-spline-v2';

export class RemoveRoadCommand extends BaseCommand {

	private connections: TvJunctionConnection[] = [];

	private readonly successorElement: TvRoadLinkChild;
	private readonly predecessorElement: TvRoadLinkChild;

	private segment: RoadSegment;

	constructor ( private road: TvRoad ) {

		super();

		if ( this.road.isJunction ) {

			this.road.junctionInstance?.getConnectionsForRoad( this.road ).forEach( c => {
				this.connections.push( c.clone() );
			} );

		}

		this.predecessorElement = this.road.predecessor;
		this.successorElement = this.road.successor;

		this.segment = this.road.spline.getRoadSegments().find( i => i.road.id == this.road.id );
	}

	execute (): void {

		this.map.deleteRoad( this.road );

		this.road.spline.removeRoadSegment( this.segment );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( this.road, true ) );
	}

	undo (): void {

		this.map.addRoad( this.road );

		this.road.spline.addRoadSegment( this.segment.start, this.segment.length, this.road );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( this.road, true ) );

		if ( this.road.isJunction ) {

			this.connections.forEach( connection => {
				this.road.junctionInstance?.addConnection( connection );
			} );

		}

		if ( !this.road.isJunction ) {

			this.road.addPredecessor( this.predecessorElement );
			this.road.addSuccessor( this.successorElement );

		}

	}

	redo (): void {

		this.execute();

	}

}
