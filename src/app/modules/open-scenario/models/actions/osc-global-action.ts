import { AbstractAction } from '../osc-interfaces';
import { OscActionCategory } from '../osc-enums';

export abstract class OscGlobalAction extends AbstractAction {

	public category = OscActionCategory.global;

}
