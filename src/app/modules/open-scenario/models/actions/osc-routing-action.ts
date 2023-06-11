import { AbstractPosition, AbstractPrivateAction } from '../osc-interfaces';
import { OscRoute } from '../osc-route';
import { OscCatalogReference } from '../osc-catalogs';
import { OscActionType, OscDomainAbsoluteRelative } from '../osc-enums';

export abstract class AbstractRoutingAction extends AbstractPrivateAction {

}

export class OscRoutingAction {

}

export class FollowRouteAction extends AbstractRoutingAction {

	readonly actionName: string = 'FollowRoute';
	readonly actionType: OscActionType = OscActionType.Private_Routing;


	// optional
	public catalogReference: OscCatalogReference;

	constructor ( public route: OscRoute ) {
		super();
	}

}

export class LongitudinalPurpose {
	public timing: LongitudinalTiming;
}

export class LongitudinalTiming {
	constructor (
		public domain: OscDomainAbsoluteRelative,
		public scale: number,
		public offset: number
	) {
	}
}

export class AcquirePositionAction extends AbstractRoutingAction {

	readonly actionName: string = 'AcquirePosition';
	readonly actionType: OscActionType = OscActionType.Private_Routing;

	constructor ( public position: AbstractPosition ) {
		super();
	}

}
