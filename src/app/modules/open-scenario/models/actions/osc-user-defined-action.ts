import { OscActionCategory } from '../osc-enums';
import { AbstractAction } from '../osc-interfaces';

export abstract class OscUserDefinedAction extends AbstractAction {

	public category = OscActionCategory.userDefined;

}
