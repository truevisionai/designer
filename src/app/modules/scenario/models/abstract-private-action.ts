import { AbstractAction } from './abstract-action';
import { ActionCategory } from './tv-enums';

export abstract class AbstractPrivateAction extends AbstractAction {

	public category = ActionCategory.private;

	abstract actionName: string;

}
