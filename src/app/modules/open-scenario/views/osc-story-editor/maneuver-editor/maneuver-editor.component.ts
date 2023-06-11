/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { OscManeuver } from 'app/modules/open-scenario/models/osc-maneuver';

@Component( {
	selector: 'app-maneuver-editor',
	templateUrl: './maneuver-editor.component.html'
} )
export class ManeuverEditorComponent implements OnInit {

	@Input() maneuver: OscManeuver;

	constructor () {
	}

	ngOnInit () {
	}

}
