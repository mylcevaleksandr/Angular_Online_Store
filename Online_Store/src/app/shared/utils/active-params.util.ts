import {Params} from "@angular/router";
import {ActiveParamsType} from "../../../types/active-params.type";
import {SizeVariablesUtil} from "./sizeVariables.util";

export class ActiveParamsUtil {

  static processParams(params: Params): ActiveParamsType {
    const activeParams: ActiveParamsType = {types: []};
    if (params.hasOwnProperty('types') && params['types'] !== undefined) {
      activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
    } else {
      activeParams.types = [];
    }
    if (params.hasOwnProperty(SizeVariablesUtil.heightFrom)) {
      activeParams.heightFrom = params[SizeVariablesUtil.heightFrom];
    }
    if (params.hasOwnProperty(SizeVariablesUtil.heightTo)) {
      activeParams.heightTo = params[SizeVariablesUtil.heightTo];
    }
    if (params.hasOwnProperty(SizeVariablesUtil.diameterFrom)) {
      activeParams.diameterFrom = params[SizeVariablesUtil.diameterFrom];
    }
    if (params.hasOwnProperty(SizeVariablesUtil.diameterTo)) {
      activeParams.diameterTo = params[SizeVariablesUtil.diameterTo];
    }
    if (params.hasOwnProperty('sort')) {
      activeParams.sort = params['sort'];
    }
    if (params.hasOwnProperty('page')) {
      activeParams.page = +params['page'];
    }
    else {
      activeParams.page = 1;
    }
    return activeParams;
  }
}
