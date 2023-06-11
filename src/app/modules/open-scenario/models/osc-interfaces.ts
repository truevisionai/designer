/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { Vector3 } from 'three';
import { StoryEvent } from '../services/osc-player.service';
import { OscCatalogReference } from './osc-catalogs';
import { OscEntityObject } from './osc-entities';
import { OscActionCategory, OscActionType, OscPositionType } from './osc-enums';

export abstract class IScenarioObject {
}

export abstract class AbstractController {

	update (): void {
		console.error( 'controller update method not overridden' );
	}

}

export class CatalogReferenceController extends AbstractController {

	constructor ( public catalogReference: OscCatalogReference ) {
		super();
	}

}

export abstract class AbstractAction {

	abstract category: OscActionCategory;
	abstract actionType: OscActionType;

	public isCompleted: boolean;
	public hasStarted: boolean;
	public completed = new EventEmitter<StoryEvent>();

	execute ( entity: OscEntityObject ) {
		console.error( this.actionType, this.category );
		throw new Error( 'Method not implemented' );
	}

	reset () {

	}
}

export abstract class AbstractPrivateAction extends AbstractAction {

	public category = OscActionCategory.private;

	abstract actionName: string;

}

export abstract class AbstractPosition {

	abstract readonly type: OscPositionType;
	public vector3: THREE.Vector3 = new Vector3( 0, 0, 0 );

	abstract getPosition (): Vector3;

	setPosition ( point: Vector3 ) {
		throw new Error( 'Method not implemented.' );
	}

}

