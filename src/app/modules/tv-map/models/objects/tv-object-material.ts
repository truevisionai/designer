/**
 * For objects like patches which are within the road surface (and, typically, coplanar to the surface) and
 * which represent a local deviation from the standard road material, a description of the material
 * properties is required. This description supercedes the one provided by the Road Material record and,
 * again, is valid only within the outline of the parent road object.
 */
export class TvObjectMaterial {
	public attr_surface: string;
	public attr_friction: number;
	public attr_roughness: number;
}
