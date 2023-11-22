/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from '../../../../core/components/abstract-field.component';
import { ScenarioService } from '../../../../modules/scenario/services/scenario.service';

@Component( {
	selector: 'app-select-entity-field',
	templateUrl: './select-entity-field.component.html',
	styleUrls: [ './select-entity-field.component.scss' ]
} )
export class SelectEntityFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: string;
	@Input() label: string = 'Entity';

	constructor () {
		super();
	}

	get entities () {
		return [ ...ScenarioService.scenario.objects.keys() ];
	}

	ngOnInit () {
	}

	onEntityChanged ( $entity: string ) {
		this.changed.emit( $entity );
	}
}
