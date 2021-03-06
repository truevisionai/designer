/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { SceneService } from '../services/scene.service';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadFactory } from '../factories/road-factory.service';
import { SnackBar } from 'app/services/snack-bar.service';

export class DeleteLinkCommand extends BaseCommand {

    private connectingRoad: TvRoad;

    constructor ( private connection: TvJunctionConnection, private link: TvJunctionLaneLink, private lanePathObject: LanePathObject ) {

        super();

    }

    execute (): void {

        if ( !this.link.lanePath ) SnackBar.error( "Link mesh not found" );
        if ( !this.link.lanePath ) return;

        const index = this.connection.laneLink.findIndex( item => item.lanePath.id === this.link.lanePath.id );

        if ( index === -1 ) SnackBar.error( "Link index not found" );
        if ( index === -1 ) return;

        this.connectingRoad = this.map.getRoadById( this.connection.connectingRoad );

        this.map.removeRoad( this.connectingRoad );

        this.link.hide();

        SceneService.remove( this.link.lanePath );

        this.connection.removeLinkAtIndex( index );

        const junction = this.map.getJunctionById( this.connectingRoad.junction );

        if ( !junction ) SnackBar.error( "Junction not found");

        const outgoingRoad = this.map.getRoadById( this.connectingRoad.successor.elementId );

        junction.removeConnection( this.connection, this.lanePathObject.incomingRoad, outgoingRoad );
    }

    undo (): void {

        if ( !this.link.lanePath ) return;

        this.link.lanePath.show();

        SceneService.add( this.link.lanePath );

        this.map.addRoadInstance( this.connectingRoad );

        this.connection.addLaneLink( this.link );

        const junction = this.map.getJunctionById( this.connectingRoad.junction );

        if ( !junction ) console.error( "junction not found with id ", this.connectingRoad.junction );

        junction.addConnection( this.connection );

        RoadFactory.rebuildRoad( this.connectingRoad );
    }

    redo (): void {

        this.execute();

    }

}