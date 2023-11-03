import { ScenarioInstance } from "app/modules/scenario/services/scenario-instance";
import { TvMapInstance } from "app/modules/tv-map/services/tv-map-instance";

export abstract class Manager {

	public abstract init (): void;

	get map () {
		return TvMapInstance.map;
	}

	get scenario () {
		return ScenarioInstance.scenario;
	}
}
