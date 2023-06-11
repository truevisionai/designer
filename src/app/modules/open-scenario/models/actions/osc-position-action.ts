/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscEntityObject } from '../osc-entities';
import { OscActionType } from '../osc-enums';
import { AbstractPosition, AbstractPrivateAction } from '../osc-interfaces';

export class OscPositionAction extends AbstractPrivateAction {

	public actionName: string = 'Position';
	public actionType: OscActionType = OscActionType.Private_Position;


	public position: AbstractPosition;

	constructor ( position: AbstractPosition ) {

		super();

		this.position = position;

	}

	setPosition ( position: AbstractPosition ): any {

		this.position = position;

	}

	execute ( entity: OscEntityObject ) {

		entity.setPosition( this.position.getPosition() );

	}
}
