/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Maneuver } from 'app/modules/scenario/models/tv-maneuver';
import { ScenarioElementFactory } from '../../builders/scenario-element-factory';
import { ScenarioEntity } from '../../models/entities/scenario-entity';

@Component( {
	selector: 'app-maneuver-editor',
	templateUrl: './maneuver-editor.component.html'
} )
export class ManeuverEditorComponent implements OnInit {

	@Input() entity: ScenarioEntity;
	@Input() maneuver: Maneuver;

	@Input() isOpen = true;

	constructor () {
	}

	ngOnInit () {
	}

	delete ( $event: MouseEvent ) {

		// throw new Error( 'Method not implemented.' );

	}

	addEvent () {

		const event = ScenarioElementFactory.createEmptyEvent();

		this.maneuver.addEvent( event );

	}

}
