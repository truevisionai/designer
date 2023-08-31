/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatalogReference } from './tv-catalogs';
import { Maneuver } from './tv-maneuver';

/**
 * Using ManeuverGroup we specify the Actors that are executing the actions.
 * Because we want Vehicle 1 to change lanes, we specify its name under Actors.
 * This means that all the actions under this ManeuverGroup are executed by Vehicle 1.
 */
export class ManeuverGroup {

	private static count = 1;

	// public name: string;
	// public numberOfExecutions: number;
	// public actors: string[] = [];

	// TODO: ByConditionActor

	public catalogReferences: CatalogReference[] = [];
	public maneuvers: Maneuver[] = [];

	// For determining actors during runtime,
	// you have to use selectTriggeringEntities = true, which is explained in
	public selectTriggeringEntities = false;

	constructor ( public name?: string, public numberOfExecutions: number = 1, public actors: string[] = [] ) {

		if ( this.actors == null ) this.actors = [];

		ManeuverGroup.count++;

	}

	static getNewName ( name = 'MySequence' ) {

		return `${ name }${ this.count }`;

	}

	addNewManeuver ( name: string ) {

		const maneuver = new Maneuver( name );

		this.addManeuver( maneuver );

		return maneuver;

	}

	addManeuver ( maneuver: Maneuver ) {

		// const hasName = ScenarioInstance.db.has_maneuver( maneuver.name );

		// if ( hasName ) throw new Error( 'Maneuver name already used' );

		this.maneuvers.push( maneuver );

		// ScenarioInstance.db.add_maneuver( maneuver.name );

	}
}
