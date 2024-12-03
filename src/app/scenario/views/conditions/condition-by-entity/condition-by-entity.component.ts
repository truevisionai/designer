/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { ConditionType, TriggeringRule } from '../../../models/tv-enums';
import { EntityService } from "../../../entity/entity.service";

@Component( {
	selector: 'app-condition-by-entity',
	templateUrl: './condition-by-entity.component.html',
	styleUrls: [ './condition-by-entity.component.scss' ]
} )
export class ConditionByEntityComponent implements OnInit {

	@Input() condition: EntityCondition;

	rules = TriggeringRule;

	conditions = ConditionType;

	constructor ( private entityService: EntityService ) {
	}

	get entities () {
		return this.entityService.entities.map( entity => entity.name );
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

	onEntityChanged ( value ): void {

		this.entity = value;

	}

	ngOnInit (): void {
	}

}
