/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteLinkCommand } from 'app/commands/delete-link-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
//import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';

@Component( {
	selector: 'app-junction-entry-inspector',
	templateUrl: './junction-entry-inspector.component.html',
	styleUrls: [ './junction-entry-inspector.component.css' ]
} )
export class JunctionEntryInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: any[] = [];

	constructor () {

		super();

	}

	ngOnInit () {


	}

	ngOnDestroy (): void {


	}

	onMouseOver ( link: TvJunctionLaneLink ) {

		link.highlight();

	}

	onMouseOut ( link: TvJunctionLaneLink ) {

		link.unhighlight();

	}

	createManeuvers () {

		if ( this.data.length < 2 ) return;

		if ( this.data.length === 2 ) {

			const left = this.data[ 0 ];
			const right = this.data[ 1 ];

			if ( left.canConnect( right, 'complex' ) ) {

				const entry = left.isEntry ? left : right;
				const exit = left.isExit ? left : right;

				// JunctionFactory.connectTwo( entry, exit );

			} else {

				SnackBar.warn( 'Cannot create a connection between these two' );

			}

		} else if ( this.data.length > 2 ) {

			// JunctionFactory.mergeEntries( this.data );

		}

		//JunctionFactory.mergeComplexEntries( this.data );

	}

	removeLink ( connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		CommandHistory.execute( new DeleteLinkCommand( connection, link ) );

	}
}
