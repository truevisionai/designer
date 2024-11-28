/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { Log } from "app/core/utils/log";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { ConnectionFactory } from "app/factories/connection.factory";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { LaneUtils } from "app/utils/lane.utils";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGatePointVisualizer extends NodeVisualizer<JunctionGatePoint> {

	private selected: JunctionGatePoint[] = [];

	constructor (
		private junctionDebugService: JunctionDebugService,
		private connectionFactory: ConnectionFactory,
	) {
		super();
	}

	onSelected ( object: JunctionGatePoint ): void {

		super.onSelected( object );

		this.selected.push( object );

		if ( this.selected.length === 2 ) {

			this.handleSecondGateSelection( this.selected[ 0 ], this.selected[ 1 ] );

			this.selected.forEach( s => s.unselect() );

			this.selected = [];

		}

	}

	onUnselected ( object: JunctionGatePoint ): void {

		super.onUnselected( object );

		setTimeout( () => {

			this.selected = this.selected.filter( s => s !== object );

		}, 100 );

	}

	private handleSecondGateSelection ( first: JunctionGatePoint, second: JunctionGatePoint ): void {

		if ( !this.isValidForConnection( first.coord, second.coord ) ) {
			return;
		}

		const junction = first.coord.getLink().getElement() as TvJunction;

		this.addConnection( junction, first.coord, second.coord );

	}

	private addConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): void {

		const connection = this.createConnection( junction, incoming, outgoing );

		if ( !connection || connection.getLinkCount() === 0 ) {
			Log.error( 'Unable to create connection or link' );
			return;
		}

		const link = connection.getLaneLinks()[ 0 ];

		while ( junction.hasConnection( connection.id ) ) {
			connection.id = connection.id + 1;
		}

		const mesh = this.junctionDebugService.createManeuver( junction, connection, link );

		if ( !mesh ) {
			Log.error( 'Unable to create maneuver mesh' );
			return;
		}

		Commands.AddObject( mesh );

	}

	private createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection | undefined {

		if ( !incoming.canConnect( outgoing ) ) {
			Log.error( 'Invalid lane directions' );
			return;
		}

		const entry = incoming.isEntry() ? incoming : outgoing;
		const exit = outgoing.isExit() ? outgoing : incoming;

		if ( entry === exit ) {
			Log.error( 'Invalid entry or exit' );
			return;
		}

		const connection = this.connectionFactory.createSingleConnection( junction, entry, exit );

		if ( !connection ) {
			Log.error( 'Unable to create connection' );
			return;
		}

		return connection;
	}

	private isValidForConnection ( first: TvLaneCoord, second: TvLaneCoord ): boolean {

		if ( first.road == second.road ) {
			// this.setHint( 'Cannot connect gates from same roads' );
			return false;
		}

		if ( !first.canConnect( second ) ) {
			// this.setHint( 'Cannot connect gates with invalid lane directions' );
			return false;
		}

		if ( !first.getLink().matches( second.getLink() ) ) {
			// this.setHint( 'Cannot connect, invalid links' );
			return false;
		}

		return true;
	}

}
