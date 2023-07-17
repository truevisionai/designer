/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteLinkCommand } from 'app/core/commands/delete-link-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { JunctionFactory } from 'app/core/factories/junction.factory';
import { IComponent } from 'app/core/game-object';
import { CreateJunctionConnection } from 'app/core/tools/maneuver/create-junction-connection';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-junction-entry-inspector',
	templateUrl: './junction-entry-inspector.component.html',
	styleUrls: [ './junction-entry-inspector.component.css' ]
} )
export class JunctionEntryInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: JunctionEntryObject[] = [];

	constructor () {

		super();

	}

	ngOnInit () {


	}

	ngOnDestroy (): void {


	}

	createManeuvers () {

		JunctionFactory.mergeEntries( this.data );
		//JunctionFactory.mergeComplexEntries( this.data );

	}

	removeLink ( connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		CommandHistory.execute( new DeleteLinkCommand( connection, link, link.lanePath ) );

	}
}
