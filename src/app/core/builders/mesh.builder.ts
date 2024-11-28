/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { InjectionToken } from "@angular/core";
import { Object3D } from "three";
import { ConstructorFunction } from "../models/class-map";

export const BUILD_PROVIDERS = new InjectionToken<BuilderProvider[]>( 'BUILD_PROVIDERS' );

export interface BuilderProvider {
	key: ConstructorFunction;
	builderClass: new ( ...args: any[] ) => MeshBuilder<any>;
}

export abstract class MeshBuilder<T> {

	public abstract build ( object: T ): Object3D;

}
