import { Log } from "app/core/utils/log";
import { Color } from "three";

export enum PointColorMode {
	Grey = 'grey',
	Classification = 'classification',
	// OverlayImage = 'overlayImage', // not implemented yet
	Color = 'color',
	Intensity = 'intensity',
	Height = 'height'
}

export class PointCloudSettings {

	public scale: number = 1.0;
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
			attr_scale: this.scale,
			attr_opacity: this.opacity,
			attr_color: this.color.getHex(),
			attr_pointSize: this.pointSize,
			attr_pointsToSkip: this.pointsToSkip,
			attr_colorMode: this.colorMode,
			attr_useCustomIntensity: this.useCustomIntensity,
			attr_intensityMin: this.intensityMin,
			attr_intensityMax: this.intensityMax
		};
	}

	static fromSceneJSON ( json: any ): PointCloudSettings {

		function parseColorMode ( mode: string ): PointColorMode {
			switch ( mode ) {
				case PointColorMode.Grey:
				case PointColorMode.Classification:
				case PointColorMode.Color:
				case PointColorMode.Intensity:
				case PointColorMode.Height:
					return mode;
				default:
					Log.warn( `Unknown color mode: ${ mode }. Defaulting to Grey.` );
					return PointColorMode.Grey; // default fallback
			}
		}

		const settings = new PointCloudSettings();

		settings.scale = parseFloat( json.attr_scale ) || 1.0;
		settings.opacity = parseFloat( json.attr_opacity ) || 1.0;
		settings.color = new Color( parseInt( json.attr_color ) || 0xffffff );
		settings.pointSize = parseFloat( json.attr_pointSize ) || 0.01;
		settings.pointsToSkip = parseInt( json.attr_pointsToSkip ) || 0;
		settings.colorMode = parseColorMode( json.attr_colorMode );
		settings.useCustomIntensity = json.attr_useCustomIntensity || false;
		settings.intensityMin = parseFloat( json.attr_intensityMin ) || 0;
		settings.intensityMax = parseFloat( json.attr_intensityMax ) || 255;

		return settings;
	}
}
