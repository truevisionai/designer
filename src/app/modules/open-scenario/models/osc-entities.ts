import { AbstractController, AbstractPrivateAction, IScenarioObject } from './osc-interfaces';
import { OscCatalogReference } from './osc-catalogs';
import { OscObjectType } from './osc-enums';
import { Vector3 } from 'three';
import { OscSpeedAction } from './actions/osc-speed-action';
import { GameObject } from '../../../core/game-object';

export class OscEntityObject {

    private static count = 1;

    public gameObject: GameObject;
    public type: OscObjectType;
    // OSCMiscObject
    public object: IScenarioObject;

    public initActions: AbstractPrivateAction[] = [];
    // OSCPedestrian
    public catalogReference: OscCatalogReference;
    public sCoordinate: number;
    // OSCVehicle
    public tCoordinate: number;
    public automove: boolean = true;
    public direction: number = 1;
    // OSCPedestrianController
    public controller: AbstractController;
    // OSCDriver
    private _name: string;
    private _speed = 0;
    private _speedAction: OscSpeedAction;
    private _roadId: number;
    private _laneSectionId: number;
    // OSCCatalogReference
    private _laneId: number;
    private _laneOffset: number = 0;
    private _hdg: number = 0;
    private _maxSpeed: number;
    private _enabled: boolean = true;

    public distanceTravelled = 0;

    constructor ( name: string, object: IScenarioObject = null, controller: AbstractController = null ) {

        this.name = name;
        this.object = object;
        this.controller = controller;

        OscEntityObject.count++;

    }

    static getNewName ( name = 'Player' ) {

        return `${ name }${ this.count }`;

    }

    get enabled (): boolean {

        return this._enabled;

    }

    set enabled ( value: boolean ) {

        this._enabled = value;

    }

    // OSCCatalogReference

    get maxSpeed (): number {

        return this._maxSpeed;

    }

    set maxSpeed ( value: number ) {

        this._speed = value;
        this._maxSpeed = value;

    }

    get hdg (): number {

        return this._hdg;

    }

    set hdg ( value: number ) {

        this._hdg = value;

    }

    get laneOffset (): number {

        return this._laneOffset;

    }

    set laneOffset ( value: number ) {

        this._laneOffset = value;

    }

    get laneId (): number {

        return this._laneId;

    }

    set laneId ( value: number ) {

        this._laneId = value;

    }

    get laneSectionId (): number {

        return this._laneSectionId;

    }

    set laneSectionId ( value: number ) {

        this._laneSectionId = value;
        // console.info( 'lane-section-changed', this.roadId, this.laneSectionId, this.laneId, this.sCoordinate );

    }

    get roadId (): number {

        return this._roadId;

    }

    set roadId ( value: number ) {

        // let vehiclesOnRoad = OscPlayerService.traffic.get( this.roadId );
        //
        // vehiclesOnRoad = vehiclesOnRoad.filter( entity => {
        //     return entity.name != this.name;
        // } );
        //
        // // reset traffic on that road
        // OscPlayerService.traffic.set( this.roadId, vehiclesOnRoad );

        this._roadId = value;

        // add this vehicle on new road
        // OscPlayerService.traffic.get( this.roadId ).push( this );

        // console.log( OscPlayerService.traffic );
    }

    get position (): Vector3 { return this.gameObject.position; }

    get name (): string { return this._name; }

    set name ( value: string ) { this._name = value; }

    get speed (): number { return this._speed; }

    set speed ( value: number ) { this._speed = value; }

    get speedAction () { return this._speedAction; }

    set speedAction ( value ) { this._speedAction = value; }

    setPosition ( position: Vector3 ) {

        this.gameObject.position.copy( position );

    }

    addInitAction ( action: AbstractPrivateAction ) {

        this.initActions.push( action );

    }

    update () {

        if ( !this.automove && !this.enabled ) return;

        const previousPosition = this.position.clone();

        this.controller.update();

        const newPosition = this.position.clone();

        const distanceTravelled = previousPosition.distanceTo( newPosition );

        this.distanceTravelled += distanceTravelled;

    }

    enable () {

        this.enabled = true;

        this.gameObject.visible = true;

    }

    disable () {

        this.enabled = false;

        this.gameObject.visible = false;

    }
}

