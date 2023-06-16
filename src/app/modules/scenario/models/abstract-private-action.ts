import { AbstractAction } from './abstract-action';
import { ActionCategory, StoryElementType } from './tv-enums';

export abstract class AbstractPrivateAction extends AbstractAction {

	public category = ActionCategory.private;

	abstract actionName: string;

	protected actionCompleted () {

		this.isCompleted = true;

		this.completed.emit( {
			type: StoryElementType.action,
			name: this.actionName
		} );

	}

}
