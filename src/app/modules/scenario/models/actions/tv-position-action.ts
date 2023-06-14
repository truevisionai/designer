/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractPosition } from '../abstract-position';
import { AbstractPrivateAction } from '../abstract-private-action';
import { EntityObject } from '../tv-entities';
import { ActionType } from '../tv-enums';

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
