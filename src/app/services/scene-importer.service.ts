/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AppInspector } from 'app/core/inspector';
import { IFile } from 'app/core/models/file';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { AbstractReader } from 'app/core/services/abstract-reader';
import { SceneService } from 'app/core/services/scene.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { ToolManager } from 'app/core/tools/tool-manager';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { OpenDriverParser } from 'app/modules/tv-map/services/open-drive-parser.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { XMLParser } from 'fast-xml-parser';
import { Euler, Object3D, Vector2, Vector3 } from 'three';
import { AssetDatabase } from './asset-database';
import { AssetLoaderService } from './asset-loader.service';
import { CommandHistory } from './command-history';
import { FileService } from './file.service';
import { ModelImporterService } from './model-importer.service';
import { SnackBar } from './snack-bar.service';

@Injectable( {
    providedIn: 'root'
} )
export class SceneImporterService extends AbstractReader {

    constructor (
        private fileService: FileService,
        private openDriveService: TvMapService,
        private assets: AssetLoaderService,
        private odParser: OpenDriverParser,
        private modelImporter: ModelImporterService
    ) {
        super();
    }

    get map (): TvMap {
        return TvMapInstance.map;
    }

    set map ( value ) {
        TvMapInstance.map = value;
    }

    importFromPath ( path: string ) {

        try {

            this.fileService.readFile( path, 'scene', ( file ) => {

                this.importFromFile( file );

            } );

        } catch ( error ) {

            SnackBar.error( error );

        }

    }

    importFromFile ( file: IFile ): void {

        try {

            if ( this.importFromString( file.contents ) ) {

                TvMapInstance.currentFile = file;

            }

        } catch ( error ) {

            SnackBar.error( error );

            console.error( error );

        }

    }


    importFromString ( contents: string ): boolean {

        const defaultOptions = {
            attributeNamePrefix: 'attr_',
            attrNodeName: false,
            textNodeName: 'value',
            ignoreAttributes: false,
            supressEmptyNode: false,
            format: true,
        };

        const parser = new XMLParser( defaultOptions );

        const scene: any = parser.parse( contents );

        // check for main elements first before parsing
        const version = scene.version;
        const guid = scene.guid;

        if ( !version ) SnackBar.error( 'Cannot read scene version. Please check scene file before importing', 'OK', 5000 );
        if ( !version ) return;

        this.prepareToImport();

        this.importScene( scene );

        return true;
    }

    private prepareToImport () {

        ToolManager.clear();

        AppInspector.clear();

        CommandHistory.clear();

        this.map.destroy();

        this.map = new TvMap();

    }

    private importScene ( xml: any ): void {

        this.readAsOptionalArray( xml.road, xml => {

            this.map.addRoadInstance( this.importRoad( xml ) );

        } );

        this.map.roads.forEach( road => road.updateGeometryFromSpline() );

        this.map.roads.forEach( road => {

            if ( road.isJunction ) {

                road.spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

            }

            // if ( road.successor && road.successor.elementType === "road" ) {

            //     const successor = this.openDrive.getRoadById( road.successor.elementId );

            //     successor.updated.subscribe( i => road.onSuccessorUpdated( i ) );
            // }

            // if ( road.predecessor && road.predecessor.elementType === "road" ) {

            //     const predecessor = this.openDrive.getRoadById( road.predecessor.elementId );

            //     predecessor.updated.subscribe( i => road.onPredecessorUpdated( i ) );
            // }

        } );

        this.readAsOptionalArray( xml.prop, xml => {

            this.importProp( xml );

        } );

        this.readAsOptionalArray( xml.propCurve, xml => {

            this.map.propCurves.push( this.importPropCurve( xml ) );

        } );

        this.readAsOptionalArray( xml.propPolygon, xml => {

            this.map.propPolygons.push( this.importPropPolygon( xml ) );

        } );

        this.readAsOptionalArray( xml.surface, xml => {

            this.map.surfaces.push( this.importSurface( xml ) );

        } );

        this.readAsOptionalArray( xml.junction, xml => {

            const junction = this.odParser.readJunction( xml );

            if ( xml.position ) {

                junction.position = new Vector3(
                    parseFloat( xml.position.attr_x ),
                    parseFloat( xml.position.attr_y ),
                    parseFloat( xml.position.attr_z ),
                );
            }

            this.map.addJunctionInstance( junction );

        } );


        this.map.roads.forEach( road => {

            TvMapBuilder.buildRoad( this.map.gameObject, road );

        } );

        SceneService.add( this.map.gameObject );

    }

