/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/commands/select-point-command';
import { JunctionFactory } from 'app/factories/junction.factory';
import { SceneService } from 'app/services/scene.service';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { JunctionEntryObject } from '../../modules/three-js/objects/junction-entry.object';
import { TvContactPoint, TvLaneSide } from '../../modules/tv-map/models/tv-common';
import { TvJunction } from '../../modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from '../../modules/tv-map/models/tv-junction-connection';
import { TvJunctionLaneLink } from '../../modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { BaseCommand } from '../../commands/base-command';
import { RoadFactory } from '../../factories/road-factory.service';
import { ManeuverTool } from './maneuver-tool';

export class CreateSingleManeuver extends BaseCommand {

	private readonly junction: TvJunction;
	private readonly connection: TvJunctionConnection;
	private readonly laneLink: TvJunctionLaneLink;
	private readonly connectingRoad: TvRoad;

	private junctionCreated: boolean;
	private laneLinkCreated: boolean;
	private connectionCreated: boolean;

	private selectJunctionCommand: SelectPointCommand;

	constructor (
		private tool: ManeuverTool,
		private entry: JunctionEntryObject,
		private exit: JunctionEntryObject,
		junction: TvJunction,
		connection: TvJunctionConnection,
		laneLink: TvJunctionLaneLink
	) {
		super();

		this.junction = junction || this.createJunction();

		this.connectingRoad = RoadFactory.createConnectingRoad( this.entry, this.exit, TvLaneSide.RIGHT, this.junction );

		this.connection = connection || this.createConnection( this.entry, this.exit );

		this.laneLink = laneLink || this.createLaneLink( this.entry );

		this.laneLink.show();
	}

	execute (): void {

		if ( this.junctionCreated ) this.map.addJunctionInstance( this.junction );

		if ( this.connectionCreated ) this.junction.addConnection( this.connection );

		if ( this.laneLinkCreated ) this.connection.addLaneLink( this.laneLink );

		this.selectJunctionCommand?.execute();

		SceneService.addToMain( this.laneLink.mesh );

		this.entry.road.setSuccessor( TvRoadLinkChildType.junction, this.junction.id );
		this.exit.road.setPredecessor( TvRoadLinkChildType.junction, this.junction.id );

		RoadFactory.rebuildRoad( this.connectingRoad );

		// console.log( this.map.roads.size );
	}

	undo (): void {

		if ( this.junctionCreated ) this.map.removeJunction( this.junction );

		if ( this.connectionCreated ) {
			this.junction.connections.delete( this.connection.id );
		}

		if ( this.laneLinkCreated ) {

			const index = this.connection.laneLink.findIndex( link => link.from == this.laneLink.from && link.to == this.laneLink.to );

			if ( index > -1 ) {

				this.connection.laneLink.splice( index, 1 );

			}
		}

		this.selectJunctionCommand?.undo();

		SceneService.removeFromMain( this.laneLink.mesh );

		this.entry.road.setSuccessor( null, null );
		this.exit.road.setPredecessor( null, null );

		this.map.roads.delete( this.connectingRoad.id );
		this.map.gameObject.remove( this.connectingRoad.gameObject );

		// console.log( this.map.roads.size );
	}

	redo (): void {

		if ( this.junctionCreated ) this.map.addJunctionInstance( this.junction );

		if ( this.connectionCreated ) {
			this.junction.connections.set( this.connection.id, this.connection );
		}

		if ( this.laneLinkCreated ) {
			this.connection.addLaneLink( this.laneLink );
		}

		this.selectJunctionCommand?.execute();

		SceneService.addToMain( this.laneLink.mesh );

		this.entry.road.setSuccessor( TvRoadLinkChildType.junction, this.junction.id );
		this.exit.road.setPredecessor( TvRoadLinkChildType.junction, this.junction.id );

		this.map.roads.set( this.connectingRoad.id, this.connectingRoad );
		this.map.gameObject.add( this.connectingRoad.gameObject );

		// console.log( this.map.roads.size );
	}

	private createLaneLink ( entry: JunctionEntryObject ): TvJunctionLaneLink {

		let connectingLane = this.connectingRoad.getFirstLaneSection().getLaneById( -Math.abs( entry.lane.id ) );

		if ( !connectingLane ) connectingLane = this.connectingRoad.getFirstLaneSection().getLaneById( -1 );

		if ( !connectingLane ) throw new Error( 'connection lane not found' );

		if ( !connectingLane ) return;

		this.laneLinkCreated = true;

		return new TvJunctionLaneLink( entry.lane, connectingLane );

	}

	private createConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject ): TvJunctionConnection {

		this.connectionCreated = true;

		return TvJunctionConnection.create( entry.road, this.connectingRoad, TvContactPoint.START );

	}

	private createJunction () {

		this.junctionCreated = true;

		return JunctionFactory.addJunction();

	}
}
