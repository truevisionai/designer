/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { Vector3 } from 'three';
import { StoryEvent } from '../services/scenario-director.service';
import { CatalogReference } from './tv-catalogs';
import { EntityObject } from './tv-entities';
import { ActionCategory, ActionType, PositionType } from './tv-enums';

export abstract class IScenarioObject {
}

export abstract class AbstractController {

	update (): void {
		console.error( 'controller update method not overridden' );
	}

}

export class CatalogReferenceController extends AbstractController {

	constructor ( public catalogReference: CatalogReference ) {
		super();
	}

}

export abstract class AbstractAction {

	abstract category: ActionCategory;
	abstract actionType: ActionType;

	public isCompleted: boolean;
	public hasStarted: boolean;
	public completed = new EventEmitter<StoryEvent>();

	execute ( entity: EntityObject ) {
		console.error( this.actionType, this.category );
		throw new Error( 'Method not implemented' );
	}

	reset () {

		this.hasStarted = false;
		this.isCompleted = false;

	}
}

export abstract class AbstractPrivateAction extends AbstractAction {

	public category = ActionCategory.private;

	abstract actionName: string;

}

export abstract class AbstractPosition {

	abstract readonly type: PositionType;
	public vector3: THREE.Vector3 = new Vector3( 0, 0, 0 );

	abstract toVector3 (): Vector3;

	setPosition ( point: Vector3 ) {
		throw new Error( 'Method not implemented.' );
	}

}

