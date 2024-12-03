/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	BoxGeometry,
	CanvasTexture,
	Color,
	Euler,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	Quaternion,
	Raycaster,
	Sprite,
	SpriteMaterial,
	Vector2,
	Vector3,
	Vector4
} from 'three';

export class TvViewHelper extends Object3D {

	public isViewHelper: boolean = true;
	public animating: boolean = false;
	public center: Vector3 = new Vector3();


	private point = new Vector3();
	private dim = 128;
	private turnRate = 2 * Math.PI; // turn rate in angles per second

	private targetPosition = new Vector3();
	private targetQuaternion = new Quaternion();

	private posXAxisHelper: Sprite;
	private posYAxisHelper: Sprite;
	private posZAxisHelper: Sprite;
	private negXAxisHelper: Sprite;
	private negYAxisHelper: Sprite;
	private negZAxisHelper: Sprite;

	private interactiveObjects = [];
	private raycaster = new Raycaster();
	private mouse = new Vector2();
	private dummy = new Object3D();

	private orthoCamera: OrthographicCamera = new OrthographicCamera( -2, 2, 2, -2, 0, 4 );
	private geometry: BoxGeometry;
	private xAxis: Mesh<BoxGeometry, MeshBasicMaterial>;
	private yAxis: Mesh<BoxGeometry, MeshBasicMaterial>;
	private zAxis: Mesh<BoxGeometry, MeshBasicMaterial>;

	private q1 = new Quaternion();
	private q2 = new Quaternion();
	private viewport = new Vector4();
	private radius = 0;

	constructor ( private camera: OrthographicCamera, public domElement: HTMLElement ) {
		super();

		const color1: Color = new Color( '#ff3653' );
		const color2: Color = new Color( '#8adb00' );
		const color3: Color = new Color( '#2c8fff' );

		this.orthoCamera.position.set( 0, 0, 2 );

		this.geometry = new BoxGeometry( 0.8, 0.05, 0.05 ).translate( 0.4, 0, 0 );

		function getAxisMaterial ( color ): MeshBasicMaterial {
			return new MeshBasicMaterial( { color: color, toneMapped: false } );
		}

		this.xAxis = new Mesh( this.geometry, getAxisMaterial( color1 ) );
		this.yAxis = new Mesh( this.geometry, getAxisMaterial( color2 ) );
		this.zAxis = new Mesh( this.geometry, getAxisMaterial( color3 ) );

		this.yAxis.rotation.z = Math.PI / 2;
		this.zAxis.rotation.y = -Math.PI / 2;

		this.add( this.xAxis );
		this.add( this.zAxis );
		this.add( this.yAxis );

		this.posXAxisHelper = new Sprite( getSpriteMaterial( color1, 'X' ) );
		this.posXAxisHelper.userData.type = 'posX';
		this.posYAxisHelper = new Sprite( getSpriteMaterial( color2, 'Y' ) );
		this.posYAxisHelper.userData.type = 'posY';
		this.posZAxisHelper = new Sprite( getSpriteMaterial( color3, 'Z' ) );
		this.posZAxisHelper.userData.type = 'posZ';
		this.negXAxisHelper = new Sprite( getSpriteMaterial( color1 ) );
		this.negXAxisHelper.userData.type = 'negX';
		this.negYAxisHelper = new Sprite( getSpriteMaterial( color2 ) );
		this.negYAxisHelper.userData.type = 'negY';
		this.negZAxisHelper = new Sprite( getSpriteMaterial( color3 ) );
		this.negZAxisHelper.userData.type = 'negZ';

		this.posXAxisHelper.position.x = 1;
		this.posYAxisHelper.position.y = 1;
		this.posZAxisHelper.position.z = 1;
		this.negXAxisHelper.position.x = -1;
		this.negXAxisHelper.scale.setScalar( 0.8 );
		this.negYAxisHelper.position.y = -1;
		this.negYAxisHelper.scale.setScalar( 0.8 );
		this.negZAxisHelper.position.z = -1;
		this.negZAxisHelper.scale.setScalar( 0.8 );

		this.add( this.posXAxisHelper );
		this.add( this.posYAxisHelper );
		this.add( this.posZAxisHelper );
		this.add( this.negXAxisHelper );
		this.add( this.negYAxisHelper );
		this.add( this.negZAxisHelper );

		this.interactiveObjects.push( this.posXAxisHelper );
		this.interactiveObjects.push( this.posYAxisHelper );
		this.interactiveObjects.push( this.posZAxisHelper );
		this.interactiveObjects.push( this.negXAxisHelper );
		this.interactiveObjects.push( this.negYAxisHelper );
		this.interactiveObjects.push( this.negZAxisHelper );

		function getSpriteMaterial ( color: Color, text: string | null = null ): SpriteMaterial {
			const canvas = document.createElement( 'canvas' );
			canvas.width = 64;
			canvas.height = 64;

			const context = canvas.getContext( '2d' );
			context.beginPath();
			context.arc( 32, 32, 16, 0, 2 * Math.PI );
			context.closePath();
			context.fillStyle = color.getStyle();
			context.fill();

			if ( text !== null ) {

				context.font = '24px Arial';
				context.textAlign = 'center';
				context.fillStyle = '#000000';
				context.fillText( text, 32, 41 );

			}

			const texture = new CanvasTexture( canvas );

			return new SpriteMaterial( { map: texture, toneMapped: false } );
		}
	}

