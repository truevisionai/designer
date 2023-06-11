import { OscActionCategory, OscDynamicsShape } from '../osc-enums';
import { AbstractAction, AbstractPrivateAction } from '../osc-interfaces';

export class DontUse_OscPrivateAction extends AbstractPrivateAction {
	actionType: import( '../osc-enums' ).OscActionType;

	public category = OscActionCategory.private;

	public actionName: string = '';

	private Actions: AbstractAction[] = [];

	get actions () {

		return this.Actions;

	}

	exportXml () {

		return {};

	}

}


export class OscLaneChangeDynamics {

	public time?: number;
	public distance?: number;
	public shape: OscDynamicsShape;
	public rate?: number;

}

export class OscSpeedDynamics {

	public shape: OscDynamicsShape;
	public time?: number;
	public distance?: number;
	public rate?: number;

	constructor ( shape: OscDynamicsShape = null, time: number = 0, distance: number = 0, rate: number = 0 ) {
		this.shape = shape;
		this.time = time;
		this.distance = distance;
		this.rate = rate;
	}

}

