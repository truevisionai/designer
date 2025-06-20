/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { MeshBuilder } from "app/core/builders/mesh.builder";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Object3D } from "three";
import { BuilderFactory } from "../builder.factory";

@Injectable()
export class SplineMeshBuilder implements MeshBuilder<AbstractSpline> {

	constructor ( private builderFactory: BuilderFactory ) { }

	public build ( spline: AbstractSpline ): Object3D {

		const parent = new Object3D();

		spline.getSegments().forEach( segment => {

			const builder = this.builderFactory.getBuilder( segment );

			const mesh = builder.build( segment );

			parent.add( mesh );

		} );

		return parent;

	}

}