    private importProp ( xml ) {

        const instance = AssetDatabase.getInstance<Object3D>( xml.attr_guid );

        if ( !instance ) SnackBar.error( `Object not found` );

        if ( !instance ) return;

        const prop = instance.clone();

        const position = new Vector3(
            parseFloat( xml.position.attr_x ),
            parseFloat( xml.position.attr_y ),
            parseFloat( xml.position.attr_z ),
        );

        const rotation = new Euler(
            parseFloat( xml.rotation.attr_x ),
            parseFloat( xml.rotation.attr_y ),
            parseFloat( xml.rotation.attr_z ),
        );

        const scale = new Vector3(
            parseFloat( xml.scale.attr_x ),
            parseFloat( xml.scale.attr_y ),
            parseFloat( xml.scale.attr_z ),
        );

        prop.position.copy( position );

        prop.rotation.copy( rotation );

        prop.scale.copy( scale );

        this.map.gameObject.add( prop );

        this.map.props.push( new PropInstance( xml.attr_guid, prop ) );

    }

    private importRoad ( xml: any ): TvRoad {

        if ( !xml.spline ) throw new Error( 'Incorrect road' );

        const name = xml.attr_name || 'untitled';
        const length = parseFloat( xml.attr_length );
        const id = parseInt( xml.attr_id );
        const junction = parseInt( xml.attr_junction ) || -1;

        const road = new TvRoad( name, length, id, junction );

        road.drivingMaterialGuid = xml.drivingMaterialGuid;
        road.sidewalkMaterialGuid = xml.sidewalkMaterialGuid;
        road.borderMaterialGuid = xml.borderMaterialGuid;
        road.shoulderMaterialGuid = xml.shoulderMaterialGuid;

        road.spline = this.importSpline( xml.spline, road );

        this.odParser.readRoadTypes( road, xml );

        if ( xml.link != null ) this.odParser.readRoadLinks( road, xml.link );

        if ( xml.elevationProfile != null ) this.odParser.readElevationProfile( road, xml.elevationProfile );

        if ( xml.lateralProfile != null ) this.odParser.readLateralProfile( road, xml.lateralProfile );

        if ( xml.lanes != null ) this.odParser.readLanes( road, xml.lanes );

        // if ( xml.objects != null && xml.objects !== '' ) this.readObjects( road, xml.objects );

        // if ( xml.signals != null && xml.signals !== '' ) this.readSignals( road, xml.signals );

        // if ( xml.surface != null && xml.surface !== '' ) this.readSurface( road, xml.surface );

        return road;
    }

    private importSurface ( xml: any ): TvSurface {

        const height = parseFloat( xml.attr_height ) || 0.0;

        const rotation = parseFloat( xml.attr_rotation ) || 0.0;

        const material = xml.material.attr_guid || 'grass';

        const offset = new Vector2(
            parseFloat( xml.offset.attr_x ),
            parseFloat( xml.offset.attr_y ),
        );

        const scale = new Vector2(
            parseFloat( xml.scale.attr_x ),
            parseFloat( xml.scale.attr_y ),
        );

        const spline = this.importCatmullSpline( xml.spline );

        const surface = new TvSurface( material, spline, offset, scale, rotation, height );

        spline.controlPoints.forEach( p => p.mainObject = surface );

        return surface;
    }

    private importSpline ( xml: any, road: TvRoad ): AbstractSpline {

        const type = xml.attr_type;

        if ( type === 'auto' ) {

            return this.importAutoSpline( xml, road );

        } else if ( type === 'explicit' ) {

            return this.importExplicitSpline( xml, road );

        } else {

            throw new Error( 'unknown spline type' );

        }

    }

    private importExplicitSpline ( xml: any, road: TvRoad ): ExplicitSpline {

        const spline = new ExplicitSpline( road );

        let index = 0;

        this.readAsOptionalArray( xml.point, xml => {

            const position = new Vector3(
                parseFloat( xml.attr_x ),
                parseFloat( xml.attr_y ),
                parseFloat( xml.attr_z ),
            );

            const hdg = parseFloat( xml.attr_hdg );

            const segType = +xml.attr_type;

            spline.addFromFile( index, position, hdg, segType );

            index++;

        } );

        // to not show any lines or control points
        spline.hide();

        return spline;
    }

    private importAutoSpline ( xml, road: TvRoad ): AutoSpline {

        const spline = new AutoSpline( road );

        let index = 0;

        this.readAsOptionalArray( xml.point, xml => {

            const controlPoint = new RoadControlPoint( road, new Vector3(
                parseFloat( xml.attr_x ),
                parseFloat( xml.attr_y ),
                parseFloat( xml.attr_z ),
            ), 'cp', index, index );

            index++;

            controlPoint.mainObject = controlPoint.userData.road = road;

            SceneService.add( controlPoint );

            spline.addControlPoint( controlPoint );

        } );

        // to not show any lines or control points
        spline.hide();

        return spline;
    }

