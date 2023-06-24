import { TvConsole } from '../../../core/utils/console';
import { ValueCondition } from '../models/conditions/value-condition';
import { ConditionType } from '../models/tv-enums';

export class TrafficSignalControllerCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.TrafficSignalController;
	public label: string;

	/**
	 * Considered true if a given traffic signal controller
	 * (which may be defined within OpenSCENARIO or externally) reaches a specific state.
	 * @param attr_phase
	 * @param attr_trafficSignalControllerRef
	 */
	constructor ( attr_phase: any, attr_trafficSignalControllerRef: any ) {
		super();
		TvConsole.warn( 'TrafficSignalControllerCondition is not implemented' );
	}

	hasPassed (): boolean {
		return false;
	}

}
