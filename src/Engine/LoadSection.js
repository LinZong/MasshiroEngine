const { NEXT_NODE, PREV_NODE, SET_NODE_INDEX } = require('./Events');
const { GetRemoteUrlPath, GetCharacterAlias } = require('../Engine/Util');
let TextNodeIndexer = null;
function FindPrevPlainText(Section, EndIndexer) {
    while (EndIndexer >= 0 && Section.TextNodes[EndIndexer--].hasOwnProperty('PlainText'));
    return EndIndexer + 1;
}
function MakeRollBackProperty(NowPlayingSection, EndIndexer) {
    let LastNewIndex = FindPrevPlainText(NowPlayingSection, EndIndexer);
    let RollbackPlainText = new Array();
    for (var i = LastNewIndex; i <= TextNodeIndexer; ++i) {
        RollbackPlainText.push(NowPlayingSection.TextNodes[i].PlainText);
    }
    return RollbackPlainText;
}
var MiddleWare = [CustomFunctionAdapter, GameViewElementRender, TextBoxRender, PlainTextRender, SelectionRender, SoundRender, ParseStatusFlag];
//This callback should match the MiddleWareList correctly.

function TextNodeInterpreter(NowPlayingSection, ev, MiddleWareCallback) {
    switch (ev.type) {
        case NEXT_NODE: {
            TextNodeIndexer++;
            break;
        }
        case PREV_NODE: {
            TextNodeIndexer--;
            break;
        }
        case SET_NODE_INDEX: {
            TextNodeIndexer = ev.SetIndex;
            break;
        }
    }
    if (NowPlayingSection === null) return;
    let StatusFlag = null;/*
    正常状态下StatusFlag为null,到达Section结尾的时候会为1，到达Section开头会设为2
     */
    if (TextNodeIndexer < 0) {
        console.log('reach the begin of this section.');
        TextNodeIndexer = 0;
        StatusFlag = 2;
    }
    else if (TextNodeIndexer >= NowPlayingSection.TextNodes.length - 1) {
        console.log('reach the end of this section.');
        TextNodeIndexer = NowPlayingSection.TextNodes.length - 1;
        StatusFlag = 1;
    }
    if (0 <= TextNodeIndexer && TextNodeIndexer < NowPlayingSection.TextNodes.length) {
        let CurrNode = Object.assign({}, NowPlayingSection.TextNodes[TextNodeIndexer]);
        CurrNode.ForceRollback = false;
        if (ev.type === PREV_NODE) {
            if (NowPlayingSection.TextNodes[TextNodeIndexer]['PlainText']) {
                CurrNode.PlainText = MakeRollBackProperty(NowPlayingSection, TextNodeIndexer);
            }
            if (NowPlayingSection.TextNodes[TextNodeIndexer + 1]['ChangeElement']) {
                CurrNode.ForceRollback = true;
                CurrNode.ChangeElement = Object.assign({}, NowPlayingSection.TextNodes[TextNodeIndexer + 1]['ChangeElement']);
            }
        }
        // CustomFunctionAdapter(CurrNode,MiddleWareCallback[0],StatusFlag);
        // TextBoxRender(CurrNode,MiddleWareCallback[1],StatusFlag);
        MiddleWare.map((item, idx) => ({ Func: item, Callback: MiddleWareCallback[idx] })).forEach(element => {
            element.Func(CurrNode, element.Callback, { Header: NowPlayingSection.Header, Index: TextNodeIndexer, Flag: StatusFlag, ActionType: ev.type });
        });
        return;
    }
}


function CustomFunctionAdapter(TextNodeObj, callback, StatusObj) {
    if (TextNodeObj.ExecuteFunction) {
        let FuncArray = TextNodeObj.ExecuteFunction;
        FuncArray.forEach(element => {
            // let Func = global.CustomScripts[element.Name];
            // setTimeout(() => Func(...element.Parameter), element.ExecuteTime);
            console.log('Should execute function : ', element.Name);
        });
    }
}

