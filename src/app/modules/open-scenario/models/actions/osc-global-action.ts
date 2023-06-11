import { OscActionCategory } from '../osc-enums';
import { AbstractAction } from '../osc-interfaces';

export abstract class OscGlobalAction extends AbstractAction {

	public category = OscActionCategory.global;

}
