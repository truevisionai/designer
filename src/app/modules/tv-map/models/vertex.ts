/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector3, Vector4 } from 'three';

export class Vertex {
	public Position: Vector3;
	public Normal = new Vector3( 0, 0, 1 );
	public Color = new Vector4( 1, 1, 1, 1 );
	public TexCoord: Vector2;
}
