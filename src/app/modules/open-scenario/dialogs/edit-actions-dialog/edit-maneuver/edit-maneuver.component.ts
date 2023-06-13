/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Maneuver } from 'app/modules/open-scenario/models/tv-maneuver';

@Component( {
	selector: 'app-edit-maneuver',
	templateUrl: './edit-maneuver.component.html'
} )
export class EditManeuverComponent implements OnInit {

	@Input() maneuver: Maneuver;
	@Output() maneuverSelected = new EventEmitter<Maneuver>();

	constructor () {
	}

	ngOnInit () {

	}

	onFocus () {

		this.maneuverSelected.emit( this.maneuver );

	}

}
