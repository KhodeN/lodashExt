declare namespace _ {
    /* tslint:disable:interface-name */
    interface LoDashStatic {
        addItems<T>(source: T[], items: T[]): T[];
        addUniq<T>(list: T[], item: T|T[]): boolean;
        assignInjections(context: any,
                         constructor: any,
                         args: IArguments, skipFirst?: number): void;
        bindDomEventToScope(scope: any, elm: any, event: string, handler: Function): void;
        camelizeObject(obj: any): any;
        clearDefaults(obj: any, defaults?: any): any;
        emTrunc(input: string, limit: number, byWord?: boolean): string;
        getCharFromKeypress(event: KeyboardEvent): string;
        hasValues(obj: any, _objects?: any): boolean;
        inherit(Child: Function, Parent: Function, overrides: any): void;
        isDefined(obj: any): boolean;
        isPromise(obj: any): boolean;
        isValuable(value: any): boolean;
        limitTo(value: number, min: number, max: number): number;
        omitPrivateFields(obj: any, prefixies?: string[]): any;
        pythonizeObject(obj: any): any;
        removeItem<T>(list: T[], item: T): boolean;
        removeItems<T>(list: T[], items: T[]): boolean;
        renameFields(obj: any, hash: any): any;
        wordsOriginal(str: string): string[];
    }
    /* tslint:enable:interface-name */
}

declare module 'lodash-ext' {
    var _: _.LoDashStatic;
    export = _;
}