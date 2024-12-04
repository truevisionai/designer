/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Maneuver } from 'app/scenario/models/tv-maneuver';
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

	constructor (
		private elementFactory: ScenarioElementFactory
	) {
	}

	ngOnInit (): void {
	}

	delete ( $event: MouseEvent ): void {

		// TODO: Implement this

	}

	addEvent (): void {

		const event = this.elementFactory.createEmptyEvent();

		this.maneuver.addEvent( event );

	}

}
