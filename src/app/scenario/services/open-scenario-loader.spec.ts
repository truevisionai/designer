/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { VehicleEntity } from '../models/entities/vehicle-entity';
import { WorldPosition } from '../models/positions/tv-world-position';
import { PolylineShape } from '../models/tv-trajectory';
import { OpenScenarioLoader } from './open-scenario.loader';
import { ParameterResolver } from './scenario-builder.service';

const vehicleCatalogContent = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSCENARIO xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../Schema/OpenSCENARIO.xsd">
  <FileHeader revMajor="1" revMinor="2" date="2020-02-21T10:00:00" description="Example - Vehicle Catalog" author="ASAM e.V." />
  <Catalog name="VehicleCatalog">
    <Vehicle name="car1" vehicleCategory="car" model3d="white_limousine_model">
      <ParameterDeclarations>
        <ParameterDeclaration name="Mass" parameterType="double" value="1600" />
        <ParameterDeclaration name="MaxSpeed" parameterType="double" value="69" />
      </ParameterDeclarations>
      <BoundingBox>
        <Center x="1.4" y="0.0" z="0.9" />
        <Dimensions width="2.0" length="5.0" height="1.8" />
      </BoundingBox>
      <Performance maxSpeed="$MaxSpeed" maxAcceleration="200" maxDeceleration="30" mass="$Mass" />
      <Axles>
        <FrontAxle maxSteering="0.5235987756" wheelDiameter="0.8" trackWidth="1.68" positionX="2.98" positionZ="0.4"/>
        <RearAxle maxSteering="0.5235987756" wheelDiameter="0.8" trackWidth="1.68" positionX="0" positionZ="0.4"/>
      </Axles>
      <Properties />
    </Vehicle>
    <Vehicle name="car2" vehicleCategory="car">
      <BoundingBox>
        <Center x="1.3" y="0.0" z="0.8" />
        <Dimensions width="1.8" length="4.5" height="1.5" />
      </BoundingBox>
      <Performance maxSpeed="70" maxAcceleration="200" maxDeceleration="30" />
      <Axles>
        <FrontAxle maxSteering="0.5235987756" wheelDiameter="0.8" trackWidth="1.68" positionX="2.98" positionZ="0.4" />
        <RearAxle maxSteering="0.5235987756" wheelDiameter="0.8" trackWidth="1.68" positionX="0" positionZ="0.4" />
      </Axles>
      <Properties />
    </Vehicle>
  </Catalog>
