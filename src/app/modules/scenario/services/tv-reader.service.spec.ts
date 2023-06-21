/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PolylineShape } from '../models/tv-trajectory';
import { WorldPosition } from '../models/positions/tv-world-position';
import { OpenScenarioImporter } from './tv-reader.service';


describe( 'ReaderService', () => {

	let parser: OpenScenarioImporter;

	beforeEach( () => {
		parser = new OpenScenarioImporter( null );
	} );

	it( 'should parse Header correctly', () => {

		const headerXml = {
			attr_revMajor: '1',
			attr_revMinor: '4',
			attr_author: 'Truevision.ai',
			attr_description: 'Sample Scenario',
			attr_date: '2017-07-27T10:00:00',
		};

		const header = parser.readFileHeader( headerXml );

		expect( header.revMajor ).toBe( 1 );
		expect( header.revMinor ).toBe( 4 );
		expect( header.date ).toBe( headerXml.attr_date );
		expect( header.description ).toBe( headerXml.attr_description );
		expect( header.author ).toBe( headerXml.attr_author );

	} );

	it( 'should parse RoadNetwork correctly', () => {

		const xml = {
			Logics: {
				attr_filepath: 'tv-map.xml'
			},
			SceneGraph: {
				attr_filepath: 'tv-map.opt.osgb'
			},
		};

		const roadNetwork = parser.readRoadNetwork( xml );

		expect( roadNetwork.logics.filepath ).toBe( xml.Logics.attr_filepath );
		expect( roadNetwork.sceneGraph.filepath ).toBe( xml.SceneGraph.attr_filepath );

	} );


	it( 'should parse Entities correctly', () => {

		const xml = {
			Object: [
				{
					attr_name: 'Default_Vehicle'
				}
			]
		};

		const objects = parser.readEntities( xml );

		expect( objects[ 0 ].name ).toBe( xml.Object[ 0 ].attr_name );

	} );

	it( 'should parse Entities->Object correctly', () => {

		const xml = {
			attr_name: 'Default_Vehicle'
		};

		const entityObject = parser.readEntityObject( xml );

		expect( entityObject.name ).toBe( xml.attr_name );

	} );

	it( 'should parse Story correctly', () => {

		const xml = {
			attr_name: 'MyStory',
			attr_owner: 'Ego'
		};

		const story = parser.readStory( xml );

		expect( story.name ).toBe( xml.attr_name );
		expect( story.ownerName ).toBe( xml.attr_owner );

	} );

	it( 'should parse Trajectory correctly', () => {

		const xml = {
			attr_name: 'TrajectoryName',
			attr_closed: 'false',
			attr_domain: 'time',
			ParameterDeclaration: [],
			Vertex: []
		};

		const trajectory = parser.readTrajectory( xml );

		expect( trajectory.name ).toBe( xml.attr_name );
		expect( trajectory.closed ).toBe( false );
		expect( trajectory.domain ).toBe( 'time' );
		expect( trajectory.parameterDeclaration.length ).toBe( 0 );
		expect( trajectory.vertices.length ).toBe( 0 );

	} );

	it( 'should parse Vertex correctly', () => {

		const xml = {
			attr_reference: 1,
			Position: {
				World: {
					attr_x: 1, attr_y: 2, attr_z: 3
				}
			},
			Shape: {
				Polyline: ''
			}
		};

		const vertex = parser.readVertex( xml );

		expect( vertex.reference ).toBe( xml.attr_reference );

	} );

	it( 'should parse Polyline correctly', () => {

		const xml = {
			Polyline: ''
		};

		const polyline = parser.readVertexShape( xml );

		expect( polyline ).toBeTruthy( polyline instanceof PolylineShape );

	} );

	it( 'should parse Clothoid correcty', () => {

		const xml = {
			attr_curvature: '1',
			attr_curvatureDot: '2',
			attr_length: '3'
		};

		const clothoid = parser.readClothoidShape( xml );

		expect( clothoid.curvature ).toBe( 1 );
		expect( clothoid.curvatureDot ).toBe( 2 );
		expect( clothoid.length ).toBe( 3 );

	} );

	it( 'should parse Waypoint correctly', () => {

		const xml = {
			attr_strategy: 'fastest',
			Position: {
				World: {
					attr_x: 1, attr_y: 2, attr_z: 3
				}
			},
		};

		const waypoint = parser.readWaypoint( xml );

		expect( waypoint.strategy ).toBe( xml.attr_strategy );
		expect( waypoint.position ).not.toBe( null );
		expect( waypoint.position ).toBeTruthy( waypoint.position instanceof WorldPosition );

	} );

	it( 'should parse LongitudinalPurpose->None correctly', () => {

		const xml = {
			None: '',
		};

		const LongitudinalPurpose = parser.readLongitudinalPurpose( xml );

		expect( LongitudinalPurpose.timing ).toBe( null || undefined );

	} );

	it( 'should parse LongitudinalPurpose->Timing correctly', () => {

		const xml = {
			Timing: {
				attr_domain: 'absolute',
				attr_scale: '1',
				attr_offset: '2'
			},
		};

		const object = parser.readLongitudinalPurpose( xml );

		expect( object.timing ).not.toBe( null || undefined );
		expect( object.timing.domain ).toBe( xml.Timing.attr_domain );
		expect( object.timing.scale ).toBe( 1 );
		expect( object.timing.offset ).toBe( 2 );

	} );

	it( 'should parse Route correctly ', () => {

		const xml = {
			attr_name: 'Route',
			attr_closed: 'false',
			ParameterDeclaration: [],
			Waypoint: [ {
				attr_strategy: 'fastest',
				Position: { World: { attr_x: 1, attr_y: 2, attr_z: 3 } },
			},
				{
					attr_strategy: 'fastest',
					Position: { World: { attr_x: 4, attr_y: 5, attr_z: 6 } },
				}, ]
		};

		const route = parser.readRoute( xml );

		expect( route.name ).toBe( xml.attr_name );
		expect( route.closed ).toBe( false );
		expect( route.parameterDeclaration.length ).toBe( 0 );
		expect( route.waypoints.length ).toBe( 2 );

	} );


} );
