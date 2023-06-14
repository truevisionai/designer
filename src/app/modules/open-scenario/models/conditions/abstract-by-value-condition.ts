import { ConditionCategory } from '../tv-enums';
import { AbstractCondition } from './tv-condition';

export abstract class AbstractByValueCondition extends AbstractCondition {

	public category: ConditionCategory = ConditionCategory.ByValue;

}
