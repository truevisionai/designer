/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class MeshGeometryData {
	public vertices: number[] = [];
	public triangles = [];n
	public currentIndex = 0;
	public indices: number[] = [];
	public colors: number[] = [];
	public normals: number[] = [];
	public texCoords: number[] = [];
	public material: any;
}
