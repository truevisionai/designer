import { AbstractAction} from '../osc-interfaces';
import { OscActionCategory } from '../osc-enums';

export abstract class OscUserDefinedAction extends AbstractAction {

    public category = OscActionCategory.userDefined;

}
