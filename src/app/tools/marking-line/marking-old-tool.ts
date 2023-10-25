// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
// import { Subscription } from 'rxjs';
// import * as THREE from 'three';
// import {
// 	CurvePath,
// 	ExtrudeGeometry,
// 	ExtrudeGeometryOptions,
// 	Mesh,
// 	MeshBasicMaterial,
// 	Shape,
// 	TextureLoader,
// 	Vector2,
// 	Vector3
// } from 'three';
// import { AbstractShapeEditor } from '../../editors/abstract-shape-editor';
// import { LineEditor } from '../../editors/line-editor';
// import { BaseMarkingTool } from '../marking-point/marking-point-tool';
// import { ToolType } from '../../models/tool-types.enum';

// export class MarkingLineTool extends BaseMarkingTool {

// 	static texture = new TextureLoader().load( `assets/markings/crosswalk-marking.png` );
// 	name: string = 'MarkingLineTool';
// 	toolType = ToolType.MarkingLine;
// 	private shapeEditor: AbstractShapeEditor;
// 	private controlPointAddedSubscriber: Subscription;
// 	private hasSignal = false;
// 	private selectedSignal: TvRoadSignal;
// 	private cpSubscriptions: Subscription[] = [];
// 	private mesh: Mesh;

// 	constructor () {

// 		super();

// 	}

// 	init () {

// 		super.init();

// 		this.shapeEditor = new LineEditor();

// 		// this.createControlPoints();

// 		MarkingLineTool.texture.wrapS = THREE.RepeatWrapping;
// 		MarkingLineTool.texture.wrapT = THREE.RepeatWrapping;
// 		MarkingLineTool.texture.mapping = THREE.UVMapping;
// 		MarkingLineTool.texture.repeat.set( 1, 1 );
// 		MarkingLineTool.texture.anisotropy = 5;


// 	}

// 	enable () {

// 		super.enable();

// 		// this.controlPointAddedSubscriber = this.shapeEditor.controlPointAdded.subscribe( e => this.onControlPointAdded( e ) );

// 		this.shapeEditor.curveGeometryAdded.subscribe( e => this.onGeometryAdded( e ) );
// 		this.shapeEditor.curveGeometryChanged.subscribe( e => this.onGeometryChanged( e ) );

// 	}

// 	disable (): void {

// 		super.disable();

// 		// this.controlPointAddedSubscriber.unsubscribe();

// 		this.shapeEditor.destroy();

// 		// this.unsubscribeFromControlPoints();

// 	}

// 	getShape (): Shape {

// 		const shape = new Shape();

// 		shape.moveTo( 0, -2.5 );

// 		shape.lineTo( 0, 2.5 );

// 		return shape;

// 	}

// 	getGeometry ( line: THREE.LineCurve3 ) {

// 		const shape = this.getShape();

// 		const path = new CurvePath<Vector3>();

// 		path.add( line );

// 		const generator = new CustomUvGenerator();

// 		const geometry = new ExtrudeGeometry( shape, {
// 			depth: 16,
// 			extrudePath: path,
// 			UVGenerator: generator
// 		} );

// 		geometry.attributes.faces;

// 		return geometry;
// 	}

// 	onGeometryAdded ( line: any ) {

// 		const mesh = this.mesh = new Mesh( this.getGeometry( line ), this.getMaterial() );

// 		this.map.gameObject.add( mesh );

// 	}

// 	onGeometryChanged ( line: any ) {

// 		if ( this.mesh ) this.map.gameObject.remove( this.mesh );

// 		const mesh = this.mesh = new Mesh( this.getGeometry( line ), this.getMaterial() );

// 		this.map.gameObject.add( mesh );
// 	}


// 	getMaterial () {

// 		return new MeshBasicMaterial( {
// 			map: MarkingLineTool.texture,
// 			transparent: true,
// 			alphaTest: 0.1,
// 			wireframe: false
// 		} );

// 	}

// }

// export class CustomUvGenerator implements THREE.UVGenerator {

// 	generateTopUV ( geometry, vertices, indexA, indexB, indexC ) {

// 		const a_x = vertices[ indexA * 3 ];
// 		const a_y = vertices[ indexA * 3 + 1 ];
// 		const b_x = vertices[ indexB * 3 ];
// 		const b_y = vertices[ indexB * 3 + 1 ];
// 		const c_x = vertices[ indexC * 3 ];
// 		const c_y = vertices[ indexC * 3 + 1 ];

// 		const res = [
// 			new Vector2( a_x, a_y ),
// 			new Vector2( b_x, b_y ),
// 			new Vector2( c_x, c_y )
// 		];

// 		return res;
// 	}

// 	generateSideWallUV ( geometry, vertices, indexA, indexB, indexC, indexD ) {

// 		const a_x = vertices[ indexA * 3 ];
// 		const a_y = vertices[ indexA * 3 + 1 ];
// 		const a_z = vertices[ indexA * 3 + 2 ];
// 		const b_x = vertices[ indexB * 3 ];
// 		const b_y = vertices[ indexB * 3 + 1 ];
// 		const b_z = vertices[ indexB * 3 + 2 ];
// 		const c_x = vertices[ indexC * 3 ];
// 		const c_y = vertices[ indexC * 3 + 1 ];
// 		const c_z = vertices[ indexC * 3 + 2 ];
// 		const d_x = vertices[ indexD * 3 ];
// 		const d_y = vertices[ indexD * 3 + 1 ];
// 		const d_z = vertices[ indexD * 3 + 2 ];

// 		if ( Math.abs( a_y - b_y ) < 0.01 ) {

// 			return [
// 				new Vector2( a_x, 1 - a_z ),
// 				new Vector2( b_x, 1 - b_z ),
// 				new Vector2( c_x, 1 - c_z ),
// 				new Vector2( d_x, 1 - d_z )
// 			];

// 		} else {

// 			return [
// 				new Vector2( a_y, 1 - a_z ),
// 				new Vector2( b_y, 1 - b_z ),
// 				new Vector2( c_y, 1 - c_z ),
// 				new Vector2( d_y, 1 - d_z )
// 			];

// 		}

// 	}

// }


// export class ExtrudePlaneGeometry {

// 	constructor ( private shapes: Shape | Shape[], private options?: ExtrudeGeometryOptions ) {

// 		// const path = options ? options.extrudePath : ;

// 	}

// }
