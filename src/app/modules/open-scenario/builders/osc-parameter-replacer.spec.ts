// tslint:disable-next-line: max-line-length
const scenarioString = '<?xml version="1.0" encoding="utf-8"?><OpenSCENARIO>    <FileHeader revMajor="0" revMinor="9" date="2017-07-26T10:00:00" description="PEGASUS Beispielszenario - Langsamer Vorausfahrer" author="Andreas Biehn"/><ParameterDeclaration>    <Parameter name="$Road_Logics" type="string" value="AB_RQ31_R2000.xodr"/>    <Parameter name="$Road_SceneGraph" type="string" value="AB_RQ31_R2000.opt.osgb"/>    <Parameter name="$Ego_Speed" type="double" value="27.778"/>    <Parameter name="$Ego_RelLonPosA1" type="double" value="-200.0"/>    <Parameter name="$A1_Speed" type="double" value="22.222"/>    <Parameter name="$A1_Category" type="string" value="car"/></ParameterDeclaration><Catalogs>    <VehicleCatalog>        <Directory path="Catalogs/VehicleCatalogs"/>    </VehicleCatalog>    <DriverCatalog>        <Directory path="Catalogs/DriverCatalogs"/>    </DriverCatalog>    <PedestrianCatalog>        <Directory path="Catalogs/ObserverCatalogs"/>    </PedestrianCatalog>    <PedestrianControllerCatalog>        <Directory path="Catalogs/PedestrianCatalogs"/>    </PedestrianControllerCatalog>    <MiscObjectCatalog>        <Directory path="Catalogs/MiscObjectCatalogs"/>    </MiscObjectCatalog>    <EnvironmentCatalog>        <Directory path="Catalogs/EnvironmentCatalogs"/>    </EnvironmentCatalog>    <ManeuverCatalog>        <Directory path="Catalogs/ManeuverCatalogs"/>    </ManeuverCatalog>    <TrajectoryCatalog>        <Directory path="Catalogs/TrajectoryCatalog"/>    </TrajectoryCatalog>    <RouteCatalog>        <Directory path="Catalogs/RoutingCatalog"/>    </RouteCatalog></Catalogs><RoadNetwork>    <Logics filepath="$Road_Logics"/>    <SceneGraph filepath="$Road_SceneGraph"/></RoadNetwork><Entities>    <Object name="Ego">        <Vehicle name="HAF" category="car">            <ParameterDeclaration/>            <Performance maxSpeed="69.444" maxDeceleration="10.0" mass="1800.0"/>            <BoundingBox>                <Center x="1.5" y="0.0" z="0.9"/>                <Dimension width="2.1" length="4.5" height="1.8"/>            </BoundingBox>            <Axles>                <Front maxSteering="0.5" wheelDiameter="0.6" trackWidth="1.8" positionX="3.1" positionZ="0.3"/>                <Rear maxSteering="0.0" wheelDiameter="0.6" trackWidth="1.8" positionX="0.0" positionZ="0.3"/>            </Axles>            <Properties/>        </Vehicle>        <Controller>            <Driver name="HAF_Driver">                <Description weight="60.0" height="1.8" eyeDistance="0.065" age="28" sex="female">                    <Properties/>                </Description>            </Driver>        </Controller>    </Object>    <Object name="A1">        <Vehicle name="Default_Car" category="$A1_Category">            <ParameterDeclaration/>            <Performance maxSpeed="69.444" maxDeceleration="10.0" mass="1500.0"/>            <BoundingBox>                <Center x="1.4" y="0.0" z="0.8"/>                <Dimension width="2.0" length="4.2" height="1.6"/>            </BoundingBox>            <Axles>                <Front maxSteering="0.5" wheelDiameter="0.5" trackWidth="1.75" positionX="2.8" positionZ="0.25"/>                <Rear maxSteering="0.0" wheelDiameter="0.5" trackWidth="1.75" positionX="0.0" positionZ="0.25"/>            </Axles>            <Properties/>        </Vehicle>        <Controller>            <Driver name="Default_Driver">                <Description weight="80.0" height="1.88" eyeDistance="0.07" age="32" sex="male">                    <Properties/>                </Description>            </Driver>        </Controller>    </Object></Entities><Storyboard>    <Init>        <Actions>                        <Private object="Ego">                <Action>                    <Longitudinal>                        <Speed>                            <Dynamics shape="step" rate="0"/>                            <Target>                                <Absolute value="$Ego_Speed"/>                            </Target>                        </Speed>                    </Longitudinal>                </Action>                <Action>                    <Position>                        <RelativeLane object="A1" dLane="0" ds="$Ego_RelLonPosA1"/>                    </Position>                </Action>            </Private>            <Private object="A1">                <Action>                    <Longitudinal>                        <Speed>                            <Dynamics shape="step" rate="0"/>                            <Target>                                <Absolute value="$A1_Speed"/>                            </Target>                        </Speed>                    </Longitudinal>                </Action>                <Action>                    <Position>                        <Lane roadId="1" s="200.0" laneId="-3"/>                    </Position>                </Action>            </Private>        </Actions>    </Init>    <Story name="MyStory">        <Act name="Act1">            <Sequence name="Sequence1" numberOfExecutions="1">                <Actors/>            </Sequence>            <Conditions>                <Start>                    <ConditionGroup>                        <Condition name="" delay="0" edge="rising">                            <ByValue>                                <SimulationTime value="0" rule="equal_to"/>                            </ByValue>                        </Condition>                    </ConditionGroup>                </Start>            </Conditions>        </Act>    </Story>    <EndConditions/></Storyboard></OpenSCENARIO>';

describe( 'OscParameterReplacer tests', () => {

	// let reader: OscReaderService;
	// let electron = new ElectronService();
	// let fileService = new FileService( electron, null );

	// let scenario: OpenScenario;

	// beforeAll( () => {

	//     reader = new OscReaderService( fileService );

	//     scenario = reader.readContents( scenarioString );

	// } );

	// it( 'it should replace all parameters correctly', () => {

	//     expect( scenario.parameters.length ).toBe( 6 );

	//     const EGO = scenario.findEntityOrFail( 'Ego' );
	//     const A1 = scenario.findEntityOrFail( 'A1' );

	//     const egoAction = EGO.initActions[ 0 ] as OscSpeedAction;
	//     const a1Action = A1.initActions[ 0 ] as OscSpeedAction;

	//     expect( egoAction.target.value ).toBe( 27.778 );
	//     expect( a1Action.target.value ).toBe( 22.222 );

	// } );

	// it( 'it should replace all $owner variables correctly', () => {

	//     expect( true ).toBe( true );

	// } );

} );
