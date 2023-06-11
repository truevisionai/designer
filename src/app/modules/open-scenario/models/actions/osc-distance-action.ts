import { AbstractPrivateAction } from '../osc-interfaces';
import { OscActionType } from '../osc-enums';

export class OscDistanceAction extends AbstractPrivateAction {

	public actionName: string = 'Distance';
	public actionType: OscActionType = OscActionType.Private_Longitudinal_Distance;


}
