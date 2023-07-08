/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteLinkCommand } from 'app/core/commands/delete-link-command';
import { MultiCmdsCommand } from 'app/core/commands/multi-cmds-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { CommandHistory } from 'app/services/command-history';
import { LanePathObject } from '../../../modules/tv-map/models/tv-junction-lane-link';

@Component( {
	selector: 'app-lane-link-inspector',
	templateUrl: './lane-link-inspector.component.html',
	styleUrls: [ './lane-link-inspector.component.css' ]
} )
export class LaneLinkInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: LanePathObject;

	constructor () {

		super();

	}

	ngOnInit () {

		if ( this.data.link && this.data.link.lanePath ) {

			this.data.link.show();

		}

		if ( this.data.connection ) {

			this.data.connection.connectingRoad?.spline?.show();

		}

		if ( this.data.connectingRoad ) {

			this.data.connectingRoad.showNodes();

			this.data.connectingRoad.spline.show();

		}
	}

	ngOnDestroy (): void {

		if ( this.data.link && this.data.link.lanePath ) this.data.link.lanePath.unselect();

		if ( this.data.connection ) {

			this.data.connection.connectingRoad?.spline?.hide();

		}

		if ( this.data.connectingRoad ) {

			this.data.connectingRoad.hideNodes();

			this.data.connectingRoad.spline.hide();

		}
	}

	onDelete () {

		if ( !this.data.link ) return;

		const commands = [];

		commands.push( new DeleteLinkCommand( this.data.connection, this.data.link, this.data ) );

		commands.push( new SetInspectorCommand( null, null ) );

		CommandHistory.execute( new MultiCmdsCommand( commands ) );
	}
}
