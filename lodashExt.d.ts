declare namespace _ {
    /* tslint:disable:interface-name */
    interface LoDashStatic {
        omitPrivateFields(obj:any, prefixies?:string[]): any;
        camelizeObject(obj:any): any;
        isPromise(obj:any): boolean;
        addUniq<T>(list:T[], item:T|T[]): boolean;
        removeItem<T>(list:T[], item:T): boolean;
        removeItems<T>(list:T[], items:T[]): boolean;
        addItems<T>(source:T[], items:T[]): T[];
        isValuable(value:any): boolean;
        inherit(Child:Function, Parent:Function, overrides:any): void;
        clearDefaults(obj:any, defaults?:any): any;
        hasValues(obj:any, _objects?:any): boolean;
        emTrunc(input:string, limit:number, byWord?:boolean): string;
        renameFields(obj:any, hash:any): any;
        pythonizeObject(obj:any):any;
        isDefined(obj:any): boolean;
        limitTo(value:number, min:number, max:number): number;
        bindDomEventToScope(scope:ng.IScope, elm:JQuery, event:string, handler:Function): void;
        getCharFromKeypress(event:KeyboardEvent): string;
        wordsOriginal(str:string):string[];
    }
    /* tslint:enable:interface-name */
}

