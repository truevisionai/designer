import { OscActionType } from '../osc-enums';
import { AbstractPrivateAction } from '../osc-interfaces';

export class OscDistanceAction extends AbstractPrivateAction {

	public actionName: string = 'Distance';
	public actionType: OscActionType = OscActionType.Private_Longitudinal_Distance;


}
