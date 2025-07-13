import { Vector3, Color } from "three";

export enum PointColorMode {
	Grey = 'grey',
	Classification = 'classification',
	// OverlayImage = 'overlayImage', // not implemented yet
	Color = 'color',
	Intensity = 'intensity',
	Height = 'height'
}

export class PointCloudSettings {

	public position: Vector3 = new Vector3( 0, 0, 0 );
	public scale: number = 1.0;
	public rotation: Vector3 = new Vector3( 0, 0, 0 );
	public opacity: number = 1.0;
	public color: Color = new Color( 0xffffff );
	public pointSize: number = 0.01;
	public pointsToSkip: number = 0;

	public colorMode: PointColorMode = PointColorMode.Grey;
	public useCustomIntensity: boolean = false;
	public intensityMin: number = 0;
	public intensityMax: number = 255;

	toSceneJSON (): any {
		return {
			position: {
				attr_x: this.position.x,
				attr_y: this.position.y,
				attr_z: this.position.z
			},
			rotation: {
				attr_x: this.rotation.x,
				attr_y: this.rotation.y,
				attr_z: this.rotation.z
			},
			attr_scale: this.scale,
			attr_opacity: this.opacity,
			attr_color: this.color.toJSON(),
			attr_pointSize: this.pointSize,
			attr_pointsToSkip: this.pointsToSkip,
			attr_colorMode: this.colorMode,
			attr_useCustomIntensity: this.useCustomIntensity,
			attr_intensityMin: this.intensityMin,
			attr_intensityMax: this.intensityMax
		};
	}

	static fromSceneJSON ( json: any ): PointCloudSettings {

		const settings = new PointCloudSettings();

		settings.position.set(
			parseFloat( json.position?.attr_x ) || 0,
			parseFloat( json.position?.attr_y ) || 0,
			parseFloat( json.position?.attr_z ) || 0
		);

		settings.rotation.set(
			parseFloat( json.rotation?.attr_x ) || 0,
			parseFloat( json.rotation?.attr_y ) || 0,
			parseFloat( json.rotation?.attr_z ) || 0
		);

		settings.scale = parseFloat( json.attr_scale ) || 1.0;
		settings.opacity = parseFloat( json.attr_opacity ) || 1.0;
		settings.color = new Color( parseInt( json.attr_color ) || 0xffffff );
		settings.pointSize = parseFloat( json.attr_pointSize ) || 0.01;
		settings.pointsToSkip = parseInt( json.attr_pointsToSkip ) || 0;
		settings.colorMode = json.attr_colorMode || PointColorMode.Grey;
		settings.useCustomIntensity = json.attr_useCustomIntensity || false;
		settings.intensityMin = parseFloat( json.attr_intensityMin ) || 0;
		settings.intensityMax = parseFloat( json.attr_intensityMax ) || 255;

		return settings;
	}
}
