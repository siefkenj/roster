import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";

type HasId = { id: number };

/**
 * Convert a snake_case string to camelCase
 *
 * Taken from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
 */
const toCamel = (s: string) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};

/**
 * Type that converts snake_case to camelCase
 * Taken from https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case
 */
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

/** Convert snake case `K` to camel case `setK` */
type AttrNameSet<K> = SnakeToCamelCase<`set_${string & K}`>;
/** Convert snake case `K` to camel case `upsertK` */
type AttrNameUpsert<K> = SnakeToCamelCase<`upsert_${string & K}`>;
/** Convert snake case `K` to camel case `deleteK` */
type AttrNameDelete<K> = SnakeToCamelCase<`delete_${string & K}`>;
type AttrNameSelector<K> = SnakeToCamelCase<`${string & K}`>;

type Reducer<State, Payload> = (
    state: WritableDraft<State>,
    payload: PayloadAction<Payload>
) => void;

/**
 * For every `Key in keyof T`, this type has a camelCase reducer
 * `setKey()`
 */
type HasBasicSelectors<State, RootState> = {
    [Key in keyof State as AttrNameSelector<Key>]: (
        state: RootState
    ) => State[Key];
};

/**
 * For every `Key in keyof T`, this type has a camelCase reducer
 * `setKey()`
 */
type HasBasicSetterReducer<State> = {
    [Key in keyof State as AttrNameSet<Key>]: Reducer<State, State[Key]>;
};
/**
 * For every `Key in keyof T`, this type has a camelCase reducer
 * `upsertKey()` and `deleteKey()` which operates on array-like keys.
 * Plural map must be an object type that maps pluralized attributes to
 * their singularized versions. E.g., `typeof ({users: "user"} as const)`.
 */
type HasBasicArrayReducers<State, PluralMap> = {
    [Key in keyof (State | PluralMap) as
        | AttrNameUpsert<PluralMap[Key]>
        | AttrNameDelete<PluralMap[Key]>]: Reducer<
        State,
        (State[Key] & unknown[])[number]
    >;
};

type HasBasicReducers<State, PluralMap> = HasBasicSetterReducer<State> &
    HasBasicArrayReducers<State, PluralMap>;

/**
 * Create a basic setter for each attribute in `initialState`. For each item listed in `pluralMap`, create
 * and upsert and delete reducer. Items belonging to `State[keyof PluralMap]` are assumed to be arrays which
 * have an id attribute. This id attribute will be used for upsert and delete operations.
 *
 * `sliceName` is needed for selectors. `globalState[sliceName]` should return the local state slice.
 * @param initialState
 * @param pluralMap
 * @returns
 */
export function createBasicReducers<
    State extends Record<keyof PluralMap, HasId[]>,
    PluralMap
>(initialState: State, pluralMap: PluralMap, sliceName: string) {
    function setFactory<K extends keyof State>(attr: K) {
        return (state: State, action: PayloadAction<State[K]>) => {
            state[attr] = action.payload;
        };
    }
    // Keys listed in `pluralMap` are assumed to be arrays, each item of which has an id attribute.
    function upsertFactory<K extends keyof PluralMap>(attr: K) {
        return (state: State, action: PayloadAction<State[K][number]>) => {
            const newObj = action.payload;
            const obj = state[attr].find((e) => e.id === newObj.id);
            if (obj) {
                Object.assign(obj, newObj);
            } else {
                state[attr].push(newObj);
            }
        };
    }
    function deleteFactory<K extends keyof PluralMap>(attr: K) {
        return (state: State, action: PayloadAction<State[K][number]>) => {
            const newObj = action.payload;
            const matchingIndex = state[attr].findIndex(
                (s) => s.id === newObj.id
            );
            if (matchingIndex !== -1) {
                state[attr].splice(matchingIndex, 1);
            }
        };
    }

    // Actually create all the reducers.
    const reducers: Record<string, Function> = {};
    for (const attr of Object.keys(pluralMap) as (keyof PluralMap)[]) {
        const camelUpsert = toCamel(`upsert_${pluralMap[attr]}`);
        const camelDelete = toCamel(`delete_${pluralMap[attr]}`);
        reducers[camelUpsert] = upsertFactory(attr);
        reducers[camelDelete] = deleteFactory(attr);
    }
    for (const attr of Object.keys(initialState) as (keyof State)[]) {
        const camelSet = toCamel(`set_${attr}`);
        reducers[camelSet] = setFactory(attr);
    }

    // Create the selectors
    const selectors: Record<string, Function> = {};
    for (const attr of Object.keys(initialState) as (keyof State & string)[]) {
        const camelSet = toCamel(attr);
        selectors[camelSet] = (state: any) => state[sliceName][attr];
    }

    return {
        reducers: reducers as HasBasicReducers<State, PluralMap>,
        selectors: selectors as HasBasicSelectors<State, unknown>,
    };
}
