/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { Component, Input, OnInit } from '@angular/core';
// import { IComponent } from '../../../../core/game-object';
// import * as THREE from 'three';
// import { Material, MeshBasicMaterial, Texture } from 'three';
// import { CommandHistory } from '../../../../services/command-history';
// import { SetMaterialMapCommand } from '../../commands/set-material-map-command';

// @Component( {
//     selector: 'app-material-inspector',
//     templateUrl: './material-inspector.component.html',
// } )
// /**
//  * @deprecated
//  */
// export class MaterialInspectorComponent implements OnInit, IComponent {

//     @Input() data: Material | Material[];

//     /**
//      * Color Picker position
//      */
//     @Input() cpPosition: string = 'top';


//     get material (): MeshBasicMaterial {
//         return this.data as MeshBasicMaterial;
//     }

//     get color (): any {
//         return '#' + this.material.color.getHexString();
//     }

//     set color ( value: any ) {
//         this.material.color.setStyle( value );
//     }

//     ngOnInit (): void {
//     }

//     onEventLog ( event: string, data: string ) {

//         // console.log( event, data );

//         // this.data.color.setStyle( data[ 'color' ] );

//         // console.log( '#' + this.data.color.getHexString() );
//         // console.log( '#' + this.data.color.getHex() );
//         // console.log( '#' + this.data.color.getStyle() );

//     }

//     onAlbedoChanged ( texture: Texture ) {

//         texture.wrapS = THREE.RepeatWrapping;
//         texture.wrapT = THREE.RepeatWrapping;
//         texture.mapping = THREE.UVMapping;
//         texture.repeat.set( 1, 1 );
//         texture.anisotropy = 5;

//         CommandHistory.execute( new SetMaterialMapCommand( this.material, 'map', texture, 1 ) );

//     }
// }
