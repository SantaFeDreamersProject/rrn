import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import App from 'client/containers/App'
import reducers from 'client/reducers'
import { Router, Route, Redirect, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import apiMiddleware from 'client/middleware/api'

require('client/style/app');

/**
 * Store setup
 */
const loggerMiddleware = createLogger()
const store = createStore(
  reducers,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    //loggerMiddleware, // neat middleware that logs actions
    apiMiddleware
  ))
const history = syncHistoryWithStore(browserHistory, store)

/**
 * Page imports
 */
import CalloutPage from 'client/containers/pages/Callout'
import ResponsePage from 'client/containers/pages/Response'
import ResponderPage from 'client/containers/pages/Responder'
import RespondersPage from 'client/containers/pages/Responders'
import NotFoundPage from 'client/containers/pages/NotFound'

const rootElement = document.getElementById('root')

/**
 * Render the application
 */
render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <Route path="callout/new" component={CalloutPage}/>
          <Route path="response/:calloutId/new" component={ResponsePage}/>
          <Route path="responder/new" component={ResponderPage}/>
          <Route path="responders" component={RespondersPage}/>
          <Route path="404" component={NotFoundPage}/>
          <Redirect from="*" to="/404" />
        </Route>
      </Router>
    </Provider>,
    rootElement
);

/**
 * Load the user into state, if they have a session
 */
//store.dispatch(loadUserFromSession());
