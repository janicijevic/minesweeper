let tileW, tileH;
let fieldW = 16;
let fieldH = 16;
let field = [];
let mines = 40;
let alive = true;
let generated = false;
let xClicked = 0;
let yClicked = 0;
let opened = 0;
let flagged = 0;
let touched = false;
let framesWhenTouched = 0;

let colors = {
    1: [0, 0, 255],
    2: [0, 200, 0],
    3: [255, 0, 0],
    4: [128, 0, 128],
    5: [128, 0, 0],
    6: [30, 200, 200],
    7: [0, 0, 0],
    8: [128, 128, 128]
}

/*





8x8_10 

16x16_40 

16x30_99
*/

//Disable right click
document.addEventListener('contextmenu', event => event.preventDefault());


function setup(){
    createCanvas(400, 400);

    tileW = width/fieldW;
    tileH = height/fieldH;
    
    
    textSize(tileH*2/3);
    textFont("Georgia");

    
    //setup the field
    for(let i = 0; i < fieldW; i++){
        let t = [];
        for(let j = 0; j<fieldH; j++){
            t.push(new Tile(0));
        }
        field.push(t);
    }


}

function draw(){
    background(0);

    if(true){
        //Show field
        for(let i = 0; i < fieldW; i++){
            for(let j = 0; j<fieldH; j++){
                let n = field[i][j].num;
                fill(200);
                if(field[i][j].isRight ) fill(0, 255, 0);
                rect(i*tileW, j*tileH, tileW, tileH);
                if(n > 0) {
                    fill(colors[n][0], colors[n][1], colors[n][2]);
                    text(field[i][j].num, i*tileW+tileW/3, j*tileH+textSize());
                }
                else if(n == -1){
                    fill(0);
                    ellipse(i*tileW+tileW/2, j*tileH+tileH/2, tileW*2/3, tileH*2/3);
                }

                if(!field[i][j].isOpen){
                    fill(250);
                    if(field[i][j].isWrong) fill(255, 0, 0);
                    rect(i*tileW, j*tileH, tileW, tileH);
                    if(field[i][j].isFlagged){
                        fill(255, 0, 0);
                        text("F", i*tileW+tileW/3, j*tileH+textSize());
                    }
                }

            }
        }
    }
    if(opened >= fieldW*fieldH - mines){
        gameOver();
        fill(0);
        text("Win", 10, 50);
    }

}

function touchStarted(){
    touched = true;
    framesWhenTouched = frameCount;
}

function touchEnded(){
    if(alive){
        touched = false;
        if(mouseX<0 || mouseX>width || mouseY<0 || mouseY>height) return;
        x = floor(mouseX/tileW);
        y = floor(mouseY/tileH);
        if(frameCount - framesWhenTouched > 100){
            field[x][y].isFlagged = true;
        }
        else mouseReleased();
    }

}

function mousePressed(){
    framesWhenTouched = frameCount;
}

function mouseReleased(){
    if(alive){
        if(mouseX<0 || mouseX>width || mouseY<0 || mouseY>height) return;
        x = floor(mouseX/tileW);
        y = floor(mouseY/tileH);
        
        if(!generated){
            xClicked = x;
            yClicked = y;
            generateField();
            generated = true;
        }

        if(mouseButton == LEFT){
            if(frameCount - framesWhenTouched > 15){
                field[x][y].isFlagged = true;
                return;
            }

            open(x, y);
            if(field[x][y].num == -1){
                gameOver();
                return;
            }
        }
        else if(mouseButton == RIGHT){
            field[x][y].isFlagged ? flagged-- : flagged++;
            field[x][y].isFlagged = !field[x][y].isFlagged;
        }
    }   
}

function open(x, y){
    if(x<0 || y<0 || x>field.length-1 || y>field[0].length-1) return;
    if(field[x][y].isOpen) return;
    field[x][y].isOpen = true;
    opened++;
    if(field[x][y].num != 0) return;
    

    for(let dx = -1; dx<=1; dx++){
        for(let dy = -1; dy<=1; dy++){
            if(dx == 0 && dy==0) continue;
            open(x+dx, y+dy);
        }
    }
}

function gameOver(){
    noLoop();
    for(let i = 0; i<fieldW; i++){
        for(let j = 0; j<fieldH; j++){
            let t = field[i][j];
            if(t.num == -1){
                t.isOpen = true;
                if(t.isFlagged){
                    t.isRight = true;
                    continue;
                }
            }
            if(t.isFlagged){
                t.isWrong = true;
            }
        }
    }
}

function generateField(){

    let minesLeft = mines;

    while(minesLeft > 0){
        let rx = floor(random(fieldW));
        let ry = floor(random(fieldH));
        while(field[rx][ry].num == -1 || (rx <= xClicked+1 && rx >= xClicked-1 && ry <= yClicked+1 && ry >= yClicked-1)){
            rx = floor(random(fieldW));
            ry = floor(random(fieldH));
        }
        field[rx][ry].num = -1;
        minesLeft--;
    }
     
    //now were gonna expand the array
    let tmp = [];

    for(let i = 0; i<fieldW+2; i++){
        let t = [];
        for(let j = 0; j<fieldH+2; j++){
            t.push(new Tile(0));
        }
        tmp.push(t);
    }

    for(let i = 0; i<fieldW; i++){
        for(let j = 0; j<fieldH; j++){
            tmp[i+1][j+1].num = field[i][j].num;
        }
    }

    // Make numbers based on bombs
    for(let i = 1; i<fieldW+1; i++){
        for(let j = 1; j<fieldH+1; j++){
            if(tmp[i][j].num == -1) continue;
            for(let dx = -1; dx<=1; dx++){
                for(let dy = -1; dy <= 1; dy++){
                    if(dx == 0 && dy == 0) continue;
                    if(tmp[i+dx][j+dy].num == -1) tmp[i][j].num++;
                }
            }
        }
    }
    for(let i = 0; i<fieldW; i++){
        for(let j = 0; j<fieldH; j++){
            field[i][j].num = tmp[i+1][j+1].num;
        }
    }
    //for debug
    // tileW = tileH = 50;
    // for(let i = 0; i < fieldW+2; i++){
    //     for(let j = 0; j<fieldH+2; j++){
    //         fill(200);
    //         fill(tmp[i][j].num*255/9+100);
    //         if(tmp[i][j].num == -1) fill(255);
    //         rect(i*tileW, j*tileH, tileW, tileH);
    //         fill(tmp[i][j].num*255/9);
    //         text(tmp[i][j].num, i*tileW+tileW/3, j*tileH+textSize()*3/2);
    //         if(!tmp[i][j].isOpen){
    //             fill(250);
    //             rect(i*tileW, j*tileH, tileW, tileH);
    //         }

    //     }
    // }

}



class Tile{
    constructor(num){
        this.num = num;
        this.isOpen = false;
        this.isFlagged = false;
        this.isRight = false;
        this.isWrong = false;
    }

}