    private importCatmullSpline ( xml: any ): CatmullRomSpline {

        const type = xml.attr_type || 'catmullrom';
        const closed = xml.attr_closed === 'true';
        const tension = parseFloat( xml.attr_tension ) || 0.5;

        const spline = new CatmullRomSpline( closed, type, tension );

        this.readAsOptionalArray( xml.point, xml => {

            const controlPoint = AnyControlPoint.create();

            controlPoint.position.set(
                parseFloat( xml.attr_x ),
                parseFloat( xml.attr_y ),
                parseFloat( xml.attr_z )
            );

            spline.addControlPoint( controlPoint );

            SceneService.add( controlPoint );

        } );

        // to make the line and other calculations
        spline.update();

        // to not show any lines or control points
        spline.hide();

        return spline;
    }

    private importOpenDrive ( road: any ) {

        // guid
        if ( typeof road === 'string' ) {

            try {

                const meta = this.assets.find( road );

                this.openDriveService.importFromPath( meta.guid );

            } catch ( error ) {

                SnackBar.error( error );

            }

        }

        if ( typeof road === 'object' ) {

        }
    }

    private importProps ( props: any ): any[] {

        const instances: any[] = [];

        if ( Array.isArray( props ) ) {

            props.forEach( ( prop: any ) => {

                instances.push( {
                    guid: prop.guid,
                    position: prop.position,
                    rotation: prop.rotation,
                    scale: prop.scale
                } );

            } );

        }

        return instances;
    }

    private importVector3 ( vector3: any ) {

        return {};

    }

    private importPropCurve ( xml: any ): PropCurve {

        const guid = xml.attr_guid;

        const meta = AssetDatabase.getMetadata( guid );

        if ( !meta ) return;

        const spline = this.importCatmullSpline( xml.spline );

        const curve = new PropCurve( guid, spline );

        spline.controlPoints.forEach( p => p.mainObject = curve );

        curve.reverse = xml.attr_reverse === 'true' ? true : false;

        curve.rotation = parseFloat( xml.attr_rotation ) || 0;

        curve.positionVariance = parseFloat( xml.attr_positionVariance ) || 0;

        this.readAsOptionalArray( xml.props, propXml => {

            const instance = AssetDatabase.getInstance( propXml.attr_guid ) as Object3D;

            const prop = instance.clone();

            const position = new Vector3(
                parseFloat( propXml.position.attr_x ),
                parseFloat( propXml.position.attr_y ),
                parseFloat( propXml.position.attr_z ),
            );

            const propRotation = new Euler(
                parseFloat( propXml.rotation.attr_x ),
                parseFloat( propXml.rotation.attr_y ),
                parseFloat( propXml.rotation.attr_z ),
            );

            const scale = new Vector3(
                parseFloat( propXml.scale.attr_x ),
                parseFloat( propXml.scale.attr_y ),
                parseFloat( propXml.scale.attr_z ),
            );

            prop.position.copy( position );

            prop.rotation.copy( propRotation );

            prop.scale.copy( scale );

            curve.props.push( prop );

            SceneService.add( prop );

        } );

        return curve;
    }

    private importPropPolygon ( xml: any ): PropPolygon {

        const guid = xml.attr_guid;

        const density = parseFloat( xml.attr_density ) || 0.5;

        const metadata = AssetDatabase.getMetadata( guid );

        if ( !metadata ) return;

        const spline = this.importCatmullSpline( xml.spline );

        const polygon = new PropPolygon( guid, spline, density );

        spline.controlPoints.forEach( p => p.mainObject = p.userData.polygon = polygon );

        this.readAsOptionalArray( xml.props, propXml => {

            const instance = AssetDatabase.getInstance( propXml.attr_guid ) as Object3D;

            const prop = instance.clone();

            const position = new Vector3(
                parseFloat( propXml.position.attr_x ),
                parseFloat( propXml.position.attr_y ),
                parseFloat( propXml.position.attr_z ),
            );

            const propRotation = new Euler(
                parseFloat( propXml.rotation.attr_x ),
                parseFloat( propXml.rotation.attr_y ),
                parseFloat( propXml.rotation.attr_z ),
            );

            const scale = new Vector3(
                parseFloat( propXml.scale.attr_x ),
                parseFloat( propXml.scale.attr_y ),
                parseFloat( propXml.scale.attr_z ),
            );

            prop.position.copy( position );

            prop.rotation.copy( propRotation );

            prop.scale.copy( scale );

            polygon.props.push( prop );

            SceneService.add( prop );

        } );

        return polygon;
    }

}
