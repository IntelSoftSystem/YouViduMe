
const {autoUpdater} = require('electron-updater');
const { dialog, app } = require('electron')
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

const { BrowserWindow, ipcMain} = require('electron')
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = "info";
autoUpdater.autoDownload = false;

exports.check = () => {
    console.log('Checking for updates');
    
    
    //autoUpdater.allowDowngrade = false;
    autoUpdater.setFeedURL({
        provider: "github",
        owner: "IntelSoftSystem",
        repo: "YouViduMe",
        token: "f777f066a8c6fd40f4f72303ca2cf974382b0e6c"
    })
    autoUpdater.checkForUpdates();
   autoUpdater.on('update-available', () => {
       //prompt to ask user for updates 
      let downloadProgress = 0;
      const options = dialog.showMessageBox( null, {
        type: 'info',
        question: 'info',
        buttons: ['Update', 'No'],
        defaultId: 0,
        title: 'Update Available',
        message: 'update for a new version of YouViduMe is available ,Do you want to update now?'
      },(buttonIndex) =>{
          if (buttonIndex !== 0) return
          autoUpdater.downloadUpdate();
          const basePath = isDev ? __dirname : app.getAppPath();

          let progressWin = new BrowserWindow({
              width: 350,
              height: 35,
              useContentSize: true,
              autoHideMenuBar: true,
              maximizable: false,
              fullscreen: false,
              fullscreenable: false,
              resizable: false
          })
          progressWin.loadURL(url.format({
            pathname: path.resolve(basePath, './progress.html'),
            protocol: 'file:',
            slashes: true
        }));
          progressWin.on('closed', () => {
              progressWin = null
          })
          ipcMain.on('download-progress-request', (e) => {
              e.returnValue = downloadProgress
          })
          autoUpdater.on('download-progress', (d) => {
              downloadProgress = d.percent
              autoUpdater.logger.info(downloadProgress)

          })
          autoUpdater.on('update-downloaded', () => {
              // if progressWin is 0 will close it 
              if(progressWin) progressWin.close();
              // prompt to ask user to quit app and install updates 
              dialog.showMessageBox( null, {
                type: 'info',
                question: 'info',
                buttons: ['Yes', 'Later'],
                defaultId: 0,
                title: 'Update Available',
                message: 'update for a new version of YouViduMe is Ready ,Do you want to install now?'
              } , (buttonIndex) => {
                  if ( buttonIndex === 0 ) autoUpdater.quitAndInstall();
              })


          })

      })
      console.log(options)

   })
}