function TextBoxRender(TextNodeObj, callback, StatusObj) {
    if (TextNodeObj.TextProperty) {
        let TextContentForApply = { TextContent: TextNodeObj.TextProperty };
        if (typeof callback === 'function') {
            callback(TextContentForApply);
        }
    }
}
function PlainTextRender(TextNodeObj, callback, StatusObj) {
    if (TextNodeObj.PlainText) {
        let TextContentForApply = {
            TextContent: TextNodeObj.PlainText,
            Rollback: StatusObj.ActionType === PREV_NODE ? true : false
        };
        if (typeof callback === 'function') {
            callback(TextContentForApply);
        }
    }
}
function SelectionRender(TextNodeObj, callback, StatusObj) {
    if (typeof callback === 'function') {
        if (TextNodeObj.Selection) {
            callback(TextNodeObj.Selection);
        }
        else callback(null);
    }
}

function SoundRender(TextNodeObj, callback, StatusObj) {
    //现在还没有更换背景音的功能.
    if (typeof callback === 'function') {
        if (TextNodeObj.TextProperty && TextNodeObj.TextProperty.Voice) {
            let name = GetCharacterAlias(TextNodeObj.TextProperty.CharacterName);
            let file = GetRemoteUrlPath(StatusObj.Header.VoicePath + '/' + name + '/' + TextNodeObj.TextProperty.Voice, true);
            let Voice = { Name: name, File: file };
            callback(Voice);
        }
        else callback();
    }
}


function GameViewElementRender(TextNodeObj, callback, StatusObj) {
    //现在还没有更换背景音的功能.
    if (typeof callback === 'function') {
        if (TextNodeObj.ChangeElement&&StatusObj.ActionType===PREV_NODE&&!TextNodeObj.ForceRollback) {
            return ;
        }
        else if(TextNodeObj.ChangeElement||(StatusObj.ActionType===PREV_NODE&&TextNodeObj.ForceRollback)){
            callback(TextNodeObj.ChangeElement, TextNodeObj.ForceRollback, false);
        }
    }
}


function ParseStatusFlag(TextNodeObj, callback, StatusObj) {
    if (typeof callback === 'function') {
        callback(StatusObj);
    }
}


function LoadSectionRes(ChapterNode, Indexer) {
    let fs = global ? require('fs') : window.electron.remote.require('fs');
    let SectionJsonPath = ChapterNode.Branch.Sections[Indexer];
    try {
        let res = JSON.parse(fs.readFileSync(SectionJsonPath));
        res.LoadingImage = ChapterNode.Branch.LoadingImage;
        return res;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function BacklogGenerator(NowPlayingSection){
    let BacklogArr = [];
    for(let i=0;i<=TextNodeIndexer;++i){
        if(NowPlayingSection.TextNodes[i]['TextProperty']){
            BacklogArr.push(NowPlayingSection.TextNodes[i]['TextProperty'].CharacterName+"  :  "+NowPlayingSection.TextNodes[i]['TextProperty'].Text);
        }
        if(NowPlayingSection.TextNodes[i]['PlainText']){
            BacklogArr.push(NowPlayingSection.TextNodes[i]['PlainText']);
        }
    }
    return BacklogArr;
}

// function CustomFunctionAdapter(ExecuteFunctionArray) {
//     ExecuteFunctionArray.forEach(element => {
//         let Func = global.CustomScripts[element.Name];
//         setTimeout(() => Func(...element.Parameter), element.ExecuteTime);
//     });
// }
// function LoadCustomScripts(ScriptsPath) {
//     global.CustomScripts = require(ScriptsPath);
// }
module.exports = { TextNodeInterpreter, LoadSectionRes, BacklogGenerator,MiddleWare };
//渲染主进程同时维护着一个状态机，当LoadChapterRes发出事件的时候状态机定位到当前游玩的节点
//节点没有在存档树上的时候就append节点，SectionResolver发出进入Section的时候
//状态机根据当前的Chapter(Branch) Section状态修改状态树