/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from '../position';
import { PrivateAction } from '../private-action';
import { ScenarioEntity } from '../entities/scenario-entity';
import { ActionType } from '../tv-enums';
import { Subscription } from 'rxjs';

export class TeleportAction extends PrivateAction {

	public label: string = 'Teleport Action';
	public actionType: ActionType = ActionType.Private_Position;

	public position: Position;

	private positionSub: Subscription;

	constructor ( position: Position ) {

		super();

		this.position = position;

		this.positionSub = this.position?.updated.subscribe( e => this.onPositionUpdated( e ) );

	}

	onPositionUpdated ( e: any ): void {

		this.updated.emit( this );

	}

	setPosition ( position: Position ): any {

		this.position = position;

		this.positionSub?.unsubscribe();

		this.positionSub = this.position?.updated.subscribe( e => this.onPositionUpdated( e ) );

	}

	execute ( entity: ScenarioEntity ) {

		entity.setPosition( this.position.position );
		entity.setEuler( this.position.toEuler() );

	}
}
