/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { JunctionFactory } from 'app/core/factories/junction.factory';
import { IComponent } from 'app/core/game-object';
import { CreateJunctionConnection } from 'app/core/tools/maneuver/create-junction-connection';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';

@Component( {
	selector: 'app-junction-entry-inspector',
	templateUrl: './junction-entry-inspector.component.html',
	styleUrls: [ './junction-entry-inspector.component.css' ]
} )
export class JunctionEntryInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: JunctionEntryObject | JunctionEntryObject[];

	constructor () {

		super();

	}

	get items() {

		return this.data as JunctionEntryObject[];

	}

	get hasMultipleSelected () { return this.data && Array.isArray( this.data ) && this.data.length > 1; }

	ngOnInit () {


	}

	ngOnDestroy (): void {


	}

	createJunction () {

		if ( !this.hasMultipleSelected ) return;

		JunctionFactory.mergeEntries( this.data as JunctionEntryObject[] );

	}
}
