const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview')
let image;
let photoName;

// clique no elemento e abrir o arquivo - button e input
document.getElementById('select-image')
.onclick = function() {
    photoFile.click()
}

//evento de mudança - novo arquivo
window.addEventListener('DOMContentLoaded', () =>{
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0)
        photoName = file.name;

        // novo arquivo
        let reader = new FileReader()//ler arquivo
        reader.readAsDataURL(file)
        reader.onload = function(event) {
            image = new Image();
            image.src = event.target.result//alvo do evento
            image.onload = onLoadImage
        }
    })
})

// Ferramenta de corte
const selection = document.getElementById('selection-tool')

let startX, startY, relativeStartX, relativeStartY,
endX, endY, relativeEndX, relativeEndY;
let startSelection = false;

const events = {
    mouseover(){
       this.style.cursor = 'crosshair'
    },
    //eixo relativo e abs.
    //console.table p/ verificar
    mousedown(){
        const {clientX, clientY, offsetX, offsetY} = event

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true

    },
    mousemove(){
        endX = event.clientX
        endY = event.clientY

        if(startSelection) {
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';

            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }

    },
    //soltar a flag e registrar pos. final
    mouseup(){
        startSelection = false;

        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        // botão de corte
        cropButton.style.display = 'initial'
    }
}

//pega chave - valor dos eventos
Object.keys(events)
.forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName])
})


// Canvas
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

//desestruturação
function onLoadImage() {
    const { width, height } = image
    canvas.width = width;
    canvas.height = height;

    // limpar o contexto
    ctx.clearRect(0, 0, width, height)

    // desenhar a imagem
    ctx.drawImage(image, 0, 0)

    photoPreview.src = canvas.toDataURL()
    //transforma dados em url
}

// Cortar imagem
const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
    const { width: imgW, height: imgH } = image
    const { width: previewW, height: previewH } = photoPreview

    const [ widthFactor, heightFactor ] = [ 
        +(imgW / previewW), 
        +(imgH / previewH)
    ]

    const [ selectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight ] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +( relativeStartX * widthFactor ),
        +( relativeStartY * heightFactor )
    ]

    // catar a imagem cortada
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    // limpar o ctx
    ctx.clearRect(0,0,ctx.width,ctx.height)

    // ajustar prorps.
    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    // adicionar a imagem cortada ao ctx
    ctx.putImageData(croppedImage, 0, 0)

    // esconder a ferramenta de seleção
    selection.style.display = 'none'

    //atualizar view
    photoPreview.src = canvas.toDataURL()

    // botão download
    downloadButton.style.display = 'initial'
}

// Download do trem
const downloadButton = document.getElementById('download')
downloadButton.onclick = function() {
    const a = document.createElement('a')
    a.download = photoName + '-cropped.png';
    a.href = canvas.toDataURL();
    a.click()
}