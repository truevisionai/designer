/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EntityObject } from '../osc-entities';
import { ActionType } from '../osc-enums';
import { AbstractPosition, AbstractPrivateAction } from '../osc-interfaces';

export class PositionAction extends AbstractPrivateAction {

	public actionName: string = 'Position';
	public actionType: ActionType = ActionType.Private_Position;


	public position: AbstractPosition;

	constructor ( position: AbstractPosition ) {

		super();

		this.position = position;

	}

	setPosition ( position: AbstractPosition ): any {

		this.position = position;

	}

	execute ( entity: EntityObject ) {

		entity.setPosition( this.position.toVector3() );

	}
}
