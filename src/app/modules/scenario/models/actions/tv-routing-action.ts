/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from '../position';
import { PrivateAction } from '../private-action';
import { CatalogReference } from '../tv-catalogs';
import { EntityObject } from '../tv-entities';
import { ActionType, DomainAbsoluteRelative } from '../tv-enums';
import { Route } from '../tv-route';

export abstract class AbstractRoutingAction extends PrivateAction {

}

export class RoutingAction {

}

export class FollowRouteAction extends AbstractRoutingAction {
	execute ( entity: EntityObject ): void {
		throw new Error( 'Method not implemented.' );
	}

	readonly label: string = 'FollowRoute';
	readonly actionType: ActionType = ActionType.Private_Routing;


	// optional
	public catalogReference: CatalogReference;

	constructor ( public route: Route ) {
		super();
	}

}

export class LongitudinalPurpose {
	public timing: LongitudinalTiming;
}

export class LongitudinalTiming {
	constructor (
		public domain: DomainAbsoluteRelative,
		public scale: number,
		public offset: number
	) {
	}
}

export class AcquirePositionAction extends AbstractRoutingAction {
	execute ( entity: EntityObject ): void {
		throw new Error( 'Method not implemented.' );
	}

	readonly label: string = 'AcquirePosition';
	readonly actionType: ActionType = ActionType.Private_Routing;

	constructor ( public position: Position ) {
		super();
	}

}
