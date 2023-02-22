const { ipcRenderer } = require('electron');

//ELEMENTOS
const textArea = document.getElementById('text');
const title = document.getElementById('title');

//SET FILE
ipcRenderer.on('set-file', function(event, data){
    textArea.value = data.content;
    title.innerHTML = data.name+' | EDITOR ELECTRON';
});

function handleChangeText(){
    ipcRenderer.send('update-content', textArea.value);
}