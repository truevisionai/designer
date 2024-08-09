/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Condition } from 'app/scenario/models/conditions/tv-condition';
import { EndOfRoadCondition } from 'app/scenario/models/conditions/tv-end-of-road-condition';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from 'app/commands/command-history';

@Component( {
	selector: 'app-end-of-road-condition',
	templateUrl: './end-of-road-condition.component.html',
	styleUrls: [ './end-of-road-condition.component.scss' ]
} )
export class EndOfRoadConditionComponent implements OnInit {

	@Input() condition: Condition;

	constructor () {
	}

	get endOfRoadCondition () {

		return this.condition as EndOfRoadCondition;

	}

	ngOnInit () {
	}

	onDurationChanged ( $duration: number ) {

		CommandHistory.execute(
			new SetValueCommand( this.endOfRoadCondition, 'duration', $duration )
		);

	}

}
