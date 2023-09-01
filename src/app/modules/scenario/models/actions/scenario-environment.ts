/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { TvBoundingBox } from '../tv-bounding-box';
import { ParameterDeclaration } from '../tv-parameter-declaration';
import { TvProperty } from '../tv-properties';
import { Vector3 } from 'three';
// import { AppService } from 'app/core/services/app.service';

enum CloudState {
	Cloudy = 'cloudy',
	Free = 'free',
	Overcast = 'overcast',
	Rainy = 'rainy',
	SkyOff = 'skyOff',
}

enum FractionalCloudCover {
	ZeroOktas = 'zeroOktas',
	OneOktas = 'oneOktas',
	TwoOktas = 'twoOktas',
	ThreeOktas = 'threeOktas',
	FourOktas = 'fourOktas',
	FiveOktas = 'fiveOktas',
	SixOktas = 'sixOktas',
	SevenOktas = 'sevenOktas',
	EightOktas = 'eightOktas',
	NineOktas = 'nineOktas',
}

class Weather {

	/**
	 *
	 * @param sun
	 * @param fog
	 * @param precipitation
	 * @param wind
	 * @param domeImage
	 * @param cloudState
	 * @param atmosphericPressure Reference atmospheric pressure at z=0.0 in world coordinate system.
	 * 								Unit: [Pa]. Range: [80000..120000]. The actual atmospheric pressure
	 * 								around the entities of the scenario has to be calculated depending on
	 * 								their z position. See also the Standard Atmosphere as defined in ISO2533.
	 * @param temperature Outside temperature at z=0.0 in world coordinate system.
	 * 						Unit: [K]. Range: [170..340].
	 * 						The actual outside temperature around the entities of the scenario has to be
	 * 						calculated depending on their z position.
	 * @param fractionalCloudCover Definition of cloud states using the fractional cloud cover in oktas.
	 */
	constructor (
		public sun = new Sun(),
		public fog = new Fog(),
		public precipitation: Precipitation = new Precipitation(),
		public wind: Wind = new Wind(),
		public domeImage: DomeImage = null,
		public cloudState = CloudState.Free,
		public atmosphericPressure = 80000,
		public temperature = 300,
		public fractionalCloudCover = FractionalCloudCover.ZeroOktas
	) {

	}

	static fromXML ( xml: XmlElement ) {

		const sun = xml.Sun;
		const fog = xml.Fog;
		const precipitation = xml.Precipitation;
		const wind = xml.Wind;
		const domeImage = xml.DomeImage;

		const cloudState = xml.attr_cloudState;
		const atmosphericPressure = xml.attr_atmosphericPressure;
		const temperature = xml.attr_temperature;
		const fractionalCloudCover = xml.attr_fractionalCloudCover;

		return new Weather( sun, fog, precipitation, wind, domeImage, cloudState, atmosphericPressure, temperature, fractionalCloudCover );

	}
}

class Sun {

	/**
	 *
	 * @param _azimuth azimoith angle in radians counted clockwise 0=north pi/2=east pi=south 3pi/2=west Range[0,2*PI]
	 * @param _elevation solar elevation angle in radians Range[-PI,PI] 0=x/y plane, PI/2=zenith
	 * @param _illuminance illuminance in lux Range[0,inf]
	 */
	constructor (
		private _azimuth: number = 0,
		private _elevation: number = 0,
		private _illuminance: number = 1,
	) {
	}

	@SerializedField( { 'type': 'float', 'min': 0, 'max': 2 * Math.PI } )
	get azimuth () { return this._azimuth; }

	set azimuth ( value: number ) { this._azimuth = value; this.updated(); }

	@SerializedField( { 'type': 'float', 'min': -Math.PI, 'max': Math.PI } )
	get elevation () { return this._elevation; }

	set elevation ( value: number ) { this._elevation = value; this.updated(); }

	@SerializedField( { 'type': 'float', 'min': 0, 'max': 100000 } )
	get illuminance () { return this._illuminance; }

	set illuminance ( value: number ) { this._illuminance = value; this.updated(); }

	private get direction () {
		return new Vector3(
			Math.cos( this._elevation ) * Math.cos( this._azimuth ),
			Math.sin( this._elevation ),
			Math.cos( this._elevation ) * Math.sin( this._azimuth )
		)
	}

