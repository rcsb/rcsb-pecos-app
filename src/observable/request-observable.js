import { Subject } from 'rxjs';
import clonedeep from 'lodash.clonedeep';

import QueryRequest from '../model/request/request';
import InputOptionsEnum from '../model/enum/enum-input-options';

const subject = new Subject();

const initialState = new QueryRequest();
let state = initialState;

function structureShortcut(state, index, type) {
  return state.getQuery().getContext().getStructure(index, type);
}

function update(updatedState) {
  state = updatedState;
  subject.next(state);
}

export const RequestEventObservable = {
  init: () => state = initialState,
  subscribe: (fn) => subject.subscribe(fn),
  setRequest: (in_request, fn) => { 
    state = new QueryRequest(in_request);
    fn(state);
    subject.next(state);
  },
  getInstanceIds: () => {
    return state.getInstances();
  },
  getTypes: () => {
    return state.getQuery().getContext().getStructures().map(s => s.getType());
  },
  getStructure(index, type) {
    return structureShortcut(state, index, type);
  },
  structuresCount() {
    return state.getQuery().getContext().getStructures().length;
  },
  addStructure(type) {
    const clone = clonedeep(state);
    const types = clone.getQuery().getContext().addStructure(type);
    update(clone);
    return types;
  },
  deleteStructure: (index) => {
    const clone = clonedeep(state);
    const types = clone.getQuery().getContext().deleteStructure(index);
    if (clone.getFiles()[index]) clone.getFiles().splice(index, 1);
    update(clone);
    return types;
  },
  resetStructure(index, type) {
    const clone = clonedeep(state);
    const types = clone.getQuery().getContext().resetStructure(index, type);
    if (clone.getFiles()[index]) clone.getFiles().splice(index, 1);
    update(clone);
    return types;
  },
  updateEntryId: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).setEntryId(value);
    if (value.length !== 4) {
      clone.getQuery().getContext().getStructure(index, type).getSelection().setAsymId(undefined);
      clone.getQuery().getContext().getStructure(index, type).getSelection().setBegSeqId(undefined);
      clone.getQuery().getContext().getStructure(index, type).getSelection().setEndSeqId(undefined);
    }
    update(clone);
  },
  getEntryId: (index, type) => {
    return structureShortcut(state, index, type).getEntryId();
  },
  isValidEntryId: (index) => {
    return structureShortcut(state, index, InputOptionsEnum.PDB_ENTRY).isValidId()
  },
  updateAsymId: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).getSelection().setAsymId(value);
    update(clone);
  },
  getAsymId: (index, type) => {
    return structureShortcut(state, index, type).getSelection().getAsymId();
  },
  updateBegSeqId: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).getSelection().setBegSeqId(value);
    update(clone);
  },
  getBegSeqId: (index, type) => {
    return structureShortcut(state, index, type).getSelection().getBegSeqId();
  },
  updateEndSeqId: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).getSelection().setEndSeqId(value);
    update(clone);
  },
  getEndSeqId: (index, type) => {
    return structureShortcut(state, index, type).getSelection().getEndSeqId();
  },
  updateFile: (value, index) => {
    const clone = clonedeep(state);
    clone.addFile(value, index);
    update(clone);
  },
  getFile: (index) => {
    return state.getFile(index);
  },
  updateFormat: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).setFormat(value);
    update(clone);
  },
  getFormat: (index, type) => {
    return structureShortcut(state, index, type).getFormat();
  },
  updateURL: (value, index, type) => {
    const clone = clonedeep(state);
    structureShortcut(clone, index, type).setURL(value);
    update(clone);
  },
  getURL: (index, type) => {
    return structureShortcut(state, index, type).getURL();
  },
  updateMethodName: (value) => {
    const clone = clonedeep(state);
    clone.getQuery().getContext().getMethod().setMethodName(value);
    clone.getQuery().getContext().getMethod().setParameters(undefined);
    update(clone);
  },
  getMethodName: () => {
    return state.getQuery().getContext().getMethod().getMethodName();
  },
  updateMethodParam: (paramName, paramValue) => {
    const clone = clonedeep(state);
    clone.getQuery().getContext().getMethod().setMethodParameter(paramName, paramValue);
    update(clone);
  },
  getMethodParam: (paramName) => {
    return state.getQuery().getContext().getMethod().getMethodParameter(paramName);
  },
  updateMode: (value) => {
    const clone = clonedeep(state);
    clone.getQuery().getContext().setMode(value);
    update(clone);
  },
  getMode: () => {
    return state.getQuery().getContext().getMode();
  },
  isSubmittable: () => {
    return state.isSubmittable();
  },
  clear: () => {
    update(initialState);
  },
  initialState
}

export default RequestEventObservable;