/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { SerializedAction, SerializedField } from "app/core/components/serialization";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { CommandHistory } from "app/commands/command-history";
import { TvObjectVertexRoad } from "../../map/models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../../map/models/objects/tv-object-vertex-local";

export class PolePropInspector {

	constructor (
		public roadObject: TvRoadObject
	) {
	}

	get polyline () {
		return this.roadObject?.skeleton?.polylines[ 0 ];
	}

	get firstVertex () {
		return this.polyline?.vertices[ 0 ];
	}

	@SerializedField( { 'type': 'float', label: 'Pole Radius' } )
	get radius () {
		return this.polyline?.vertices.length > 0 ? this.polyline.vertices[ 0 ].radius : this.roadObject.radius;
	}

	set radius ( value ) {
		this.polyline.vertices[ 0 ].radius = value;
		this.roadObject.radius = value;
	}

	@SerializedField( { 'type': 'float', label: 'Pole Height' } )
	get height () {

		if ( this.polyline?.vertices.length == 0 ) return;

		if ( this.firstVertex instanceof TvObjectVertexRoad ) {

			const vertex = this.polyline.vertices
				.find( ( v: TvObjectVertexRoad ) => !v.intersectionPoint ) as TvObjectVertexRoad;

			return vertex.dz;

		} else if ( this.firstVertex instanceof TvObjectVertexLocal ) {

			const vertex = this.polyline.vertices
				.find( ( v: TvObjectVertexLocal ) => !v.intersectionPoint ) as TvObjectVertexLocal

			return vertex.uvz.z;
		}

	}

	set height ( value ) {

		const vertex = this.polyline.vertices.find( ( v: TvObjectVertexRoad ) => !v.intersectionPoint );

		if ( vertex instanceof TvObjectVertexRoad ) {

			vertex.dz = value;

		} else if ( vertex instanceof TvObjectVertexLocal ) {

			vertex.uvz.z = value;

		}

	}

	@SerializedField( { 'type': 'float', label: 'Start Position' } )
	get s () {
		return this.roadObject.s;
	}

	set s ( value ) {
		this.roadObject.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Lateral Offset Start' } )
	get t () {
		return this.roadObject.t;
	}

	set t ( value ) {
		this.roadObject.t = value;
	}


	@SerializedField( { 'type': 'float', label: 'Z Offset' } )
	get zOffset () {
		return this.roadObject.zOffset;
	}

	set zOffset ( value ) {
		this.roadObject.zOffset = value;
	}

	// @Action( { label: 'Repeat' } )
	// repeat () {

	// 	const repeatLength = this.roadObject.road.length - this.roadObject.s;

	// 	const distance = 10;

	// 	const repeat = new TvObjectRepeat( this.roadObject.s, repeatLength, distance );

	// 	CommandHistory.execute( new AddObjectCommand( repeat ) );

	// }

	@SerializedAction( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.roadObject ) );

	}


}
