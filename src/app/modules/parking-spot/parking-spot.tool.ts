import { Injectable } from "@angular/core";
import { SplineService } from "../../services/spline/spline.service";
import { BaseToolService } from "../../tools/base-tool.service";
import { ToolWithHandler } from "../../tools/base-tool-v2";
import { ToolType } from "../../tools/tool-types.enum";
import { ParkingCurveCreator, ParkingCurvePoint, ParkingCurvePointCreator } from "./services/parking-spot-creation-strategy";
import { ParkingCurve } from "../../map/parking/parking-curve";
import { PointSelectionStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { PointVisualizer } from "app/tools/maneuver/point-visualizer";
import { PointController } from "app/core/controllers/point-controller";
import { BaseController } from "app/core/controllers/base-controller";
import { MapService } from "app/services/map/map.service";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { SimpleControlPointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";
import { Object3D } from "three";
import { SharpArrowObject } from "app/objects/lane-arrow-object";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { ObjectUserDataStrategy } from "app/core/strategies/select-strategies/object-user-data-strategy";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Commands } from "app/commands/commands";
import { SerializedField, SerializedAction } from "app/core/components/serialization";
import { LineView } from "app/tools/lane/visualizers/line.view";
import { Polygon } from "app/tools/lane/visualizers/polygon-view";
import { ParkingRegion } from "../../map/parking/parking-region";


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

		return this.mapService.map.getParkingGraph().getParkingCurves();

	}

	add ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().addParkingCurve( parkingCurve );

	}

	remove ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().removeParkingCurve( parkingCurve );

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

	private objects: Object3DArrayMap<any, Object3D[]> = new Object3DArrayMap();

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

		super.removeFromHighlighted( object );

		this.objects.removeKey( object );

		this.splineDebugService.removePolyline( object.getSpline() );
		this.splineDebugService.removeControlPoints( object.getSpline() );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( object => this.onRemoved( object ) );

	}

	clear (): void {

		this.highlighted.clear();

		this.splineDebugService.clear();

		this.objects.clear();

	}

	private showSpots ( parkingCurve: ParkingCurve ): void {

		this.objects.removeKey( parkingCurve );

		parkingCurve.generatePreviewRegions().forEach( region => {

			const arrowObject = new SharpArrowObject( region.getCenter(), region.heading );
			const edgeObject = LineView.create( region.getPoints(), 1 );
			const regionObject = this.createRegionObject( region, parkingCurve );

			this.objects.addItem( parkingCurve, arrowObject );
			this.objects.addItem( parkingCurve, regionObject );
			this.objects.addItem( parkingCurve, edgeObject );

		} );

	}

	private createRegionObject ( region: ParkingRegion, parkingCurve: ParkingCurve ): Object3D {

		const regionObject = Polygon.create( region.getPoints() );

		regionObject.material.transparent = true;
		regionObject.material.opacity = 0.001;
		regionObject.userData.parkingCurve = parkingCurve;
		regionObject[ 'tag' ] = ParkingCurve.tag;

		return regionObject;

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
