/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OpenDriveExporter } from './open-drive-exporter';
import { TvLane } from '../models/tv-lane';
import { TravelDirection, TvLaneSide, TvLaneType } from '../models/tv-common';
import { LaneFactory } from 'app/services/lane/lane.factory';
import { LaneSectionFactory } from "../../factories/lane-section.factory";

describe( 'OpenDriveExporter', () => {

	let exporter: OpenDriveExporter;
	let lane: TvLane;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ OpenDriveExporter ]
		} );

		exporter = TestBed.inject( OpenDriveExporter );

		const laneSection = LaneSectionFactory.createLaneSection( 1, 1, 1, 1, );

		lane = LaneFactory.createLane( TvLaneSide.RIGHT, 1, TvLaneType.driving, laneSection );

		spyOnProperty( lane, 'isCenter', 'get' ).and.returnValue( false );
	} );

	it( 'should return "both" if lane is bidirectional', () => {
		const result = exporter.exportLaneDirection( lane, TravelDirection.bidirectional );
		expect( result ).toBe( 'both' );
	} );

	it( 'should return "both" if direction is bidirectional', () => {
		const result = exporter.exportLaneDirection( lane, TravelDirection.bidirectional );
		expect( result ).toBe( 'both' );
	} );

	it( 'should return "both" if direction is undirected', () => {
		const result = exporter.exportLaneDirection( lane, TravelDirection.undirected );
		expect( result ).toBe( 'both' );
	} );

	it( 'should return "reversed" if lane is reversed', () => {
		spyOnProperty( lane, 'isReversed', 'get' ).and.returnValue( true );
		const result = exporter.exportLaneDirection( lane, TravelDirection.backward );
		expect( result ).toBe( 'reversed' );
	} );

	it( 'should return "standard" if none of the conditions are met', () => {
		spyOnProperty( lane, 'isReversed', 'get' ).and.returnValue( false );
		const result = exporter.exportLaneDirection( lane, TravelDirection.forward );
		expect( result ).toBe( 'standard' );
	} );

} );
