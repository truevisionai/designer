import { TvConsole } from '../../../core/utils/console';
import { Condition } from '../models/conditions/tv-condition';
import { ConditionCategory, ConditionType, Rule } from '../models/tv-enums';

export class UserDefinedValueCondition extends Condition {

	public category: ConditionCategory = ConditionCategory.ByValue;
	public conditionType: ConditionType = ConditionType.UserDefinedValue;
	public label: string = 'UserDefinedValueCondition';

	constructor (
		public attr_name: string,
		public attr_value: string,
		public attr_rule: Rule
	) {
		super();
		TvConsole.warn( 'UserDefinedValueCondition is not implemented yet' );
	}

	hasPassed (): boolean {
		return false;
	}
}
