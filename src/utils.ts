
//----------------------------------
//  Map
//----------------------------------

// https://github.com/Microsoft/TypeScript/blob/master/lib/lib.es2015.collection.d.ts
export interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;

    // set will return undefined in IE 11
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set#Compatibility_notes
    set(key: K, value: V): void;
    readonly size: number;
}

export interface MapConstructor {
    // new <K, V>(entries?: [K, V][]): Map<K, V>; // entries parameter not supported in IE 11
    new <K = any, V = any>(): Map<K, V>;
    readonly prototype: Map<any, any>;
}

//----------------------------------
//  unique id
//----------------------------------
let _uid_counter = 1;
export function generateUID(): number{
    return _uid_counter++;
}


//----------------------------------
// simple event system
//----------------------------------

export class SignalDispatcher {
    subscribe(subscriber: () => void): void {
        this.subscribers.push(subscriber);
    }

    dispatch(): void {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }

    subscribers: (() => void)[] = [];
}
  
export class SimpleEventDispatcher<T> {
    subscribe(subscriber: (arg: T) => void): void {
        this.subscribers.push(subscriber);
    }

    dispatch(arg: T): void {
        for (const subscriber of this.subscribers) {
            subscriber(arg);
        }
    }

    subscribers: ((arg: T) => void)[] = [];
}
  


//----------------------------------
// base URL 
//----------------------------------

export function baseURL(): string{
    return window.location.href.substring(0, window.location.href.lastIndexOf("/"));
}




//----------------------------------
// vec2
//----------------------------------

export class Vec2{

    constructor(public x: number, public y: number){}

    length(): number{
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    normalize(): void{
        const l = this.length();
        if(l>0){
            this.x /= l;
            this.y /= l;
        }
    }

    normalized(): Vec2{
        const v = Vec2.create(this.x, this.y);
        v.normalize();
        return v;
    }


    static create( x: number, y: number ): Vec2{
        return new Vec2(x, y);
    }

    static from<T extends {x: number, y: number}>( v: T ): Vec2{
        return Vec2.create(v.x, v.y);
    }

    // a-b
    static subtract( a: Vec2, b: Vec2 ): Vec2{
        return Vec2.create(a.x - b.x, a.y - b.y);
    }

    static dot( a: Vec2, b: Vec2 ): number{
        return a.x*b.x + a.y*b.y;
    }
    
}



