import { TvConsole } from '../../../core/utils/console';
import { ValueCondition } from '../models/conditions/value-condition';
import { ConditionType } from '../models/tv-enums';

/**
 * Possible state of traffic signal within a phase. One state per phase.
 */
export class TrafficSignalState {
	/**
	 *
	 * @param state 			State of the signal. The available states are listed in
	 * 							the TrafficSignal list of the RoadNetwork.
	 * @param trafficSignalId	ID of the referenced signal in a road network. The signal
	 * 							ID must be listed in TrafficSignal list of the RoadNetwork.
	 */
	constructor ( public state: string, public trafficSignalId: string ) {
	}
}

/**
 * Phase of a TrafficSignalController.
 * A TrafficSignalController has sequential phases.
 * Each phase has multiple TrafficSignalStates.
 */
export class TrafficSignalPhase {
	/**
	 *
	 * @param name Name of the phase.
	 * @param duration Duration of the phase. Unit: s; Range: [0..inf[.
	 * @param states Each phase has multiple TrafficSignalStates. One for each
	 *  			 TrafficSignal that is controlled.
	 *  			 E.g. phase1 (trafficSignal1:true;false;false, trafficSignal2:false;false;true).
	 */
	constructor ( public name: string, public duration: number, public states: TrafficSignalState[] ) {
	}
}

export class TrafficSignalControllerCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.TrafficSignalController;
	public label: string;

	/**
	 * Considered true if a given traffic signal controller
	 * (which may be defined within OpenSCENARIO or externally) reaches a specific state.
	 * @param attr_phase Name of the phase of the signal controller to be reached for the condition to become true.
	 * 					 The available phases are defined in type RoadNetwork under the property trafficSignalControllers.
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
