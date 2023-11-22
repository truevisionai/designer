/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { ConditionType, TriggeringRule } from '../../../models/tv-enums';

@Component( {
	selector: 'app-condition-by-entity',
	templateUrl: './condition-by-entity.component.html',
	styleUrls: [ './condition-by-entity.component.scss' ]
} )
export class ConditionByEntityComponent implements OnInit {

	@Input() condition: EntityCondition;

	rules = TriggeringRule;

	conditions = ConditionType;

	constructor () {
	}

	get entities () {

		return [ ...ScenarioService.scenario.objects.keys() ];

	}

	// only selecting one entity is supported for now
	get entity () {

		return this.condition.triggeringEntities[ 0 ];

	}

	set entity ( value ) {

		if ( value && this.condition.triggeringEntities.length === 0 ) {

			this.condition.triggeringEntities.push( value );

		} else if ( value ) {

			this.condition.triggeringEntities[ 0 ] = value;

		}

	}

	onEntityChanged ( value ) {

		this.entity = value;

	}

	ngOnInit () {
	}

}
