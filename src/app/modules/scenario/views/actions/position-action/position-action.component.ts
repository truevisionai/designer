/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { TeleportAction } from '../../../models/actions/tv-teleport-action';
import { Position } from '../../../models/position';
import { PrivateAction } from '../../../models/private-action';
import { EntityObject } from '../../../models/tv-entities';
import { ScenarioInstance } from '../../../services/scenario-instance';

@Component( {
	selector: 'app-position-action',
	templateUrl: './position-action.component.html'
} )
export class PositionActionComponent {

	@Input() action: PrivateAction;
	@Input() entity: EntityObject;

	get positionAction () {
		return this.action as TeleportAction;
	}

	get position () {
		return this.positionAction?.position;
	}

	onPositionChanged ( $event: Position ) {

		this.positionAction?.setPosition( $event );

		if ( this.entity ) this.action.execute( this.entity );

		this.updateOtherEntities();
	}

	onPositionModified ( $event: Position ) {

		this.positionAction?.setPosition( $event );

		if ( this.entity ) this.action.execute( this.entity );

		this.updateOtherEntities();
	}

	private updateOtherEntities () {

		ScenarioInstance.scenario.executeInitActions();

	}
}
