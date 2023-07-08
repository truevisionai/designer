/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { RoadFactory } from '../factories/road-factory.service';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';

export class DeleteLinkCommand extends BaseCommand {

	private connectingRoad: TvRoad;

	constructor ( private connection: TvJunctionConnection, private link: TvJunctionLaneLink, private lanePathObject: LanePathObject ) {

		super();

	}

	execute (): void {

		if ( !this.link.lanePath ) SnackBar.error( 'Link mesh not found' );
		if ( !this.link.lanePath ) return;

		const index = this.connection.laneLink.findIndex( item => item.lanePath.id === this.link.lanePath.id );

		if ( index === -1 ) SnackBar.error( 'Link index not found' );
		if ( index === -1 ) return;

		this.connectingRoad = this.connection.connectingRoad;

		this.map.removeRoad( this.connectingRoad );

		this.link.hide();

		SceneService.remove( this.link.lanePath );

		this.connection.removeLinkAtIndex( index );

		const junction = this.map.getJunctionById( this.connectingRoad.junction );

		if ( !junction ) SnackBar.error( 'Junction not found' );

		if ( this.connectingRoad.successor ) {

			const outgoingRoad = this.map.getRoadById( this.connectingRoad.successor.elementId );

			junction.removeConnection( this.connection, this.lanePathObject.incomingRoad, outgoingRoad );

		}

	}

	undo (): void {

		if ( !this.link.lanePath ) return;

		this.link.lanePath.show();

		SceneService.add( this.link.lanePath );

		this.map.addRoadInstance( this.connectingRoad );

		this.connection.addLaneLink( this.link );

		const junction = this.map.getJunctionById( this.connectingRoad.junction );

		if ( !junction ) console.error( 'junction not found with id ', this.connectingRoad.junction );

		junction.addConnection( this.connection );

		RoadFactory.rebuildRoad( this.connectingRoad );
	}

	redo (): void {

		this.execute();

	}

}
