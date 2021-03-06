import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import store from './Store';
import IntlWrapper from './Views/IntlWrapper';
import { LoadSetting } from './Engine/actions/SettingActions';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { AllChapterView, GameView, WelcomeView, Settings, SaveDataView,Extra,FlowChart } from './Views';
import registerServiceWorker from './registerServiceWorker';
function LoadSettingToStore() {
    let defSettings = window.electron.remote.getGlobal('SettingsNode');
    let customSettings = window.electron.remote.getGlobal('CustomModuleData');
    store.dispatch(LoadSetting({...defSettings,...customSettings}));
}
LoadSettingToStore();
ReactDOM.render(
    <Provider store={store}>
        <IntlWrapper locale="en">
            <BrowserRouter>
                <div>
                    <Switch>
                        <Route exact path='/' component={WelcomeView} />
                        <Route path='/savedata/:type/:from' component={SaveDataView} />
                        <Route path='/savedata/:type' component={SaveDataView} />
                        <Route path='/chapters' component={AllChapterView} />
                        <Route path='/extra' component={Extra} />
                        <Route path='/flowchart' component={FlowChart} />
                        <Route path='/section/:load' component={GameView} />
                        <Route path='/NewSettings' component={Settings} />
                        <Redirect to='/' />
                    </Switch>
                </div>
            </BrowserRouter>
        </IntlWrapper>
    </Provider>
    , document.getElementById('root'));
if (module.hot) {
    module.hot.accept();
}
registerServiceWorker();