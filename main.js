const { app, BrowserWindow, Menu, dialog, ipcMain, shell} = require('electron');
const fs = require('fs');
const path = require('path');


//main window
var mainWindow = null;
async function createWindow(){
    mainWindow = new BrowserWindow({
        widht:800,
        height:600,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    await mainWindow.loadFile('src/pages/editor/index.html');//await espera carregar

    //mainWindow.webContents.openDevTools();

    createNewFile();

    ipcMain.on('update-content', function(event, data){
        file.content = data;
    });
}

//ARQUIVO
var file = {};

//CRIAR NOVO ARQUIVO
function createNewFile(){
    file = {
        name: 'novo-arquivo.txt',
        content: '',
        saved: false,
        path: app.getPath('documents')+'/novo-arquivo.txt'
    }

    mainWindow.webContents.send('set-file', file);
}

//SALVA ARQUIVO NO DISCO    
function writeFile(filePath)
{
    try{
    fs.writeFile(filePath,file.content, function(error)
    {
        //ERRO
        if(error) throw error;

        //ARQUIVO FOI SALVO
        file.path = filePath;
        file.saved = true;
        file.name = path.basename(filePath);
    })
    }catch(e)
    {
        console.log(e);
    }
}

async function saveFileAs(){
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    });

    if(dialogFile.canceled)
    {
        return false;
    }

    writeFile(dialogFile.filePath);
}

function saveFile(){
    if(file.saved)
    {
        return writeFile(file.path);
    }

    return saveFileAs();
}

function readFile(filePath){
    try{
        return fs.readFileSync(filePath,'utf8');
    }catch(e){
        console.log(e);
        return '';
    }
}

async function openFile(){
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });

    if(dialogFile.canceled) return false;

    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file);
}

//TEMPLATE MENU
const templateMenu = [
    {
        label:'Arquivo',
        submenu: [
            {
                label:'Novo',
                accelerator: 'CmdOrCtrl+N',
                click(){
                    createNewFile();
                }
            },
            {
                label:'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click(){
                    openFile();
                }
            },
            {
                label:'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click(){
                    saveFile();
                }
            },
            {
                label:'Salvar como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click(){
                    saveFileAs();
                }
            },
            {
                label:'Fechar',
                accelerator: 'CmdOrCtrl+Q',
                role:(process.platform === 'darwin' ? 'close' : 'quit')
            }        
        ]
    },
    {
        label:'Editar',
        submenu: [
            {
                label:'Desfazer',
                role: 'undo'
            },
            {
                label:'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label:'Copiar',
                role: 'copy'
            },
            {
                label:'Cortar',
                role: 'cut'
            },
            {
                label:'Colar',
                role: 'paste'
            }
        ]
    },
    {
        label:'Ajuda',
        submenu:[
            {
                label:'Editor',
                click(){
                    shell.openExternal('https://www.youtube.com')
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

//ON READY
app.whenReady().then(createWindow);

//ACTIVATE
app.on('activate', ()=>{
    if(BrowserWindow.getAllWindows().lenght === 0){
        createWindow();
    }
});

