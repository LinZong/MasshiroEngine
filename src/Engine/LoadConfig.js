//加载配置文件，初始化全局环境变量
const { LoadAllChapters } = require('./LoadChapter');
const { IMAGE_SETTING,
    TEXT_SETTING,
    SOUND_SETTING,
    CONTROLLER_SETTING,
    INGAME_SETTING, } = require('./actionTypes/SettingType');
const {ExtendJson} = require('./Util');
const Q  = require('q');
function LoadGlobalConfig() {
    try {
        let FileStream = require('fs');
        let Path = require('path');
        let Environment = JSON.parse(FileStream.readFileSync('./res/config/GlobalConfig.json'));
        Environment.AppPath = __dirname;
        Environment.Resolution["X"] = Environment.Resolution[0];
        Environment.Resolution["Y"] = Environment.Resolution[1];
        Environment.ChapterDir = './' + Path.join(Environment.Path.Root, Environment.Path.Resources.Chapter);
        Environment.CharacterDir = './' + Path.join(Environment.Path.Root, Environment.Path.Resources.Character);
        Environment.ThemeDir = './' + Path.join(Environment.Path.Root, Environment.Path.Resources.Theme);


        Environment.SaveDataDir = './' + Path.join(Environment.Path.Root, Environment.Path.Savedata);

        Environment.Config = {};
        Environment.Config.ImageConfigPathDesc = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Image.Elements);
        Environment.Config.ImageConfigPathDef = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Image.Default);
        Environment.Config.ImageConfigPathUser = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Image.User);
        

        Environment.Config.TextConfigPathDesc = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Text.Elements);
        Environment.Config.TextConfigPathDef = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Text.Default);
        Environment.Config.TextConfigPathUser = './' + Path.join(Environment.Path.Config.Root, Environment.Path.Config.Resources.Text.User);


        //占坑，以后肯定是要加载全局UI 资源的(Default or usersettings)
        Environment.UI = { LoadingImage: './' + Path.join(Environment.ThemeDir, 'UIResources\\Framework\\FakeLoading.jpg') };
        global.Environment = Environment;
        global.MyEngine = {};
        global.MyEngine.StatusMachine = {};
        global.MyEngine.StatusMachine.AllChapter = LoadAllChapters(Environment.ChapterDir);//测试加载所有章节.
    } catch (error) {
        throw error;
    }
}
function PathResolver(SettingType){
    var TargetPath = {};
    var ConfigPathNode = window.electron.remote.getGlobal('Environment').Config;
    switch (SettingType) {
        case IMAGE_SETTING: {
            TargetPath.Desc = ConfigPathNode.ImageConfigPathDesc;
            TargetPath.Default = ConfigPathNode.ImageConfigPathDef;
            TargetPath.User = ConfigPathNode.ImageConfigPathUser;
            break;
        }
        case TEXT_SETTING: {
            TargetPath.Desc = ConfigPathNode.TextConfigPathDesc;
            TargetPath.Default = ConfigPathNode.TextConfigPathDef;
            TargetPath.User = ConfigPathNode.TextConfigPathUser;
            break;
        }
        case SOUND_SETTING: {
            TargetPath = ConfigPathNode.ImageConfigPath;
            break;
        }
        case CONTROLLER_SETTING: {
            TargetPath = ConfigPathNode.ImageConfigPath;
            break;
        }
        case INGAME_SETTING: {
            TargetPath = ConfigPathNode.ImageConfigPath;
            break;
        }
        default: TargetPath = {};
    }
    return TargetPath;
}
function LoadUserConfig(SettingType) {
    let fs = window.electron.remote.require('fs');
    let TargetPath = PathResolver(SettingType);

    let DescHandle = fs.readFileSync(TargetPath.Desc);
    let DefHandle = fs.readFileSync(TargetPath.Default);
    let UserHandle = fs.readFileSync(TargetPath.User);

    let DescJson = JSON.parse(DescHandle);
    let DefJson = JSON.parse(DefHandle);
    let UserJson = JSON.parse(UserHandle);

	return {Desc:DescJson,Settings:ExtendJson(DefJson,UserJson)};
}

function SaveUserConfig(SettingType,ConfigObj){
    var deferrer = Q.defer();
    let fs = window.electron.remote.require('fs');
    let TargetPath = PathResolver(SettingType);
    fs.writeFile(TargetPath.User,JSON.stringify(ConfigObj),(err)=>{
        if(err) {console.log(err);deferrer.reject('保存配置失败!');}
        else deferrer.resolve('保存配置成功!');
    });
    return deferrer.promise;
}
module.exports = { LoadGlobalConfig, LoadUserConfig,SaveUserConfig };