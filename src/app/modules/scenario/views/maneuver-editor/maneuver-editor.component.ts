/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Maneuver } from 'app/modules/scenario/models/tv-maneuver';

@Component( {
	selector: 'app-maneuver-editor',
	templateUrl: './maneuver-editor.component.html'
} )
export class ManeuverEditorComponent implements OnInit {

	@Input() maneuver: Maneuver;

	constructor () {
	}

	ngOnInit () {
	}

}
