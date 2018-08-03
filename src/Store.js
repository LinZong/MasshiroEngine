import { createStore, applyMiddleware, compose ,combineReducers} from 'redux';

import { WelcomeViewReducer,GameViewReducer } from './Engine/reducer/index';

import thunkMiddleware from 'redux-thunk'

import reset from './reset-store-enhancer/reset';

const middlewares = [thunkMiddleware];

const reducer = combineReducers({
  Welcome:WelcomeViewReducer,
  GameView:GameViewReducer,
})

const storeEnhancers = compose(
  applyMiddleware(...middlewares),
  reset,
  window.devToolsExtension && window.devToolsExtension()
);

export default createStore(reducer, {}, storeEnhancers);