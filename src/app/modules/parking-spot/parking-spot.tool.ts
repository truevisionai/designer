import { Injectable } from "@angular/core";
import { SplineService } from "../../services/spline/spline.service";
import { BaseToolService } from "../../tools/base-tool.service";
import { ToolWithHandler } from "../../tools/base-tool-v2";
import { ToolType } from "../../tools/tool-types.enum";
import { ParkingCurveCreator, ParkingCurvePoint, ParkingCurvePointCreator } from "./services/parking-spot-creation-strategy";
import { ParkingCurve, ParkingSpot } from "./services/parking-curve";
import { PointSelectionStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { PointVisualizer } from "app/tools/maneuver/point-visualizer";
import { PointController } from "app/core/controllers/point-controller";
import { BaseController } from "app/core/controllers/base-controller";
import { MapService } from "app/services/map/map.service";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { SimpleControlPointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import { SharpArrowObject } from "app/objects/lane-arrow-object";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { ObjectUserDataStrategy } from "app/core/strategies/select-strategies/object-user-data-strategy";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Commands } from "app/commands/commands";
import { SerializedField, SerializedAction } from "app/core/components/serialization";


@Injectable()
export class ParkingSpotToolService {

	constructor (
		public mapService: MapService,
		public parkingCurvService: ParkingCurveService,
		public splineService: SplineService,
		public base: BaseToolService,
		public parkingCurveCreator: ParkingCurveCreator,
		public parkingCurvePointCreator: ParkingCurvePointCreator,
		public parkignCurveVisualizer: ParkingCurveVisualizer,
	) {
	}
}

@Injectable()
export class ParkingCurveService {

	constructor ( private mapService: MapService ) { }

	getParkingCurves (): readonly ParkingCurve[] {

		return this.mapService.map.getParkingCurves();

	}

	add ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.addParkingCurve( parkingCurve );

	}

	remove ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.removeParkingCurve( parkingCurve );

	}

	update ( parkingCurve: ParkingCurve ): void {

		parkingCurve.update();

	}

}

@Injectable()
export class ParkingCurveController extends BaseController<ParkingCurve> {

	constructor ( private service: ParkingCurveService ) {
		super();
	}

	onAdded ( parkingCurve: ParkingCurve ): void {

		this.service.add( parkingCurve );

	}

	onUpdated ( parkingCurve: ParkingCurve ): void {

		this.service.update( parkingCurve );

	}

	onRemoved ( parkingCurve: ParkingCurve ): void {

		this.service.remove( parkingCurve );

	}

	showInspector ( parkingCurve: ParkingCurve ): void {

		this.setInspector( new ParkingCurveInspector( parkingCurve ) );

	}

}

@Injectable()
export class ParkingCurvePointController extends PointController<ParkingCurvePoint> {

	constructor ( private splineService: SplineService, private parkingCurveService: ParkingCurveService ) {
		super();
	}

	onAdded ( point: ParkingCurvePoint ): void {

		point.mainObject.getSpline().addControlPoint( point );

		point.mainObject.update();

	}

	onUpdated ( point: ParkingCurvePoint ): void {

		point.mainObject.update();

	}

	onRemoved ( point: ParkingCurvePoint ): void {

		point.mainObject.getSpline().removeControlPoint( point );

		point.mainObject.update();

	}

	showInspector ( point: ParkingCurvePoint ): void {

		this.setInspector( new ParkingCurveInspector( point.mainObject, point ) );

	}

}

@Injectable()
export class ParkingCurveVisualizer extends BaseVisualizer<ParkingCurve> {

	private spots: Object3DArrayMap<any, Object3D[]> = new Object3DArrayMap();

