/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { OscTraveledDistanceCondition } from 'app/modules/open-scenario/models/conditions/osc-traveled-distance-condition';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-traveled-distance-condition-editor',
	templateUrl: './traveled-distance-condition-editor.component.html',
	styleUrls: [ './traveled-distance-condition-editor.component.css' ]
} )
export class TraveledDistanceConditionEditorComponent extends BaseConditionEditorComponent {

	@Input() condition: OscTraveledDistanceCondition;

	constructor () {
		super();
	}

	onDistanceValueChanged ( value: number ) {

		// if ( typeof value !== 'number' ) console.error( 'value should only be null' );

		this.condition.value = value;

	}
}
