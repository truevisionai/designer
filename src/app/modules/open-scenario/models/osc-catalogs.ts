/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscDirectory } from './osc-common';
import { OscParameter } from './osc-parameter-declaration';
import { OscTrajectory } from './osc-trajectory';


export class OscCatalogs {

	public static truevisionCatalog = 'TruevisionCatalog';
	public static truevisionDefaultController = 'DefaultController';

	public vehicleCatalog: OscCatalog;
	public driverCatalog: OscCatalog;
	public pedestrianCatalog: OscCatalog;
	public pedestrianControllerCatalog: OscCatalog;
	public miscObjectCatalog: OscCatalog;
	public environmentCatalog: OscCatalog;
	public maneuverCatalog: OscCatalog;
	public trajectoryCatalog: OscCatalog;
	public routeCatalog: OscCatalog;

	constructor () {

	}

}

export class OscCatalog {

	private m_Directory: OscDirectory;

	constructor ( directory: OscDirectory ) {

		this.m_Directory = directory;

	}
}

export class TrajectoryCatalog extends OscCatalog {

	private trajectories: OscTrajectory[] = [];

	constructor ( directory: OscDirectory ) {

		super( directory );

	}

}

export class OscCatalogReference {

	private parameters: OscParameter[];

	constructor ( public catalogName: string, public entryName: string ) {

	}

	static readXml ( CatalogReference: any ): OscCatalogReference {

		const oscCatalogReference = new OscCatalogReference( null, null );

		oscCatalogReference.catalogName = CatalogReference.attr_catalogName;
		oscCatalogReference.entryName = CatalogReference.attr_entryName;


		return oscCatalogReference;

	}

}

