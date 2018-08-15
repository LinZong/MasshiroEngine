import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom'
import 'bulma/css/bulma.css'
import './WelcomeView.css'
import store from '../../Store';
import {LeaveGameView} from '../../Engine/actions/SectionActions';
const electron = window.electron;
class WelcomeView extends React.Component {
    constructor(){
        super(...arguments);
        this.welcomeRef=React.createRef();
        this.WelcomeImageAnimator=this.WelcomeImageAnimator.bind(this);
    }
    WelcomeImageAnimator(){
        var count = 0;
        let IntervalHandler = setInterval(()=>{if(0<=count&&count<=60){count++;this.welcomeRef.current.style.opacity = 1-(count/60);}},32);
        setTimeout(()=>{this.welcomeRef.current.style.zIndex=0;clearInterval(IntervalHandler)},3000);
    }
    componentDidMount(){
        let GameViewData = store.getState().GameView;
        if(GameViewData.Section){
            store.dispatch(LeaveGameView());
        }
        ReactDOM.unmountComponentAtNode(document.getElementById('music'));
    }
    render() {
        return (<div>
            <div className="WelcomeBG" ref={this.welcomeRef} style={{ backgroundImage: "url(\"file:///../../../res/Resources/Theme/UIResources/Framework/WelcomeBG.png\")" }} />
            <aside className="menu welcomemenu">
                <ul className="menu-list nav_ul">
                    <li>
                        <NavLink to='/chapters'><li>从头开始(现在是测试所以可以随意选章节)</li></NavLink>
                    </li>
                    <li>
                        <NavLink to='/savedata/load'><li>加载存档</li></NavLink>
                    </li>
                    <li>
                        <a>Flow-Chart</a>
                    </li>
                    <li>
                        <a>特典</a>
                    </li>
                    <li>
                        <NavLink to='/NewSettings'><li>設定</li></NavLink>
                    </li>
                    <li>
                        <a onClick={() => {
                            const options = {
                                type: "info",
                                message: "終了しますか？",
                                title: "終了確認",
                                buttons: ["はい", "キャンセル"],
                                cancelId:1
                            };
                            electron.remote.dialog.showMessageBox(null, options,
                                (response) => {
                                    if (response === 0) electron.remote.getCurrentWindow().close()
                                });
                        }}>退出游戏</a>
                    </li>
                </ul>
            </aside>
        </div>);
    }
}
export default WelcomeView;