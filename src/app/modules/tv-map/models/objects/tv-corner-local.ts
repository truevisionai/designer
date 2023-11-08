/**
 * Defines a corner point on the object’s outline relative to the object's pivot point in local u/v coordinates.
 * The pivot point and the orientation of the object are given by the s/t/heading arguments
 * of the <object> entry.
 */
export class TvCornerLocal {
	public attr_u: number;
	public attr_v: number;
	public attr_z: number;

	// height of the object at this corner
	public attr_height: number;
}
