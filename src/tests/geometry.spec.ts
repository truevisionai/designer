// eps used for float tolerance
const EPS = 1e-6;

export type Pt = { x: number; y: number };

// 1) Dedup consecutive duplicates, ensure closed ring
export function normalizeRing ( points: Pt[], eps = EPS ): Pt[] {
    const out: Pt[] = [];
    for ( const p of points ) {
        if ( out.length === 0 ) { out.push( p ); continue; }
        const q = out[ out.length - 1 ];
        if ( Math.hypot( p.x - q.x, p.y - q.y ) > eps ) out.push( p );
    }
    // close
    if ( out.length >= 2 ) {
        const a = out[ 0 ], b = out[ out.length - 1 ];
        if ( Math.hypot( a.x - b.x, a.y - b.y ) > eps ) out.push( { ...out[ 0 ] } );
    }
    return out;
}

// 2) Signed area (shoelace). >0 => CCW, <0 => CW
function signedArea ( points: Pt[] ): number {
    let s = 0;
    for ( let i = 0; i < points.length - 1; i++ ) {
        const p = points[ i ], q = points[ i + 1 ];
        s += ( p.x * q.y ) - ( q.x * p.y );
    }
    return 0.5 * s;
}

export function isClockwise ( points: Pt[], eps = EPS ): boolean {
    return signedArea( points ) < -eps;
}
export function isCounterClockwise ( points: Pt[], eps = EPS ): boolean {
    return signedArea( points ) > eps;
}

// 3) Segment intersection test for simplicity check
function segsIntersect ( a1: Pt, a2: Pt, b1: Pt, b2: Pt, eps = EPS ): boolean {
    // Exclude shared endpoints by caller; robust 2D orientation test
    const orient = ( p: Pt, q: Pt, r: Pt ) => ( q.x - p.x ) * ( r.y - p.y ) - ( q.y - p.y ) * ( r.x - p.x );

    const o1 = orient( a1, a2, b1 );
    const o2 = orient( a1, a2, b2 );
    const o3 = orient( b1, b2, a1 );
    const o4 = orient( b1, b2, a2 );

    // Proper intersection (strict)
    if ( ( o1 > eps && o2 < -eps || o1 < -eps && o2 > eps ) &&
        ( o3 > eps && o4 < -eps || o3 < -eps && o4 > eps ) ) return true;

    // Collinear/overlap checks (treat as intersecting)
    const onSeg = ( p: Pt, q: Pt, r: Pt ) =>
        Math.min( p.x, r.x ) - eps <= q.x && q.x <= Math.max( p.x, r.x ) + eps &&
        Math.min( p.y, r.y ) - eps <= q.y && q.y <= Math.max( p.y, r.y ) + eps;

    if ( Math.abs( o1 ) <= eps && onSeg( a1, b1, a2 ) ) return true;
    if ( Math.abs( o2 ) <= eps && onSeg( a1, b2, a2 ) ) return true;
    if ( Math.abs( o3 ) <= eps && onSeg( b1, a1, b2 ) ) return true;
    if ( Math.abs( o4 ) <= eps && onSeg( b1, a2, b2 ) ) return true;

    return false;
}

export function isSimplePolygon ( points: Pt[], eps = EPS ): boolean {
    // assumes closed ring [0..n-1] with points[0] ~= points[n-1]
    const n = points.length - 1;
    if ( n < 3 ) return false;
    for ( let i = 0; i < n; i++ ) {
        const a1 = points[ i ], a2 = points[ ( i + 1 ) % points.length ];
        for ( let j = i + 1; j < n; j++ ) {
            const b1 = points[ j ], b2 = points[ ( j + 1 ) % points.length ];
            // skip adjacency: edges that share a vertex or are the same edge
            const adj = ( j === i ) || ( j === i - 1 ) || ( j === i + 1 ) || ( i === 0 && j === n - 1 );
            if ( adj ) continue;
            if ( segsIntersect( a1, a2, b1, b2, eps ) ) return false;
        }
    }
    return true;
}

// 4) (Optional) Check segments chain end->start
export function segmentsAreChained ( segments: Pt[][], eps = EPS ): boolean {
    for ( let i = 0; i < segments.length - 1; i++ ) {
        const lastA = segments[ i ][ segments[ i ].length - 1 ];
        const firstB = segments[ i + 1 ][ 0 ];
        if ( Math.hypot( lastA.x - firstB.x, lastA.y - firstB.y ) > eps ) return false;
    }
    return true;
}
