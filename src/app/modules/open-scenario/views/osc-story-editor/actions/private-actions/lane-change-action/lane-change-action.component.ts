/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { LaneChangeAction } from '../../../../../models/actions/osc-lane-change-action';

@Component( {
	selector: 'app-lane-change-action',
	templateUrl: './lane-change-action.component.html',
	styleUrls: [ './lane-change-action.component.css' ]
} )
export class LaneChangeActionComponent implements OnInit {

	@Input() action: LaneChangeAction;

	constructor () {
	}

	ngOnInit () {

	}

}
