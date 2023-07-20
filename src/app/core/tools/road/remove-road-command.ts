/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadLinkChild } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { BaseCommand } from 'app/core/commands/base-command';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';

export class RemoveRoadCommand extends BaseCommand {

	private connections: TvJunctionConnection[] = [];

	private successor: TvRoad;
	private predecessor: TvRoad;
	private successorRelation: 's' | 'p';
	private predecessorRelation: 's' | 'p';
	private prevRoadLink: TvRoadLinkChild;
	private nextRoadLink: TvRoadLinkChild;

	constructor ( private road: TvRoad ) {

		super();

		this.predecessor = this.road.predecessor?.getElement<TvRoad>();
		this.successor = this.road.successor?.getElement<TvRoad>();

		if ( this.road.isJunction ) {
			this.road.junctionInstance?.getConnectionsForRoad( this.road ).forEach( c => {
				this.connections.push( c.clone() );
			} );
		} else {
			if ( this.predecessor ) {
				this.prevRoadLink = this.predecessor.successor.elementId == road.id ?
					this.predecessor.successor :
					this.predecessor.predecessor;
				this.predecessorRelation = this.predecessor.successor.elementId == road.id ?
					's' :
					'p';
			}

			if ( this.successor ) {
				this.nextRoadLink = this.successor.predecessor.elementId == road.id ?
					this.successor.predecessor :
					this.successor.successor;
				this.successorRelation = this.successor.predecessor.elementId == road.id ?
					'p' :
					's';

			}
		}
	}

	execute (): void {

		this.road.hideHelpers();

		this.map.roads.delete( this.road.id );
		this.map.gameObject.remove( this.road.gameObject );

		if ( this.road.isJunction ) {
			this.road.junctionInstance?.removeConnectingRoad( this.road );
		} else {
			if ( this.predecessor ) {
				if ( this.predecessorRelation == 's' ) {
					this.predecessor.successor = null;
				} else {
					this.predecessor.predecessor = null;
				}
			}

			if ( this.successor ) {
				if ( this.successorRelation == 's' ) {
					this.successor.successor = null;
				} else {
					this.successor.predecessor = null;
				}
			}
		}
	}

	undo (): void {

		this.road.showHelpers();

		this.map.roads.set( this.road.id, this.road );
		this.map.gameObject.add( this.road.gameObject );

		if ( this.road.isJunction ) {
			this.connections.forEach( connection => {
				this.road.junctionInstance?.addConnection( connection )
			} )
		} else {
			if ( this.predecessor ) {
				if ( this.predecessorRelation == 's' ) {
					this.predecessor.successor = this.prevRoadLink;
				} else {
					this.predecessor.predecessor = this.prevRoadLink;
				}
			}

			if ( this.successor ) {
				if ( this.successorRelation == 's' ) {
					this.successor.successor = this.nextRoadLink;
				} else {
					this.successor.predecessor = this.nextRoadLink;
				}
			}

		}
	}

	redo (): void {

		this.execute();

	}


}
