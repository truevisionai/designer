/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from 'app/core/utils/console';
import { Directory } from './tv-common';
import { FileHeader } from './tv-file-header';

export enum CatalogType {
	VEHICLE = 'Vehicle',
	CONTROLLER = 'Controller',
	PEDESTRIAN = 'Pedestrian',
	MISC_OBJECT = 'MiscObject',
	ENVIRONMENT = 'Environment',
	MANEUVER = 'Maneuver',
	TRAJECTORY = 'Trajectory',
	ROUTE = 'Route',
}

export class Catalogs {

	private catalogs = new Map<string, Catalog>();

	constructor () { }

	addCatalog ( catalog: Catalog ): void {

		if ( this.catalogs.has( catalog.name ) ) {

			TvConsole.error( 'Catalog with same name already exists' );

		} else {

			this.catalogs.set( catalog.name, catalog );

		}

	}

	getCatalog ( catalogName: string ): Catalog {

		return this.catalogs.get( catalogName );

	}

	getCatalogs (): Catalog[] {

		return Array.from( this.catalogs.values() );

	}

	getEntry ( catalogName: string, entryName: string ): any {

		return this.getCatalog( catalogName )?.getEntry( entryName );

	}

}

export class Catalog {

	public catalogType: CatalogType;

	private entries = new Map<string, any>();

	public fileHeader = new FileHeader();

	constructor (
		public name: string,
		public directory: Directory
	) {
	}

	getEntry<T> ( entryName: string ): T {
		return this.entries.get( entryName );
	}

	getEntries<T> (): T[] {
		return Array.from( this.entries.values() );
	}

	addEntry<T> ( entryName: string, entry: T ): void {
		this.entries.set( entryName, entry );
	}
}

// export class TrajectoryCatalog extends Catalog {

// 	public catalogType = CatalogType.TRAJECTORY;

// 	constructor ( name: string, directory: Directory ) {
// 		super( name, directory );
// 	}
// }


// export class VehicleCatalog extends Catalog {

// 	public catalogType = CatalogType.VEHICLE;

// 	constructor ( name: string, directory: Directory ) {
// 		super( name, directory );
// 	}
// }

export class CatalogReference {

	constructor (
		public catalogName: string,
		public entryName: string,
		private parameterAssignments: ParameterAssignment[] = []
	) {
	}

}

export class ParameterAssignment {
	constructor (
		public parameterRef: string,
		public value: any
	) {

	}
}
