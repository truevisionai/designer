/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { JunctionEntryObject } from '../../../modules/three-js/objects/junction-entry.object';
import { TvContactPoint, TvLaneSide } from '../../../modules/tv-map/models/tv-common';
import { TvJunction } from '../../../modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from '../../../modules/tv-map/models/tv-junction-connection';
import { TvJunctionLaneLink } from '../../../modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { BaseCommand } from '../../commands/base-command';
import { RoadFactory } from '../../factories/road-factory.service';
import { ManeuverTool } from './maneuver-tool';

export class CreateJunctionConnection extends BaseCommand {

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

		// this.selectJunctionCommand = new SelectPointCommand( tool, null );
	}

	execute (): void {

		if ( this.junctionCreated ) this.map.addJunctionInstance( this.junction );

		if ( this.connectionCreated ) this.junction.addConnection( this.connection );

		if ( this.laneLinkCreated ) this.connection.addLaneLink( this.laneLink );

		this.entry.road.setSuccessor( 'junction', this.junction.id );

		this.exit.road.setPredecessor( 'junction', this.junction.id );

		this.selectJunctionCommand?.execute();

		RoadFactory.rebuildRoad( this.connectingRoad );

	}

	undo (): void {

		if ( this.junctionCreated ) this.map.removeJunction( this.junction );

		if ( this.connectionCreated ) this.junction.removeConnectionById( this.connection.id );

		if ( this.laneLinkCreated ) this.connection.removeLaneLink( this.laneLink );

		this.entry.road.setSuccessor( null, null );

		this.exit.road.setPredecessor( null, null );

		this.selectJunctionCommand?.undo();

		this.map.removeRoad( this.connectingRoad );

	}

	redo (): void {

		if ( this.junctionCreated ) this.map.addJunctionInstance( this.junction );

		if ( this.connectionCreated ) this.junction.addConnection( this.connection );

		if ( this.laneLinkCreated ) this.connection.addLaneLink( this.laneLink );

		this.entry.road.setSuccessor( 'junction', this.junction.id );

		this.exit.road.setPredecessor( 'junction', this.junction.id );

		this.selectJunctionCommand?.execute();

		this.map.addRoadInstance( this.connectingRoad );

		RoadFactory.rebuildRoad( this.connectingRoad );
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

		return TvJunction.create();

	}
}
