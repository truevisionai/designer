/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { RoadPosition } from '../../../../models/positions/osc-road-position';

@Component( {
	selector: 'app-road-position-editor',
	templateUrl: './road-position-editor.component.html'
} )
export class RoadPositionEditorComponent implements OnInit {

	@Input() position: RoadPosition;

	constructor () {
	}

	ngOnInit () {
	}

}
