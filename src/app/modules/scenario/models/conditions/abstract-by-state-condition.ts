import { ConditionCategory } from '../tv-enums';
import { AbstractCondition } from './tv-condition';

export abstract class AbstractByStateCondition extends AbstractCondition {

	public category: ConditionCategory = ConditionCategory.ByState;

}
