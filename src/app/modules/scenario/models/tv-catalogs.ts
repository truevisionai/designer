/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Directory } from './tv-common';
import { Parameter } from './tv-parameter-declaration';
import { Trajectory } from './tv-trajectory';


export class Catalogs {

	public static truevisionCatalog = 'TruevisionCatalog';
	public static truevisionDefaultController = 'DefaultController';

	public vehicleCatalog: Catalog;
	public driverCatalog: Catalog;
	public pedestrianCatalog: Catalog;
	public pedestrianControllerCatalog: Catalog;
	public miscObjectCatalog: Catalog;
	public environmentCatalog: Catalog;
	public maneuverCatalog: Catalog;
	public trajectoryCatalog: Catalog;
	public routeCatalog: Catalog;

	constructor () {

	}

}

export class Catalog {

	private m_Directory: Directory;

	constructor ( directory: Directory ) {

		this.m_Directory = directory;

	}
}

export class TrajectoryCatalog extends Catalog {

	private trajectories: Trajectory[] = [];

	constructor ( directory: Directory ) {

		super( directory );

	}

}

export class CatalogReference {

	private parameters: Parameter[];

	constructor ( public catalogName: string, public entryName: string ) {

	}

	static readXml ( CatalogReference: any ): CatalogReference {

		const oscCatalogReference = new CatalogReference( null, null );

		oscCatalogReference.catalogName = CatalogReference.attr_catalogName;
		oscCatalogReference.entryName = CatalogReference.attr_entryName;


		return oscCatalogReference;

	}

}

