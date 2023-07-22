/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvRoadLinkChild } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';

export class RemoveRoadCommand extends BaseCommand {

	private connections: TvJunctionConnection[] = [];

	private readonly successorElement: TvRoadLinkChild;
	private readonly predecessorElement: TvRoadLinkChild;

	constructor ( private road: TvRoad ) {

		super();

		if ( this.road.isJunction ) {

			this.road.junctionInstance?.getConnectionsForRoad( this.road ).forEach( c => {
				this.connections.push( c.clone() );
			} );

		} else {

			this.predecessorElement = this.road.predecessor;
			this.successorElement = this.road.successor;

		}

	}

	execute (): void {

		this.road.hide();
		this.road.hideHelpers();

		if ( this.road.isJunction ) {

			this.road.junctionInstance?.removeConnectingRoad( this.road );

		} else {

			this.road.removePredecessor();
			this.road.removeSuccessor();
		}

		this.map.roads.delete( this.road.id );
		this.map.gameObject.remove( this.road.gameObject );
	}

	undo (): void {

		this.road.show();
		this.road.showHelpers();

		this.map.roads.set( this.road.id, this.road );
		this.map.gameObject.add( this.road.gameObject );

		if ( this.road.isJunction ) {

			this.connections.forEach( connection => {
				this.road.junctionInstance?.addConnection( connection );
			} );

		} else {

			this.road.addPredecessor( this.predecessorElement );
			this.road.addSuccessor( this.successorElement );

		}
	}

	redo (): void {

		this.execute();

	}

}
