import { TvConsole } from '../../../core/utils/console';
import { ValueCondition } from '../models/conditions/value-condition';
import { ConditionType } from '../models/tv-enums';

/**
 * Considered true if a referenced traffic signal (e.g. from an OpenDRIVE file)
 * reaches a specific states. Signal IDs are listed in the TrafficSignal
 * list of the RoadNetwork together with their states and their controllers
 * to enable dynamic signal modelling.
 */
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
