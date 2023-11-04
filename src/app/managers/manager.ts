// import { ScenarioInstance } from "app/modules/scenario/services/scenario-instance";
// import { TvMapInstance } from "app/modules/tv-map/services/tv-map-instance";

export abstract class Manager {

	public abstract init (): void;

	/**
	 * @deprecated
	 */
	get map (): any {
		throw new Error( 'method not implemented' );
		// return TvMapInstance.map;
	}

	/**
	 * @deprecated
	 */
	get scenario (): any {
		throw new Error( 'method not implemented' );
		// return ScenarioInstance.scenario;
	}
}
