import { Action, SerializedField } from "app/core/components/serialization";
import { TvRoadObject } from "./tv-road-object";
import { TvObjectMarking } from "../tv-object-marking";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { TvColors, TvRoadMarkWeights } from "../tv-common";
import { COLOR } from "app/views/shared/utils/colors.service";
import { AssetDatabase } from "app/core/asset/asset-database";

export class MarkingObjectInspectorData {

	constructor (
		public roadObject: TvRoadObject,
		public marking: TvObjectMarking
	) { }

	@SerializedField( { type: 'float' } )
	get width (): number {
		return this.marking.width;
	}

	set width ( value: number ) {
		this.marking.width = value;
	}

	@SerializedField( { type: 'float' } )
	get zOffset (): number {
		return this.marking.zOffset;
	}

	set zOffset ( value: number ) {
		this.marking.zOffset = value;
	}

	@SerializedField( { type: 'float' } )
	get stopOffset (): number {
		return this.marking.stopOffset;
	}

	set stopOffset ( value: number ) {
		this.marking.stopOffset = value;
	}

	@SerializedField( { type: 'float' } )
	get startOffset (): number {
		return this.marking.startOffset;
	}

	set startOffset ( value: number ) {
		this.marking.startOffset = value;
	}

	@SerializedField( { type: 'enum', enum: TvRoadMarkWeights } )
	get weight (): TvRoadMarkWeights {
		return this.marking.weight;
	}
	set weight ( value: TvRoadMarkWeights ) {
		this.marking.weight = value;
	}

	@SerializedField( { type: 'float' } )
	get lineLength (): number {
		return this.marking.lineLength;
	}
	set lineLength ( value: number ) {
		this.marking.lineLength = value;
	}

	get material (): THREE.MeshBasicMaterial {
		return this.marking.material;
	}

	set material ( value: THREE.MeshBasicMaterial ) {
		this.marking.material = value;
	}

	@SerializedField( { type: 'float' } )
	get spaceLength (): number {
		return this.marking.spaceLength;
	}

	set spaceLength ( value: number ) {
		this.marking.spaceLength = value;
	}

	@SerializedField( { type: 'enum', enum: TvColors } )
	get color (): TvColors {
		return this.marking.color;
	}

	set color ( value: TvColors ) {
		this.marking.color = value;
		this.marking.material?.color.set( COLOR.stringToColor( value ) );
		this.marking.material.needsUpdate = true;
	}

	@SerializedField( { type: 'material' } )
	get materialGuid (): string {
		return this.marking.materialGuid;
	}

	set materialGuid ( value: string ) {
		this.marking.materialGuid = value;
		this.marking.material = AssetDatabase.getInstance( value );
		this.marking.material.needsUpdate = true;
	}

	@Action( { name: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this ) );

	}
}
