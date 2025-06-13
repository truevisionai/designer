/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/**
 * For objects like patches which are within the road surface (and, typically, coplanar to the surface) and
 * which represent a local deviation from the standard road material, a description of the material
 * properties is required. This description supercedes the one provided by the Road Material record and,
 * again, is valid only within the outline of the parent road object.
 */
export class TvObjectMaterial {

	/**
	 * Describes the material properties of objects, for example, patches that
	 * are part of the road surface but deviate from the standard road material.
	 * Supersedes the material specified in the <road material> element and
	 * is valid only within the outline of the parent road object.
	 *
	 * @param attr_surface Surface material code, depending on application
	 * @param attr_friction Friction value, depending on application
	 * @param attr_roughness Roughness, for example, for sound and motion systems, depending on application
	 * @param attr_roadMarkColor Color of the painted road mark. added in 1.8.0
	 */
	constructor (
		public attr_surface?: string,
		public attr_friction?: number,
		public attr_roughness?: number,
		public attr_roadMarkColor?: number,
	) {
	}

	clone (): TvObjectMaterial {
		return new TvObjectMaterial(
			this.attr_surface,
			this.attr_friction,
			this.attr_roughness,
			this.attr_roadMarkColor,
		);
	}

	toXODR (): Record<string, any> {
		return {
			attr_surface: this.attr_surface,
			attr_friction: this.attr_friction,
			attr_roughness: this.attr_roughness,
		}
	}

}
