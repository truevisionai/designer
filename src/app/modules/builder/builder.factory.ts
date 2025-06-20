/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Inject, Injectable, Injector } from "@angular/core";
import { MeshBuilder, BUILD_PROVIDERS, BuilderProvider } from "app/core/builders/mesh.builder";
import { ConstructorFunction } from "app/core/models/class-map";

@Injectable( {
	providedIn: 'root'
} )
export class BuilderFactory {

	private builderMap = new Map<ConstructorFunction, MeshBuilder<any>>();

	constructor (
		@Inject( BUILD_PROVIDERS ) private providers: BuilderProvider[],
		private injector: Injector
	) {
		this.init();
	}

	private init (): void {
		this.providers.forEach( ( provider ) => {
			const builderInstance = this.injector.get( provider.builderClass );
			this.builderMap.set( provider.key, builderInstance );
		} );
	}

	getBuilder<T> ( object: object ): MeshBuilder<T> {
		return this.builderMap.get( object.constructor as ConstructorFunction ) as MeshBuilder<T>;
	}

}
