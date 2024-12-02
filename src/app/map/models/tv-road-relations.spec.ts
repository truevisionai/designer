import { TvRoadRelations } from './tv-road-relations';
import { TvRoad } from './tv-road.model';
import { TvJunction } from './junctions/tv-junction';
import { TvLink, TvLinkType } from './tv-link';
import { TvContactPoint } from './tv-common';
import { LinkFactory } from './link-factory';
import { RoadLinker } from '../link/road-linker';
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { SplineFactory } from "../../services/spline/spline.factory";
import { JunctionFactory } from "../../factories/junction.factory";
import { RoadFactory } from "../../factories/road-factory.service";

describe( 'TvRoadRelations', () => {

	let road: TvRoad;
	let roadRelations: TvRoadRelations;

	beforeEach( () => {
		road = RoadFactory.createRoad();
		roadRelations = new TvRoadRelations( road );
	} );

	it( 'should set and get successor link', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.END );
		roadRelations.setSuccessor( link );
		expect( roadRelations.getSuccessor() ).toBe( link );
	} );

	it( 'should remove successor link', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.END );
		roadRelations.setSuccessor( link );
		roadRelations.removeSuccessor();
		expect( roadRelations.getSuccessor() ).toBeNull();
	} );

	it( 'should set and get predecessor link', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.START );
		roadRelations.setPredecessor( link );
		expect( roadRelations.getPredecessor() ).toBe( link );
	} );

	it( 'should remove predecessor link', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.START );
		roadRelations.setPredecessor( link );
		roadRelations.removePredecessor();
		expect( roadRelations.getPredecessor() ).toBeNull();
	} );

	it( 'should set successor road', () => {
		const successorRoad = RoadFactory.createRoad();
		roadRelations.setSuccessorRoad( successorRoad, TvContactPoint.END );
		expect( roadRelations.getSuccessor().getElement<TvRoad>() ).toBe( successorRoad );
	} );

	it( 'should link successor road', () => {
		const successorRoad = RoadFactory.createRoad();
		spyOn( RoadLinker.instance, 'linkSuccessorRoad' );
		roadRelations.linkSuccessorRoad( successorRoad, TvContactPoint.END );
		expect( RoadLinker.instance.linkSuccessorRoad ).toHaveBeenCalledWith( road, successorRoad, TvContactPoint.END );
	} );

	it( 'should link predecessor road', () => {
		const predecessorRoad = RoadFactory.createRoad();
		spyOn( RoadLinker.instance, 'linkPredecessorRoad' );
		roadRelations.linkPredecessorRoad( predecessorRoad, TvContactPoint.START );
		expect( RoadLinker.instance.linkPredecessorRoad ).toHaveBeenCalledWith( road, predecessorRoad, TvContactPoint.START );
	} );

	it( 'should link junction as predecessor', () => {
		const junction = JunctionFactory.create();
		roadRelations.linkJunction( junction, TvContactPoint.START );
		expect( roadRelations.getPredecessor().getElement<TvJunction>() ).toBe( junction );
	} );

	it( 'should link junction as successor', () => {
		const junction = JunctionFactory.create();
		roadRelations.linkJunction( junction, TvContactPoint.END );
		expect( roadRelations.getSuccessor().getElement<TvJunction>() ).toBe( junction );
	} );

	it( 'should get successor spline', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.END );
		spyOn( link, 'getSpline' ).and.returnValue( SplineFactory.createSpline() );
		roadRelations.setSuccessor( link );
		expect( roadRelations.getSuccessorSpline() ).toBeInstanceOf( AbstractSpline );
	} );

	it( 'should get predecessor spline', () => {
		const otherRoad = RoadFactory.createRoad();
		const link = LinkFactory.createLink( TvLinkType.ROAD, otherRoad, TvContactPoint.START );
		spyOn( link, 'getSpline' ).and.returnValue( SplineFactory.createSpline() );
		roadRelations.setPredecessor( link );
		expect( roadRelations.getPredecessorSpline() ).toBeInstanceOf( AbstractSpline );
	} );

} );
