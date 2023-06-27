/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class MeshGeometryData {
	public vertices: number[] = [];
	public triangles = [];
	public currentIndex = 0;
	public indices: number[] = [];
	public colors: number[] = [];
	public normals: number[] = [];
	public uvs: number[] = [];
	public material: any;
}