	updated () {

		// const directionalLight = AppService.three.directionLight;

		// // Calculate the light direction based on azimuth and elevation
		// const lightDirection = this.direction.normalize();

		// // Set the light position based on the direction
		// directionalLight.position.copy( lightDirection );

		// // Set the light intensity
		// directionalLight.intensity = this.illuminance;

	}


	private applyLight () {


		// // Convert azimuth and elevation to radians
		// const azimuthRad = THREE.MathUtils.degToRad(sun.azimuth);
		// const elevationRad = THREE.MathUtils.degToRad(sun.elevation);
		//
		// // Calculate the light direction based on azimuth and elevation
		// const lightDirection = new THREE.Vector3(
		// 	Math.cos(elevationRad) * Math.cos(azimuthRad),
		// 	Math.sin(elevationRad),
		// 	Math.cos(elevationRad) * Math.sin(azimuthRad)
		// ).normalize();
		//
		// // Set the light position based on the direction
		// light.position.copy(lightDirection);
		//
		// // Set the light intensity
		// light.intensity = sun.intensity;
	}
}

class Fog {
	/**
	 *
	 * @param boundingBox Dimensions and center of fog in fixed coordinates.
	 * @param visualRange Unit: [m]. Range: [0..inf[.
	 */
	constructor (
		public boundingBox: TvBoundingBox = new TvBoundingBox(),
		public visualRange: number = 100
	) {
	}
}

class Precipitation {

	/**
	 *
	 * @param precipitationType Type of the precipitation.
	 * @param precipitationIntensity The intensity of the precipitation (valid for all precipitation types). Unit: [mm/h]. Range: [0..inf[.
	 */
	constructor (
		public precipitationType: PrecipitationType = PrecipitationType.dry,
		public precipitationIntensity: number = 0,
	) {
	}

}

enum PrecipitationType {
	dry = 'dry',
	rain = 'rain',
	snow = 'snow'
}

class Wind {

	/**
	 *
	 * @param direction Corresponds to the heading/yaw angle. x-axis-direction is 0 rad. Unit: [rad]. Range: [0..2*PI[.
	 * @param speed The wind speed. Unit: [m/s]. Range: [0..inf]
	 */
	constructor ( public direction: number = 0, public speed: number = 0 ) {

	}

}

class DomeImage {
	DomeFile: string;
	azimuthOffset?: number;
}

class TimeOfDay {

	animation: boolean; // If true, the timeofday is animated with progressing simulation time, e.g. in order to animate the position of the sun.
	dateTime: Date;

	constructor ( animation: boolean, dateTime: Date ) {
		this.animation = animation;
		this.dateTime = dateTime;
	}

	static fromXML ( xml: XmlElement ) {
		const animation = xml.attr_animation;
		const dateTime = xml.attr_dateTime;
		return new TimeOfDay( animation, dateTime );
	}
}

enum Wetness {
	Dry = 'dry',
	Moist = 'moist',
	WetWithPuddles = 'wetWithPuddles',
	LowFlooded = 'lowFlooded',
	HighFlooded = 'highFlooded',
}


class RoadCondition {
	constructor (
		public wetness: Wetness = Wetness.Dry,
		public friction: number = 0,
		public properties: TvProperty[] = []
	) {
	}

	static fromXML ( xml: XmlElement ) {
		const wetness = xml.attr_wetness;
		const friction = xml.attr_friction;
		return new RoadCondition( wetness, friction, [] );
	}
}

export class ScenarioEnvironment {

	constructor (
		private _name: string,
		public timeOfDay: TimeOfDay = new TimeOfDay( false, new Date() ),
		public weather: Weather = new Weather(),
		public roadCondition: RoadCondition = new RoadCondition(),
		public parameterDeclarations: ParameterDeclaration[] = []
	) {
	}

	@SerializedField( { type: 'string' } )
	get name (): string {
		return this._name;
	}

	set name ( value: string ) {
		this._name = value;
	}

	static fromXML ( xml: XmlElement ) {

		const name = xml.attr_name;

		const timeOfDay = TimeOfDay.fromXML( xml?.TimeOfDay );

		const weather = Weather.fromXML( xml?.Weather );

		const roadCondition = RoadCondition.fromXML( xml?.RoadCondition );

		return new ScenarioEnvironment( name, timeOfDay, weather, roadCondition, [] );
	}
}
