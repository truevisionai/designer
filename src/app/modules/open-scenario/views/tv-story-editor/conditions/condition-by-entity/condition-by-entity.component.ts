import { Component, Input, OnInit } from '@angular/core';
import { AbstractByEntityCondition } from '../../../../models/conditions/abstract-by-entity-condition';
import { ConditionType, TriggeringRule } from '../../../../models/tv-enums';
import { TvScenarioInstance } from 'app/modules/open-scenario/services/tv-scenario-instance';

@Component( {
	selector: 'app-condition-by-entity',
	templateUrl: './condition-by-entity.component.html',
	styleUrls: [ './condition-by-entity.component.scss' ]
} )
export class ConditionByEntityComponent implements OnInit {

	@Input() condition: AbstractByEntityCondition;

	rules = TriggeringRule;

	conditions = ConditionType;

	constructor () { }

	get entities () {

		return [ ...TvScenarioInstance.openScenario.objects.keys() ];

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

	ngOnInit () { }

}
