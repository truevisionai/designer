import { TvConsole } from '../../../core/utils/console';
import { ValueCondition } from '../models/conditions/value-condition';
import { ConditionType } from '../models/tv-enums';

export class TrafficSignalCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.TrafficSignal;
	public label: string = 'TrafficSignalCondition';

	constructor ( public name: string, public state: string ) {
		super();
		TvConsole.warn( 'TrafficSignalCondition is not implemented yet' );
	}

	hasPassed (): boolean {
		return false;
	}

}
