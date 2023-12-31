/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteLinkCommand } from 'app/commands/delete-link-command';
import { MultiCmdsCommand } from 'app/commands/multi-cmds-command';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { CommandHistory } from 'app/services/command-history';
import { LanePathObject } from '../../../modules/tv-map/models/junctions/tv-junction-lane-link';
import { RoadService } from "../../../services/road/road.service";

@Component( {
	selector: 'app-lane-link-inspector',
	templateUrl: './lane-link-inspector.component.html',
	styleUrls: [ './lane-link-inspector.component.css' ]
} )
export class LaneLinkInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: LanePathObject;

	constructor ( private roadService: RoadService ) {

		super();

	}

	ngOnInit () {

		if ( this.data.link && this.data.link.mesh ) {

			this.data.link.show();

		}

		if ( this.data.connection ) {

			this.roadService.showSpline( this.data.connection.connectingRoad );

		}

		if ( this.data.connectingRoad ) {

			// this.roadService.showRoadNodes( this.data.connectingRoad );

			this.roadService.showSpline( this.data.connectingRoad )

		}
	}

	ngOnDestroy (): void {

		if ( this.data.link && this.data.link.mesh ) this.data.link.mesh.unselect();

		if ( this.data.connection ) {

			this.roadService.hideSpline( this.data.connection.connectingRoad );

		}

		if ( this.data.connectingRoad ) {

			// this.roadService.hideRoadNodes( this.data.connectingRoad );

			this.roadService.hideSpline( this.data.connectingRoad )

		}
	}

	onDelete () {

		if ( !this.data.link ) return;

		const commands = [];

		commands.push( new DeleteLinkCommand( this.data.connection, this.data.link ) );

		commands.push( new SetInspectorCommand( null, null ) );

		CommandHistory.execute( new MultiCmdsCommand( commands ) );
	}
}
