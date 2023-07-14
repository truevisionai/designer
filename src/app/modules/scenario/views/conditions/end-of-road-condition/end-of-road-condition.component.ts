/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Condition } from 'app/modules/scenario/models/conditions/tv-condition';
import { EndOfRoadCondition } from 'app/modules/scenario/models/conditions/tv-end-of-road-condition';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-end-of-road-condition',
	templateUrl: './end-of-road-condition.component.html',
	styleUrls: [ './end-of-road-condition.component.scss' ]
} )
export class EndOfRoadConditionComponent implements OnInit {

	@Input() condition: Condition;

	get endOfRoadCondition () {

		return this.condition as EndOfRoadCondition;

	}

	constructor () { }

	ngOnInit () { }

	onDurationChanged ( $duration: number ) {

		CommandHistory.execute(

			new SetValueCommand( this.endOfRoadCondition, 'duration', $duration )

		)

	}

}
