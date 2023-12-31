/**
 * Defines a corner point on the object’s outline relative to the object's pivot point in local u/v coordinates.
 * The pivot point and the orientation of the object are given by the s/t/heading arguments
 * of the <object> entry.
 */
export class TvCornerLocal {

	/**
	 *
	 * @param attr_id ID of the outline point. Shall be unique within one outline.
	 * @param attr_u Local u-coordinate of the corner
	 * @param attr_v Local v-coordinate of the corner
	 * @param attr_z Local z-coordinate of the corner
	 * @param attr_height Height of the object at this corner, along the z-axis
	 */
	constructor (
		public attr_id: number,
		public attr_u: number,
		public attr_v: number,
		public attr_z: number = 0,
		public attr_height: number = 0,
	) {
	}

	clone () {
		return new TvCornerLocal(
			this.attr_id,
			this.attr_u,
			this.attr_v,
			this.attr_z,
			this.attr_height
		);
	}

}
