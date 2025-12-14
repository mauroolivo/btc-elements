export interface ParamsDictionary {
  [key: string]:
    | string
    | boolean
    | number
    | ParamsDictionary
    | ParamsDictionary[];
}
