import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Mesh, BufferGeometry, Material } from "three";

export class JunctionOverlay extends Mesh {

	static tag = 'junction';

	tag = JunctionOverlay.tag;

	constructor ( public junction: TvJunction, geometry: BufferGeometry, material: Material ) {

		super( geometry, material );

	}

}