	render ( renderer: any ): void { // Define the appropriate type for 'renderer'

		this.quaternion.copy( this.camera.quaternion ).invert();
		this.updateMatrixWorld();

		this.point.set( 0, 0, 1 );
		this.point.applyQuaternion( this.camera.quaternion );

		if ( this.point.x >= 0 ) {

			this.posXAxisHelper.material.opacity = 1;
			this.negXAxisHelper.material.opacity = 0.5;

		} else {

			this.posXAxisHelper.material.opacity = 0.5;
			this.negXAxisHelper.material.opacity = 1;

		}

		if ( this.point.y >= 0 ) {

			this.posYAxisHelper.material.opacity = 1;
			this.negYAxisHelper.material.opacity = 0.5;

		} else {

			this.posYAxisHelper.material.opacity = 0.5;
			this.negYAxisHelper.material.opacity = 1;

		}

		if ( this.point.z >= 0 ) {

			this.posZAxisHelper.material.opacity = 1;
			this.negZAxisHelper.material.opacity = 0.5;

		} else {

			this.posZAxisHelper.material.opacity = 0.5;
			this.negZAxisHelper.material.opacity = 1;

		}

		//

		const x = this.domElement.offsetWidth - this.dim;

		renderer.clearDepth();

		renderer.getViewport( this.viewport );
		renderer.setViewport( x, 0, this.dim, this.dim );

		renderer.render( this, this.orthoCamera );

		renderer.setViewport( this.viewport.x, this.viewport.y, this.viewport.z, this.viewport.w );

	}

	handleClick ( event: MouseEvent ): boolean {

		if ( this.animating === true ) return false;

		const rect = this.domElement.getBoundingClientRect();
		const offsetX = rect.left + ( this.domElement.offsetWidth - this.dim );
		const offsetY = rect.top + ( this.domElement.offsetHeight - this.dim );
		this.mouse.x = ( ( event.clientX - offsetX ) / ( rect.width - offsetX ) ) * 2 - 1;
		this.mouse.y = -( ( event.clientY - offsetY ) / ( rect.bottom - offsetY ) ) * 2 + 1;

		this.raycaster.setFromCamera( this.mouse, this.orthoCamera );

		const intersects = this.raycaster.intersectObjects( this.interactiveObjects );

		if ( intersects.length > 0 ) {

			const intersection = intersects[ 0 ];
			const object = intersection.object;

			this.prepareAnimationData( object, this.center );

			this.animating = true;

			return true;

		} else {

			return false;

		}
	}

	update ( delta: number ): void {
		const step = delta * this.turnRate;

		// animate position by doing a slerp and then scaling the position on the unit sphere

		this.q1.rotateTowards( this.q2, step );
		this.camera.position.set( 0, 0, 1 ).applyQuaternion( this.q1 ).multiplyScalar( this.radius ).add( this.center );

		// animate orientation

		this.camera.quaternion.rotateTowards( this.targetQuaternion, step );

		if ( this.q1.angleTo( this.q2 ) === 0 ) {

			this.animating = false;

		}
	}

	dispose (): void {
		this.geometry.dispose();

		this.xAxis.material.dispose();
		this.yAxis.material.dispose();
		this.zAxis.material.dispose();

		this.posXAxisHelper.material.map.dispose();
		this.posYAxisHelper.material.map.dispose();
		this.posZAxisHelper.material.map.dispose();
		this.negXAxisHelper.material.map.dispose();
		this.negYAxisHelper.material.map.dispose();
		this.negZAxisHelper.material.map.dispose();

		this.posXAxisHelper.material.dispose();
		this.posYAxisHelper.material.dispose();
		this.posZAxisHelper.material.dispose();
		this.negXAxisHelper.material.dispose();
		this.negYAxisHelper.material.dispose();
		this.negZAxisHelper.material.dispose();
	}

	prepareAnimationData ( object, focusPoint ): void {

		switch ( object.userData.type ) {

			case 'posX':
				this.targetPosition.set( 1, 0, 0 );
				this.targetQuaternion.setFromEuler( new Euler( 0, Math.PI * 0.5, 0 ) );
				break;

			case 'posY':
				this.targetPosition.set( 0, 1, 0 );
				this.targetQuaternion.setFromEuler( new Euler( -Math.PI * 0.5, 0, 0 ) );
				break;

			case 'posZ':
				this.targetPosition.set( 0, 0, 1 );
				this.targetQuaternion.setFromEuler( new Euler() );
				break;

			case 'negX':
				this.targetPosition.set( -1, 0, 0 );
				this.targetQuaternion.setFromEuler( new Euler( 0, -Math.PI * 0.5, 0 ) );
				break;

			case 'negY':
				this.targetPosition.set( 0, -1, 0 );
				this.targetQuaternion.setFromEuler( new Euler( Math.PI * 0.5, 0, 0 ) );
				break;

			case 'negZ':
				this.targetPosition.set( 0, 0, -1 );
				this.targetQuaternion.setFromEuler( new Euler( 0, Math.PI, 0 ) );
				break;

			default:
				console.error( 'ViewHelper: Invalid axis.' );

		}

		//

		this.radius = this.camera.position.distanceTo( focusPoint );
		this.targetPosition.multiplyScalar( this.radius ).add( focusPoint );

		this.dummy.position.copy( focusPoint );

		this.dummy.lookAt( this.camera.position );
		this.q1.copy( this.dummy.quaternion );

		this.dummy.lookAt( this.targetPosition );
		this.q2.copy( this.dummy.quaternion );

	}
}

