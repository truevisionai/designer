/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { TextObject } from 'app/modules/three-js/objects/text-object';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, CircleGeometry, Float32BufferAttribute, LineBasicMaterial, LineLoop, Vector3 } from 'three';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { SceneService } from 'app/core/services/scene.service';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { AddRoadCommand } from '../road/add-road-command';

export class RoadCircleTool extends BaseTool {

	public name: string = 'RoadCircleTool';
	public toolType = ToolType.RoadCircle;

	private pointerLastAt: Vector3;
	private currentRadius: number = 0;

	private circleRoad: CircleRoad;

	constructor () {

		super();

	}

	get radius () {
		return Math.max( 7.5, this.currentRadius || 0 );
	}

	init () {

		// HACK: to load the font
		const tempText = new TextObject( '', new Vector3() );
		setTimeout( () => tempText.remove(), 2000 );

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.map.getRoads().forEach( road => road.hideHelpers() );

		// this.clearToolObjects();

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.initCircle( this.pointerDownAt, e.point, this.radius );
	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.createRoads();

		this.circleRoad = null;
		this.currentRadius = 0;
	}

	createRoads () {

		if ( this.circleRoad ) this.circleRoad.createRoads();

	}

	onPointerMoved ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( !this.isPointerDown ) return;
		if ( !this.pointerDownAt ) return;

		this.pointerLastAt = e.point;

		this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

		if ( this.circleRoad ) this.updateCircle( this.pointerLastAt, this.radius );
	}

	initCircle ( centre: Vector3, end: Vector3, radius: number ) {

		this.circleRoad = new CircleRoad( centre, end, radius );

	}

	updateCircle ( end: Vector3, radius: number ) {

		if ( !this.circleRoad ) return;

		this.circleRoad.update( radius, end );

	}

}

class CircleRoad {

	private line: LineLoop;

	private text: TextObject;

	constructor ( private centre: Vector3, private end: Vector3, private radius: number ) {

		let circleGeometry = new CircleGeometry( radius, radius * 4 );

		this.line = new LineLoop( circleGeometry, new LineBasicMaterial( { color: COLOR.CYAN } ) );

		this.line.name = 'circle';

		this.line.position.copy( centre );

		this.text = new TextObject( 'Radius: ' + radius.toFixed( 2 ), centre );

		SceneService.addToolObject( this.line );

	}

	update ( radius: number, end: Vector3 ) {

		this.radius = radius;
		this.end = end;

		const circleGeometry = new CircleGeometry( radius, radius * 4 );

		const positions = circleGeometry.attributes.position as BufferAttribute;

		const circleBufferGeometry = new BufferGeometry()
			.setAttribute( 'position', new Float32BufferAttribute( positions.array, 3 ) );

		// Dispose of the old geometry and replace with the new one
		this.line.geometry.dispose();

		this.line.geometry = circleBufferGeometry;

		this.text.updateText( 'Radius: ' + radius.toFixed( 2 ) );
	}

	/**
	 * create 4 arc roads to form a circular road with correct
	 * successor/predecessor relation
	 */
	createRoads () {

		this.text.remove();

		SceneService.removeFromTool( this.line );

		const roads = RoadFactory.createCircularRoads( this.centre, this.end, this.radius );

		CommandHistory.execute( new AddRoadCommand( roads ) );

	}

}
