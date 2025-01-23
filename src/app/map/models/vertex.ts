/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector3, Vector4 } from "three";

export class Vertex {
	public position: Vector3;
	public normal = new Vector3( 0, 0, 1 );
	public color = new Vector4( 1, 1, 1, 1 );
	public uvs: Vector2;

	constructor ( position?: Vector3, uvs?: Vector2 ) {
		this.position = position;
		this.uvs = uvs;
	}
}
