/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from "three";

export abstract class MeshBuilder<T> {

	public abstract build ( object: T ): Object3D;

}