</OpenSCENARIO>`;

describe( 'ReaderService', () => {

	let loader: OpenScenarioLoader;

	beforeEach( () => {
		loader = new OpenScenarioLoader( null );
	} );

	it( 'should parse Header correctly', () => {

		const headerXml = {
			attr_revMajor: '1',
			attr_revMinor: '4',
			attr_author: 'Truevision.ai',
			attr_description: 'Sample Scenario',
			attr_date: '2017-07-27T10:00:00',
		};

		const header = loader.parseFileHeader( headerXml );

		expect( header.revMajor ).toBe( 1 );
		expect( header.revMinor ).toBe( 4 );
		expect( header.date ).toBe( headerXml.attr_date );
		expect( header.description ).toBe( headerXml.attr_description );
		expect( header.author ).toBe( headerXml.attr_author );

	} );

	it( 'should parse RoadNetwork correctly', () => {

		const xml = {
			Logics: {
				attr_filepath: 'tv-models.xml'
			},
			SceneGraph: {
				attr_filepath: 'tv-models.opt.osgb'
			},
		};

		const roadNetwork = loader.parseRoadNetwork( xml );

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

		// const objects = OpenScenarioImporter.parseEntities( xml, null );
		//
		// expect( objects[ 0 ].name ).toBe( xml.Object[ 0 ].attr_name );

	} );

	it( 'should parse Entities->Object correctly', () => {

		const xml = {
			attr_name: 'Default_Vehicle'
		};

		const entityObject = loader.parseScenarioObject( xml, null );

		expect( entityObject.name ).toBe( xml.attr_name );

	} );

	it( 'should parse Story correctly', () => {

		const xml = {
			attr_name: 'MyStory',
			attr_owner: 'Ego'
		};

		const story = loader.parseStory( xml, null );

		expect( story.name ).toBe( xml.attr_name );
		expect( story.ownerName ).toBe( xml.attr_owner );

	} );

	it( 'should parse Trajectory correctly', () => {

		// const xml = {
		// 	attr_name: 'TrajectoryName',
		// 	attr_closed: 'false',
		// 	attr_domain: 'time',
		// 	ParameterDeclaration: [],
		// 	Vertex: []
		// };

		// const trajectory = OpenScenarioImporter.parseTrajectory( xml );

		// expect( trajectory.name ).toBe( xml.attr_name );
		// expect( trajectory.closed ).toBe( false );
		// expect( trajectory.domain ).toBe( 'time' );
		// expect( trajectory.parameterDeclarations.length ).toBe( 0 );
		// expect( trajectory.vertices.length ).toBe( 0 );

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

		const vertex = loader.parseVertex( xml );

		expect( vertex.time ).toBe( xml.attr_reference );

	} );

	it( 'should parse Polyline correctly', () => {

		const xml = {
			Polyline: ''
		};

		const polyline = loader.parseVertexShape( xml );

		expect( polyline ).toBeTruthy( polyline instanceof PolylineShape );

	} );

	it( 'should parse Clothoid correcty', () => {

		const xml = {
			attr_curvature: '1',
			attr_curvatureDot: '2',
			attr_length: '3'
		};

		const clothoid = loader.parseClothoidShape( xml );

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

		const waypoint = loader.parseWaypoint( xml );

		expect( waypoint.strategy ).toBe( xml.attr_strategy );
		expect( waypoint.position ).not.toBe( null );
		expect( waypoint.position ).toBeTruthy( waypoint.position instanceof WorldPosition );

	} );

	it( 'should parse LongitudinalPurpose->None correctly', () => {

		const xml = {
			None: '',
		};

		const LongitudinalPurpose = loader.parseTimeReference( xml );

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

		const object = loader.parseTimeReference( xml );

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

		const route = loader.parseRoute( xml );

		expect( route.name ).toBe( xml.attr_name );
		expect( route.closed ).toBe( false );
		expect( route.parameterDeclaration.length ).toBe( 0 );
		expect( route.waypoints.length ).toBe( 2 );

	} );


} );

describe( 'CatalogLoader', () => {

	let loader: OpenScenarioLoader;

	beforeEach( () => {
		loader = new OpenScenarioLoader( null );
	} );

	it( 'should parse vehicle catalog correctly', () => {

		let xml = loader.getXMLElement( vehicleCatalogContent );

		let catalog = loader.parseCatalogFile( xml );
		expect( catalog.name ).toBe( 'VehicleCatalog' );
		expect( catalog.getEntries().length ).toBe( 2 );

		let car1 = catalog.getEntry<VehicleEntity>( 'car1' );
		expect( car1.name ).toBe( 'car1' );
		expect( car1.vehicleCategory ).toBe( 'car' );
		expect( car1.model3d ).toBe( 'white_limousine_model' );
		expect( car1.boundingBox.center.x ).toBe( 1.4 );
		expect( car1.boundingBox.center.y ).toBe( 0 );
		expect( car1.boundingBox.center.z ).toBe( 0.9 );
		expect( car1.boundingBox.dimension.width ).toBe( 2 );
		expect( car1.boundingBox.dimension.length ).toBe( 5 );
		expect( car1.boundingBox.dimension.height ).toBe( 1.8 );
		expect( car1.performance.maxAcceleration ).toBe( 200 );
		expect( car1.performance.maxDeceleration ).toBe( 30 );

		// these are not parsed correctly as they are variables
		expect( car1.performance.mass ).toBeNaN();
		expect( car1.performance.maxSpeed ).toBeNaN();

		xml = new ParameterResolver( null ).replaceParameterWithValue( xml );
		catalog = loader.parseCatalogFile( xml );

		expect( catalog.name ).toBe( 'VehicleCatalog' );
		expect( catalog.getEntries().length ).toBe( 2 );

		car1 = catalog.getEntry<VehicleEntity>( 'car1' );
		expect( car1.name ).toBe( 'car1' );
		expect( car1.vehicleCategory ).toBe( 'car' );
		expect( car1.model3d ).toBe( 'white_limousine_model' );
		expect( car1.boundingBox.center.x ).toBe( 1.4 );
		expect( car1.boundingBox.center.y ).toBe( 0 );
		expect( car1.boundingBox.center.z ).toBe( 0.9 );
		expect( car1.boundingBox.dimension.width ).toBe( 2 );
		expect( car1.boundingBox.dimension.length ).toBe( 5 );
		expect( car1.boundingBox.dimension.height ).toBe( 1.8 );
		expect( car1.performance.maxSpeed as any ).toBe( 69 );
		expect( car1.performance.maxAcceleration ).toBe( 200 );
		expect( car1.performance.maxDeceleration ).toBe( 30 );
		expect( car1.performance.mass as any ).toBe( 1600 );

	} );


} );
