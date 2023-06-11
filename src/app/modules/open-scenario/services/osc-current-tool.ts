// import { AbstractTool } from '../tools/abstract-tool';
// import { EventEmitter } from '@angular/core';
//
// export class OscCurrentTool {
//
//     public static toolChanged = new EventEmitter<AbstractTool>();
//
//     private static tool: AbstractTool;
//
//     static get currentTool (): AbstractTool {
//
//         return this.tool;
//
//     }
//
//     static set currentTool ( value: AbstractTool ) {
//
//         this.destroyPreviousState();
//
//         this.tool = value;
//
//         this.tool.init();
//
//         this.tool.enable();
//
//         this.toolChanged.emit( value );
//     }
//
//     static clear () {
//
//         this.destroyPreviousState();
//
//         this.toolChanged.emit( null );
//     }
//
//     private static destroyPreviousState () {
//
//         if ( this.tool == null ) return;
//
//         this.tool.disable();
//
//         delete this.tool;
//     }
// }
