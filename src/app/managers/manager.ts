/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { ScenarioInstance } from "app/modules/scenario/services/scenario-instance";
// import { TvMapInstance } from "app/modules/tv-models/services/tv-models-instance";

export abstract class Manager {

	public abstract init (): void;

	/**
	 * @deprecated
	 */
	get map (): any {
		throw new Error( 'method not implemented' );
		// return TvMapInstance.models;
	}

	/**
	 * @deprecated
	 */
	get scenario (): any {
		throw new Error( 'method not implemented' );
		// return ScenarioInstance.scenario;
	}
}
