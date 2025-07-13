import * as THREE from "three";
import { Points, PointsMaterial } from "three";
import { PointCloudSettings, PointColorMode } from "./point-cloud-settings";
import { turboColorMap } from "app/utils/turbo-color-map";

export class PointCloudObject extends Points<THREE.BufferGeometry, PointsMaterial> {

	public settings = new PointCloudSettings();

	public assetGuid: string;

	constructor ( assetGuid: string, geometry: THREE.BufferGeometry, material: PointsMaterial ) {
		super( geometry, material );
		this.name = 'PointCloudObject';
		this.assetGuid = assetGuid || THREE.MathUtils.generateUUID();
	}

	get isPointCloudObject (): boolean {
		return true;
	}

	setSettings ( settings: PointCloudSettings ): void {
		this.settings = settings;
	}

	applySettings ( settings: PointCloudSettings ): void {

		this.position.copy( settings.position );
		this.scale.setScalar( settings.scale );

		this.rotation.set(
			THREE.MathUtils.degToRad( settings.rotation.x ),
			THREE.MathUtils.degToRad( settings.rotation.y ),
			THREE.MathUtils.degToRad( settings.rotation.z )
		);

		this.material.size = settings.pointSize;
		this.material.opacity = settings.opacity;
		this.material.transparent = settings.opacity < 1;
		this.material.vertexColors = true;

		// apply color to points
		if ( settings.color ) {
			this.material.color = settings.color;
		}

		// apply points to skip
		if ( settings.pointsToSkip > 0 ) {
			this.geometry.setDrawRange( 0, this.geometry.attributes.position.count - settings.pointsToSkip );
		}

		colorPointCloud( this );
	}

	toSceneJSON (): any {
		return {
			attr_assetGuid: this.assetGuid,
			attr_name: this.name,
			settings: this.settings.toSceneJSON()
		};
	}

	static fromPoints ( points: Points, assetGuid: string ): PointCloudObject {
		return new PointCloudObject( assetGuid, points.geometry, points.material as PointsMaterial );
	}

}

export function isPointCloudObject ( object: any ): object is PointCloudObject {
	return object && object.isPointCloudObject;
}

function colorPointCloud ( object: PointCloudObject ): void {
	const mode = object.settings.colorMode;
	const colors = new Float32Array( object.geometry.getAttribute( 'position' ).count * 3 );

	switch ( mode ) {
		case PointColorMode.Grey:
			colorGrey( object, colors );
			break;
		case PointColorMode.Intensity:
			colorIntensity( object, colors );
			break;
		case PointColorMode.Color:
			colorFromRGBAttribute( object, colors );
			break;
		case PointColorMode.Classification:
			colorByClassification( object, colors );
			break;
		case PointColorMode.Height:
			colorByHeight( object, colors );
			break;
		default:
			console.warn( `Color mode ${ mode } not supported.` );
			break;
	}

	const colorAttr = new THREE.BufferAttribute( colors, 3 );
	object.geometry.setAttribute( 'color', colorAttr );
	object.material.vertexColors = true;
	object.material.needsUpdate = true;
}

function colorGrey ( object: PointCloudObject, colors: Float32Array ): void {
	for ( let i = 0; i < colors.length / 3; i++ ) {
		colors.set( [ 0.5, 0.5, 0.5 ], i * 3 );
	}
}

function colorIntensity ( object: PointCloudObject, colors: Float32Array ): void {
	const attr = object.geometry.getAttribute( 'intensity' );
	if ( !attr ) return;

	const { intensityMin, intensityMax, useCustomIntensity } = object.settings;

	for ( let i = 0; i < attr.count; i++ ) {
		let value = attr.getX( i );
		if ( useCustomIntensity ) {
			value = ( value - intensityMin ) / ( intensityMax - intensityMin );
			value = THREE.MathUtils.clamp( value, 0, 1 );
		}
		colors.set( [ value, value, value ], i * 3 );
	}
}

function colorFromRGBAttribute ( object: PointCloudObject, colors: Float32Array ): void {
	const attr = object.geometry.getAttribute( 'color' );
	if ( !attr ) return;

	for ( let i = 0; i < attr.count; i++ ) {
		const r = attr.getX( i );
		const g = attr.getY( i );
		const b = attr.getZ( i );
		colors.set( [ r, g, b ], i * 3 );
	}
}

function colorByClassification ( object: PointCloudObject, colors: Float32Array ): void {
	const attr = object.geometry.getAttribute( 'classification' );
	if ( !attr ) return;

	const map = getClassificationColorMap();

	for ( let i = 0; i < attr.count; i++ ) {
		const cls = attr.getX( i );
		const c = map[ cls ] ?? [ 0.5, 0.5, 0.5 ];
		colors.set( c, i * 3 );
	}
}

function colorByHeight ( object: PointCloudObject, colors: Float32Array ): void {
	const attr = object.geometry.getAttribute( 'position' );
	const array = attr.array as Float32Array;
	const count = attr.count;

	let minZ = Infinity, maxZ = -Infinity;

	// Step 1: Compute min/max Z (optimized loop: skip every 3 values until Z)
	for ( let i = 2; i < array.length; i += 3 ) {
		const z = array[ i ];
		if ( z < minZ ) minZ = z;
		if ( z > maxZ ) maxZ = z;
	}

	const range = maxZ - minZ || 1;

	// Step 2: Normalize Z and assign RGB
	for ( let i = 0, j = 2; i < count; i++, j += 3 ) {
		const z = array[ j ];
		const t = ( z - minZ ) / range;
		const [ r, g, b ] = getTurboColor( t );
		colors.set( [ r, g, b ], i * 3 );
	}
}

function getHeightColor ( t: number ): [ number, number, number ] {
	// Simple blue to red gradient
	const r = t;
	const g = 0.5 * ( 1 - t );
	const b = 1 - t;
	return [ r, g, b ];
}

function getClassificationColorMap (): { [ key: number ]: [ number, number, number ] } {
	return {
		0: [ 0.8, 0.8, 0.8 ],
		1: [ 0.0, 1.0, 0.0 ],
		2: [ 0.0, 0.0, 1.0 ],
		3: [ 1.0, 0.0, 0.0 ],
	};
}

function getTurboColor ( t: number ): [ number, number, number ] {
	const index = Math.floor( THREE.MathUtils.clamp( t, 0, 1 ) * 255 );
	const color = turboColorMap[ index ];

	if ( !color || color.length !== 3 ) {
		console.warn( 'Invalid turboColorMap entry at index', index, color );
		return [ 1, 0, 1 ]; // bright magenta = fallback
	}

	return color;
}
