/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';

@Component( {
	selector: 'app-junction-entry-inspector',
	templateUrl: './junction-entry-inspector.component.html',
	styleUrls: [ './junction-entry-inspector.component.css' ]
} )
export class JunctionEntryInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: JunctionEntryObject;

	constructor () {

		super();

	}

	ngOnInit () {

		if ( this.data ) this.data.select();

	}

	ngOnDestroy (): void {

		if ( this.data ) this.data.unselect();

	}
}
