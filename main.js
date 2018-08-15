// Modules to control application life and create native browser window
const { app, BrowserWindow,ipcMain } = require('electron')
const path = require('path')
var fs = require('fs');
require('./src/Engine/LoadConfig').LoadGlobalConfig();

// ipcMain.on('PersistSaveData',(event,arg)=>{
// 	fs.writeFile('savedata.bin',arg,()=>console.log('OK'));
// });

let mainWindow

function createWindow() {
	//加载窗口预设启动游戏
	let Options = {
		width: 1280, height: 720, autoHideMenuBar: true, webPreferences: {
			javascript: true,
			plugins: true,
			nodeIntegration: false,
			webSecurity: false,
			preload: path.join(__dirname, './public/renderer.js')
		},
		fullscreen:global.SettingsNode['IMAGE_SETTING']['SettingElement']['LeftCol'][0].Value,
		alwaysOnTop:global.SettingsNode['IMAGE_SETTING']['SettingElement']['LeftCol'][3].Value,
		resizable: true,
		minWidth:1280,
		minHeight:720,
		show: false
	};
	if (global.Environment !== null || global.Environment !== undefined) {
		Options.width = global.Environment.Resolution['X'];
		Options.height = global.Environment.Resolution['Y'];
	}
	require('./src/Engine/StatusMachine');//加载全部章节
	BrowserWindow.addDevToolsExtension('./DevExtensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.3_0/');
	mainWindow = new BrowserWindow(Options);
	mainWindow.loadURL('http://localhost:3000');
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	})

	// mainWindow.on('resize',function(event){
	// 	let sizearr = mainWindow.getSize();
	// 	let newWidth = sizearr[0];
	// 	let ratio = global.SettingsNode['IMAGE_SETTING']['SettingElement']['LeftCol'][1].Value;
	// 	console.log(newWidth);
	// 	switch (ratio){
	// 		case '4of3':{
	// 			mainWindow.setSize(newWidth,parseInt(newWidth*(3/4)));
	// 			break;
	// 		}
	// 		case '16of9':{
				
	// 			mainWindow.setSize(newWidth,parseInt(newWidth*(9/16)));
	// 			break;
	// 		}
	// 	}
	// })
	mainWindow.on('closed', function () {
		mainWindow = null
	})
	const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

	installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
		console.log(`Added Extension:  ${name}`);
	})
	.catch((err) => {
		console.log('An error occurred: ', err);
	});
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})
