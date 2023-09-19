/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { TvBoundingBox } from '../tv-bounding-box';
import { ParameterDeclaration } from '../tv-parameter-declaration';
import { TvProperty } from '../tv-properties';
import { Color, DirectionalLight, Vector3, WebGLCubeRenderTarget } from 'three';
import { SceneService } from 'app/core/services/scene.service';
import * as THREE from 'three';
import { AssetDatabase } from 'app/core/asset/asset-database';

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
		public domeImage: DomeImage = new DomeImage(),
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

	static import ( xml: XmlElement ) {

		const sun = xml.Sun ? Sun.import( xml.Sun ) : new Sun();
		// const fog = xml.Fog;
		// const precipitation = xml.Precipitation;
		// const wind = xml.Wind;
		// const domeImage = xml.DomeImage;

		// const cloudState = xml.attr_cloudState;
		// const atmosphericPressure = xml.attr_atmosphericPressure;
		// const temperature = xml.attr_temperature;
		// const fractionalCloudCover = xml.attr_fractionalCloudCover;

		return new Weather( sun );

	}

	export () {
		return {
			Sun: this.sun.export(),
		}
	}

}

class Sun {

	public light: DirectionalLight;

	/**
	 *
	 * @param _azimuth azimoith angle in radians counted clockwise 0=north pi/2=east pi=south 3pi/2=west Range[0,2*PI]
	 * @param _elevation solar elevation angle in radians Range[-PI,PI] 0=x/y plane, PI/2=zenith
	 * @param _illuminance illuminance in lux Range[0,inf]
	 */
	constructor (
		private _azimuth: number = 1,
		private _elevation: number = 0,
		private _illuminance: number = 1,
		color: number = 0xffffff
	) {

		const position = this.direction.normalize();

		this.light = new DirectionalLight( color, this.illuminance );

		this.light.position.set( position.x, position.y, position.z );
	}

	@SerializedField( { 'type': 'color' } )
	get color () { return this.light.color; }

	set color ( value: Color ) {
		this.light.color = value;
		this.update();
	}

	@SerializedField( { 'type': 'float', 'min': 0, 'max': 2 * Math.PI } )
	get azimuth () { return this._azimuth; }

	set azimuth ( value: number ) {
		this._azimuth = value;
		this.update();
	}

	@SerializedField( { 'type': 'float', 'min': -Math.PI, 'max': Math.PI } )
	get elevation () { return this._elevation; }

	set elevation ( value: number ) {
		this._elevation = value;
		this.update();
	}

	@SerializedField( { 'type': 'float', 'min': 0, 'max': 100000 } )
	get illuminance () { return this._illuminance; }

	set illuminance ( value: number ) {
		this._illuminance = value;
		this.update();
	}

	private get direction () {
		return new Vector3(
			Math.cos( this._elevation ) * Math.cos( this._azimuth ),
			Math.sin( this._elevation ),
			Math.cos( this._elevation ) * Math.sin( this._azimuth )
		)
	}

	update () {

		const lightDirection = this.direction.normalize();

		this.light.position.copy( lightDirection );

		this.light.intensity = this.illuminance;

	}

	static import ( xml: XmlElement ) {

		const azimuth: number = parseFloat( xml.attr_azimuth ) || 1;
		const elevation: number = parseFloat( xml.attr_elevation ) || 0;
		const illuminance: number = parseFloat( xml.attr_illuminance ) || 1;
		const sun = new Sun( azimuth, elevation, illuminance );

		sun.light.color.setRGB( xml?.Color?.attr_r || 1, xml?.Color?.attr_g || 1, xml?.Color?.attr_b || 1 );

		return sun
	}

	export () {

		return {
			'attr_azimuth': this.azimuth,
			'attr_elevation': this.elevation,
			'attr_illuminance': this.illuminance,
			'Color': {
				'attr_r': this.color.r,
				'attr_g': this.color.g,
				'attr_b': this.color.b,
			}
		}

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

	private texture: THREE.DataTexture;
	private renderTarget: WebGLCubeRenderTarget;
	private cubeCamera: THREE.CubeCamera;

	constructor ( private _textureGuid: string = null, private _azimuthOffset: number = 0 ) {

		this.update();

	}

	@SerializedField( { type: 'texture' } )
	get cubemap (): string {
		return this._textureGuid;
	}

	set cubemap ( value: string ) {
		this._textureGuid = value;
		this.update();
	}

	@SerializedField( { type: 'float' } )
	get azimouth (): number {
		return this._azimuthOffset;
	}

	set azimouth ( value: number ) {
		this._azimuthOffset = value;
		this.texture.rotation = value;
		this.update();
	}

	@SerializedField( { type: 'vector2' } )
	get offset (): THREE.Vector2 {
		return this.texture?.offset;
	}

	set offset ( value: THREE.Vector2 ) {
		this.texture.offset = value;
		this.texture.needsUpdate = true;
		this.update();
	}

	update () {

		// const dome = this;

		// new RGBELoader().setPath( 'assets/default-hdr/' ).load( 'quarry_01_1k.hdr', function ( texture: THREE.DataTexture ) {

		if ( this._textureGuid == null ) {

			SceneService.scene.background = new THREE.Color( 0x333333 );

			SceneService.scene.environment = null;

			return;

		};

		if ( this._textureGuid == 'default' ) return;

		const texture = AssetDatabase.getInstance<THREE.DataTexture>( this._textureGuid );

		if ( !texture ) return;

		texture.mapping = THREE.EquirectangularReflectionMapping;

		this.texture = texture;

		this.renderTarget = new THREE.WebGLCubeRenderTarget( 256 );

		this.renderTarget.texture.type = THREE.HalfFloatType;

		const scene = new THREE.Scene();

		scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) );

		scene.add( new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 ) );

		const sphereGeometry = new THREE.SphereGeometry( 1000, 120, 80 );

		sphereGeometry.scale( -1, 1, 1 );  // Invert the sphere geometry to render its inside.

		const sphereMaterial = new THREE.MeshBasicMaterial( { map: this.texture } );

		const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );

		scene.add( sphereMesh );

		sphereMesh.rotateX( Math.PI / 2 );

		this.cubeCamera = new THREE.CubeCamera( 1, 1000, this.renderTarget )

		this.cubeCamera.update( SceneService.renderer, scene );

		this.renderTarget.texture.rotation = this.azimouth;

		this.renderTarget.texture.offset = this.offset;

		SceneService.scene.background = SceneService.scene.environment = this.renderTarget.texture;

		SceneService.removeHelper( sphereMesh );

	}

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

	export () {
		return {
			'attr_name': this.name,
			Weather: this.weather.export()
		}
	}

	static import ( xml: XmlElement ): ScenarioEnvironment {

		const name = xml.attr_name || 'Default';

		const timeOfDay = new TimeOfDay( false, new Date() );

		const weather = xml?.Weather ? Weather.import( xml?.Weather ) : new Weather();

		const roadCondition = new RoadCondition();

		return new ScenarioEnvironment( name, timeOfDay, weather, roadCondition, [] );

	}

}
