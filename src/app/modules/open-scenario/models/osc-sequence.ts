/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscSourceFile } from '../services/osc-source-file';
import { OscCatalogReference } from './osc-catalogs';
import { OscManeuver } from './osc-maneuver';

export class OscSequence {

	private static count = 1;

	// public name: string;
	// public numberOfExecutions: number;
	// public actors: string[] = [];

	// TODO: ByConditionActor

	public catalogReferences: OscCatalogReference[] = [];
	public maneuvers: OscManeuver[] = [];

	constructor ( public name?: string, public numberOfExecutions?: number, public actors?: string[] ) {

		if ( this.actors == null ) this.actors = [];

		OscSequence.count++;

	}

	static getNewName ( name = 'MySequence' ) {

		return `${ name }${ this.count }`;

	}

	addNewManeuver ( name: string ) {

		const maneuver = new OscManeuver( name );

		this.addManeuver( maneuver );

		return maneuver;

	}

	addManeuver ( maneuver: OscManeuver ) {

		const hasName = OscSourceFile.db.has_maneuver( maneuver.name );

		if ( hasName ) throw new Error( 'Maneuver name already used' );

		this.maneuvers.push( maneuver );

		OscSourceFile.db.add_maneuver( maneuver.name );

	}
}
