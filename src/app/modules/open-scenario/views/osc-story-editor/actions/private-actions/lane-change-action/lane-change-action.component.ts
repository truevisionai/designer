import { Component, Input, OnInit } from '@angular/core';
import { OscLaneChangeAction } from '../../../../../models/actions/osc-lane-change-action';

@Component( {
	selector: 'app-lane-change-action',
	templateUrl: './lane-change-action.component.html',
	styleUrls: [ './lane-change-action.component.css' ]
} )
export class LaneChangeActionComponent implements OnInit {

	@Input() action: OscLaneChangeAction;

	constructor () {
	}

	ngOnInit () {

	}

}
