
const {autoUpdater} = require('electron-updater');
const { dialog } = require('electron')


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
        repo: "ElectronApp",
        token: "00f169c1f564b73d07a111fa849d4916207411272"
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
          progressWin.loadURL('file://${__dirname}/prgress.html')
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
