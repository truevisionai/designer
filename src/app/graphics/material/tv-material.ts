import { Material } from "three";

export class TvMaterial extends Material {

	constructor ( public guid: string ) {
		super();
		this.userData.guid = guid;
		this.guid = guid;
	}

}
