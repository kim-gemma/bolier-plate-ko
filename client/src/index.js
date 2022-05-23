import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux';

//import 'antd/dist/antd.css'; // css framework

import { applyMiddleware, createStore } from 'redux'; //createStore -> configureSotre

import promisMiddleware from 'redux-promise'
import reduxThunk from 'redux-thunk'
import Reducer from './_reducers'

// middleware를 이용해야 객체의 action만 받는 store를 promise와 function도 받게 하기 위해서 추가한다.
// store는 객체만 받기 때문에, promise와 function도 받기 위해서 (promiseMiddleware, ReduxThunk) 추가한다.
const createStoreWithMiddleware = applyMiddleware(promisMiddleware, reduxThunk) (createStore)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* connect to Redux */}
    <Provider store={createStoreWithMiddleware(Reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
      )} > 

    <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();