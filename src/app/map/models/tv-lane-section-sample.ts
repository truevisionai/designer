/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneHeight } from '../lane-height/lane-height.model';
import { TvLaneRoadMark } from './tv-lane-road-mark';


export class TvLaneSectionSample {

	private mLeftTypeVector: string[] = [];
	private mLeftWidthVector: number[] = [];
	private mLeftHeightVector: TvLaneHeight[] = [];
	private mLeftRoadMarkVector: TvLaneRoadMark[] = [];
	private mLeftLevelVector: boolean[] = [];

	private mRightTypeVector: string[] = [];
	private mRightWidthVector: number[] = [];
	private mRightHeightVector: TvLaneHeight[] = [];
	private mRightRoadMarkVector: TvLaneRoadMark[] = [];
	private mRightLevelVector: boolean[] = [];


	/**
	 * Lane Section Sample. Holds all the lane information at a certain S value including lane widths, levels,
	 * heights, etc
	 *
	 *
	 *
	 *
	 */
	constructor () {

	}


	addLeftType ( type: string ): void {
		this.mLeftTypeVector.push( type );
	}

	addLeftWidth ( width: number ): void {
		this.mLeftWidthVector.push( width );
	}

	addLeftHeight ( height: TvLaneHeight ): void {
		this.mLeftHeightVector.push( height );
	}

	addLeftRoadMark ( roadMark: TvLaneRoadMark ): void {
		this.mLeftRoadMarkVector.push( roadMark );
	}

	addLeftLevel ( level: boolean ): void {
		this.mLeftLevelVector.push( level );
	}


	addRightType ( type: string ): void {
		this.mRightTypeVector.push( type );
	}

	addRightWidth ( width: number ): void {
		this.mRightWidthVector.push( width );
	}

	addRightHeight ( height: TvLaneHeight ): void {
		this.mRightHeightVector.push( height );
	}

	addRightRoadMark ( roadMark: TvLaneRoadMark ): void {
		this.mRightRoadMarkVector.push( roadMark );
	}

	addRightLevel ( level: boolean ): void {
		this.mRightLevelVector.push( level );
	}

	addLeftRecord ( type: string, width: number, height: TvLaneHeight, roadMark: TvLaneRoadMark, level: boolean ): void {
		this.addLeftType( type );
		this.addLeftWidth( width );
		this.addLeftHeight( height );
		this.addLeftRoadMark( roadMark );
		this.addLeftLevel( level );
	}

	addRightRecord ( type: string, width: number, height: TvLaneHeight, roadMark: TvLaneRoadMark, level: boolean ): void {
		this.addRightType( type );
		this.addRightWidth( width );
		this.addRightHeight( height );
		this.addRightRoadMark( roadMark );
		this.addRightLevel( level );
	}

	// LEFT

	getLeftType ( i: number ): string {
		return this.mLeftTypeVector[ i ];
	}

	getLeftWidth ( i: number ): number {
		return this.mLeftWidthVector[ i ];
	}

	getLeftHeight ( i: number ): TvLaneHeight {
		return this.mLeftHeightVector[ i ];
	}

	getLeftRoadMark ( i: number ): TvLaneRoadMark {
		return this.mLeftRoadMarkVector[ i ];
	}

	getLeftLevel ( i: number ): boolean {
		return this.mLeftLevelVector[ i ];
	}

	// RIGHT

	getRightType ( i: number ): string {
		return this.mRightTypeVector[ i ];
	}

	getRightWidth ( i: number ): number {
		return this.mRightWidthVector[ i ];
	}

	getRightHeight ( i: number ): TvLaneHeight {
		return this.mRightHeightVector[ i ];
	}

	getRightRoadMark ( i: number ): TvLaneRoadMark {
		return this.mRightRoadMarkVector[ i ];
	}

	getRightLevel ( i: number ): boolean {
		return this.mRightLevelVector[ i ];
	}

	getLeftVectorsSize (): number {
		return this.mLeftWidthVector.length;
	}

	getRightVectorsSize (): number {
		return this.mRightWidthVector.length;
	}

	getLeftTypeVector (): string[] {
		return this.mLeftTypeVector;
	}

	getLeftWidthVector (): number[] {
		return this.mLeftWidthVector;
	}

	getLeftHeigthVector (): TvLaneHeight[] {
		return this.mLeftHeightVector;
	}

	getLeftRoadMarkVector (): TvLaneRoadMark[] {
		return this.mLeftRoadMarkVector;
	}

	getLeftLevelVector (): boolean[] {
		return this.mLeftLevelVector;
	}

	getRightTypeVector (): string[] {
		return this.mRightTypeVector;
	}

	getRightWidthVector (): number[] {
		return this.mRightWidthVector;
	}

	getRightHeigthVector (): TvLaneHeight[] {
		return this.mRightHeightVector;
	}

	getRightRoadMarkVector (): TvLaneRoadMark[] {
		return this.mRightRoadMarkVector;
	}

	getRightLevelVector (): boolean[] {
		return this.mRightLevelVector;
	}

	clearVectors (): void {

		this.mLeftTypeVector.splice( 0, this.mLeftTypeVector.length );
		this.mLeftWidthVector.splice( 0, this.mLeftWidthVector.length );
		this.mLeftHeightVector.splice( 0, this.mLeftHeightVector.length );
		this.mLeftRoadMarkVector.splice( 0, this.mLeftRoadMarkVector.length );
		this.mLeftLevelVector.splice( 0, this.mLeftLevelVector.length );

		this.mRightTypeVector.splice( 0, this.mRightTypeVector.length );
		this.mRightWidthVector.splice( 0, this.mRightWidthVector.length );
		this.mRightHeightVector.splice( 0, this.mRightHeightVector.length );
		this.mRightRoadMarkVector.splice( 0, this.mRightRoadMarkVector.length );
		this.mRightLevelVector.splice( 0, this.mRightLevelVector.length );

	}

}
