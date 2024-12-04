/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Condition } from 'app/scenario/models/conditions/tv-condition';
import { EndOfRoadCondition } from 'app/scenario/models/conditions/tv-end-of-road-condition';
import { Commands } from 'app/commands/commands';

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

	ngOnInit (): void {
	}

	onDurationChanged ( $duration: number ): void {

		Commands.SetValue( this.endOfRoadCondition, 'duration', $duration );

	}

}
