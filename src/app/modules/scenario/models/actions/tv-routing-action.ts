/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatalogReference } from '../tv-catalogs';
import { ActionType, DomainAbsoluteRelative } from '../tv-enums';
import { AbstractPosition, AbstractPrivateAction } from '../tv-interfaces';
import { Route } from '../tv-route';

export abstract class AbstractRoutingAction extends AbstractPrivateAction {

}

export class RoutingAction {

}

export class FollowRouteAction extends AbstractRoutingAction {

	readonly actionName: string = 'FollowRoute';
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

	readonly actionName: string = 'AcquirePosition';
	readonly actionType: ActionType = ActionType.Private_Routing;

	constructor ( public position: AbstractPosition ) {
		super();
	}

}
