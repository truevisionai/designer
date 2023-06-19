import { TvAction } from './tv-action';
import { ActionCategory, StoryElementType } from './tv-enums';

export abstract class PrivateAction extends TvAction {

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
