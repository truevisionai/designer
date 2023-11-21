/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { TvRoadObject } from '../../../modules/tv-map/models/objects/tv-road-object';

@Component( {
	selector: 'app-road-object-inspector',
	templateUrl: './road-object-inspector.component.html',
} )
export class RoadObjectInspectorComponent implements OnInit, IComponent {

	data: TvRoadObject;

	constructor () {
	}

	ngOnInit (): void {
		throw new Error( 'Method not implemented.' );
	}

}