	constructor (
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onHighlight ( object: ParkingCurve ): void {

		this.splineDebugService.showPolyline( object.getSpline() );

	}

	onSelected ( object: ParkingCurve ): void {

		this.splineDebugService.showPolyline( object.getSpline() );
		this.splineDebugService.showControlPoints( object.getSpline() );

	}

	onDefault ( object: ParkingCurve ): void {

		this.splineDebugService.removePolyline( object.getSpline() );

		this.showSpots( object );

	}

	onUnselected ( object: ParkingCurve ): void {

		this.splineDebugService.removeControlPoints( object.getSpline() );
		this.splineDebugService.removePolyline( object.getSpline() );

	}

	onAdded ( object: ParkingCurve ): void {

		this.showSpots( object );

	}

	onUpdated ( object: ParkingCurve ): void {

		this.splineDebugService.removePolyline( object.getSpline() );
		this.splineDebugService.removeControlPoints( object.getSpline() );

		this.splineDebugService.showPolyline( object.getSpline() );
		this.splineDebugService.showControlPoints( object.getSpline() );

		this.showSpots( object );

	}

	onRemoved ( object: ParkingCurve ): void {

		this.spots.removeKey( object );

		this.splineDebugService.removePolyline( object.getSpline() );
		this.splineDebugService.removeControlPoints( object.getSpline() );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( object => this.onRemoved( object ) );

	}

	clear (): void {

		this.highlighted.clear();

		this.splineDebugService.clear();

		this.spots.clear();

	}

	private showSpots ( parkingCurve: ParkingCurve ): void {

		this.spots.removeKey( parkingCurve );

		parkingCurve.getParkingSpots().forEach( spot => {

			const spotArrow = new SharpArrowObject( spot.getPosition(), spot.heading );
			const spotBox = this.createSpotBox( spot, parkingCurve );

			this.spots.addItem( parkingCurve, spotBox );
			this.spots.addItem( parkingCurve, spotArrow );

		} );

	}

	private createSpotBox ( parkingSpot: ParkingSpot, parkingCurve: ParkingCurve ): Mesh {

		const boxGeometry = new BoxGeometry( parkingSpot.width, parkingSpot.length, 0.1 );
		const material = new MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.2 } );
		const mesh = new Mesh( boxGeometry, material );

		mesh.position.copy( parkingSpot.getPosition() );
		mesh.rotation.z = parkingSpot.heading - Math.PI / 2;
		mesh.scale.multiplyScalar( 0.9 );

		mesh.userData.parkingCurve = parkingCurve;
		mesh[ 'tag' ] = ParkingCurve.tag;

		return mesh;

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ParkingCurvePointVisualizer extends PointVisualizer<ParkingCurvePoint> {

	protected updateSpline ( point: ParkingCurvePoint ): void {

		this.updateVisuals( point.mainObject );

	}

}

export class ParkingCurveInspector {

	constructor (
		public parkingCurve: ParkingCurve,
		public controlPoint?: AbstractControlPoint
	) {
	}

	@SerializedField( { type: 'float', min: 1 } )
	get width (): number {
		return this.parkingCurve.getWidth();
	}

	set width ( value: number ) {
		this.parkingCurve.setWidth( value );
	}

	@SerializedField( { type: 'float', min: 1 } )
	get length (): number {
		return this.parkingCurve.getLength();
	}

	set length ( value: number ) {
		this.parkingCurve.setLength( value );
	}

	@SerializedAction( { label: 'Delete Parking Curve' } )
	delete (): void {
		Commands.RemoveObject( this.parkingCurve );
	}

	@SerializedAction( {
		label: 'Delete Control Point',
		validate: function () { return this.controlPoint !== undefined; } // Using the validation method
	} )
	deleteControlPoint (): void {
		Commands.RemoveObject( this.controlPoint );
	}

}

export class ParkingSpotTool extends ToolWithHandler {

	public name: string = 'ParkingSpotTool';

	public toolType = ToolType.ParkingSpot;

	constructor ( private tool: ParkingSpotToolService ) {

		super();

	}

	init (): void {

		super.init();

		this.addCreationStrategy( this.tool.parkingCurvePointCreator );
		this.addCreationStrategy( this.tool.parkingCurveCreator );

		this.addSelectionStrategy( ParkingCurvePoint, new PointSelectionStrategy() );
		this.addSelectionStrategy( ParkingCurve, new ObjectUserDataStrategy<ParkingCurve>( ParkingCurve.tag, ParkingCurve.tag ) );

		this.addController( ParkingCurvePoint, this.tool.base.injector.get( ParkingCurvePointController ) );
		this.addController( ParkingCurve, this.tool.base.injector.get( ParkingCurveController ) );

		this.addVisualizer( ParkingCurvePoint, this.tool.base.injector.get( ParkingCurvePointVisualizer ) );
		this.addVisualizer( ParkingCurve, this.tool.base.injector.get( ParkingCurveVisualizer ) );

		this.addDragHandler( ParkingCurvePoint, this.tool.base.injector.get( SimpleControlPointDragHandler ) );

		this.tool.parkingCurvService.getParkingCurves().forEach( parkingCurve => {

			this.tool.parkignCurveVisualizer.onDefault( parkingCurve );

		} );

	}

	onObjectUpdated ( object: Object ): void {

		if ( object instanceof ParkingCurveInspector ) {

			super.onObjectUpdated( object.parkingCurve );

		} else {

			super.onObjectUpdated( object );

		}

	}

}
