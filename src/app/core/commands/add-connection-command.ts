/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LanePathFactory } from '../factories/lane-path-factory.service';
import { RoadFactory } from '../factories/road-factory.service';
import { SceneService } from '../services/scene.service';
import { ManeuverTool } from '../tools/maneuver/maneuver-tool';
import { BaseCommand } from './base-command';

export class AddConnectionCommand extends BaseCommand {

	private connectingRoad: TvRoad;
	private connection: TvJunctionConnection;
	private link: TvJunctionLaneLink;

	constructor (
		private entry: JunctionEntryObject,
		private exit: JunctionEntryObject,
		private junction: TvJunction,
		private tool: ManeuverTool
	) {

		super();

	}

	execute (): void {

		const laneWidth = this.entry.lane.getWidthValue( 0 );

		this.connectingRoad = this.tool.createConnectingRoad( this.entry, this.exit, TvLaneSide.RIGHT, laneWidth, this.junction );

		const result = this.tool.createConnections( this.junction, this.entry, this.connectingRoad, this.exit );

		this.connection = result.connection;

		this.link = result.link;

		const lane = this.connectingRoad.getFirstLaneSection().getLaneById( -1 );

		// tslint:disable-next-line: max-line-length
		this.link.lanePath = LanePathFactory.createPathForLane( this.entry.road, this.connectingRoad, lane, result.connection, result.link );

		this.tool.connectingRoad = this.connectingRoad;

		this.tool.lanePathObject = result.link.lanePath;

		RoadFactory.rebuildRoad( this.connectingRoad );

		SceneService.add( result.link.lanePath );
	}

	undo (): void {

		this.map.removeRoad( this.connectingRoad );

		this.junction.removeConnection( this.connection, this.entry.road, this.exit.road );

		this.tool.connectingRoad = null;

		this.tool.lanePathObject = null;

		SceneService.remove( this.link.lanePath );

	}

	redo (): void {

		this.map.addRoadInstance( this.connectingRoad );

		this.junction.addConnection( this.connection );

		this.tool.updateNeighbors( this.junction, this.entry, this.connectingRoad, this.exit );

		this.tool.connectingRoad = this.connectingRoad;

		this.tool.lanePathObject = this.link.lanePath;

		RoadFactory.rebuildRoad( this.connectingRoad );

		SceneService.add( this.link.lanePath );
	}
}
