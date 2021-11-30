import './alignment-app.css';

import React, { useEffect, useState } from 'react';

import Popup from 'react-popup';
import Spin from './view/spin/spin';

import MainViewInputs from './view/input/input-form-main';
import MainViewResults from './view/results/main-view-results';

import { decodeBase64ToJson } from './utils/decoder';
import { REQUEST_BODY_PARAM, RESPONSE_BODY_PARAM, ENCODING_PARAM } from './utils/constants';

import RequestEventObservable from './observable/request-observable';
import ResponseEventObservable from './observable/response-observable';

RequestEventObservable.init();
ResponseEventObservable.init();

function RcsbAlignmentApp() {

  const [request, updateRequest] = useState(RequestEventObservable.initialState)
  const [response, updateResponse] = useState(ResponseEventObservable.initialState);

  let updateInputFormState = null;
  const onInputsMount = (args) => {
    updateInputFormState=args[1];
  };

  const responseListner = (event) => {
    if (event.isComplete()) updateInputFormState([]);
    else if (event.isError()) {
      Popup.alert(event.getInfo().getMessage());
    }
    updateResponse(event);
  }

  useEffect(() => {
    const requestSubscriber = RequestEventObservable.subscribe(updateRequest);
    const responseSubscriber = ResponseEventObservable.subscribe(responseListner);
    updateStateFromURL();
    return () => {
      requestSubscriber.unsubscribe();
      responseSubscriber.unsubscribe();
    }
  }, []);

  const updateStateFromURL = () => {
    const url = window.location.search;
    const params = new URLSearchParams(url);
    
    if (params.has('uuid')) {
      // running alignment job can take time, we do not want the user to stop polling on page reload
      const uuid = params.get('uuid');
      ResponseEventObservable.continue(uuid);
    } else if (params.has(REQUEST_BODY_PARAM)) {
      // request data can be passed as URL parameter
      const data = params.get(REQUEST_BODY_PARAM);
      RequestEventObservable.setRequest(JSON.parse(data), ResponseEventObservable.submitRequest);
    } else if (params.has(RESPONSE_BODY_PARAM)) {
      // response data can be passed as URL parameter
      const needsDecoding = params.get(ENCODING_PARAM) && params.get(ENCODING_PARAM) === 'true';
      const json = (needsDecoding)? decodeBase64ToJson(params.get(RESPONSE_BODY_PARAM)) 
                                  : JSON.parse(params.get(RESPONSE_BODY_PARAM));
      ResponseEventObservable.setResponse(json);
    }
  }

  return (
    <div className='app-body'>
      <div className='box-column'>
        <MainViewInputs 
          ctx={RequestEventObservable}
          onMount={onInputsMount}
          onSubmit={() => ResponseEventObservable.submitRequest(request)} 
          onClear={() => RequestEventObservable.clear()}
        />
        {response.isRunning() && <Spin />}
        {response.isComplete() && <MainViewResults response={response}/>}
      </div>
    </div>
  )
}

export default RcsbAlignmentApp;