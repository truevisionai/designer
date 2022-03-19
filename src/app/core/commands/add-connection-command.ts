/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { SceneService } from '../services/scene.service';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { RoadFactory } from '../factories/road-factory.service';
import { ManeuverTool } from '../tools/maneuver-tool';
import { LanePathFactory } from '../factories/lane-path-factory.service';

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

        this.openDrive.removeRoad( this.connectingRoad );

        this.junction.removeConnection( this.connection, this.entry.road, this.exit.road );

        this.tool.connectingRoad = null;

        this.tool.lanePathObject = null;

        SceneService.remove( this.link.lanePath );

    }

    redo (): void {

        this.openDrive.addRoadInstance( this.connectingRoad );

        this.junction.addConnection( this.connection );

        this.tool.updateNeighbors( this.junction, this.entry, this.connectingRoad, this.exit );

        this.tool.connectingRoad = this.connectingRoad;

        this.tool.lanePathObject = this.link.lanePath;

        RoadFactory.rebuildRoad( this.connectingRoad );

        SceneService.add( this.link.lanePath );
    }
}