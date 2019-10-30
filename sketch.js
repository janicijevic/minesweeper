let tileW, tileH;
let framesWhenTouched = 0;
let isTouch =  true;
let bottom = 60;
let fieldW, fieldH, field, mines, alive, generated, xClicked, yClicked, opened, flagged, elapsedTime, timeStarted, sizeChosen, won, boxW, boxH;

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

function reset(){
    field = [];
    alive = true;
    generated = false;
    xClicked = 0;
    yClicked = 0;
    opened = 0;
    flagged = 0;
    elapsedTime = 0;
    timeStarted = 0
    sizeChosen = false;
    won = false;
}

function setup(){
    createCanvas(400, 400+bottom);
    boxW = width/16;
    boxH = (height-bottom)/16;
    textSize(boxH*2/3);
    textFont("Georgia");
    reset()

}

function draw(){
    background(0);

    if(!sizeChosen){
        fill(160, 255, 158);
        rect(0, 0, width, height/3);
        fill(0);
        text("8x8, 10 bombs", width/2 - 3*textSize(), height/6-textSize()/2);

        fill(255, 245, 158);
        rect(0, height/3, width, height/3);
        fill(0);
        text("16x16, 40 bombs", width/2 - 3.5*textSize(), height*2/3-height/6-textSize()/2);
        fill(255, 179, 179);
        rect(0, height*2/3, width, height/3);
        fill(0);
        text("20x20, 99 bombs", width/2 - 3.5*textSize(), height-height/6-textSize()/2);

        noFill();
        stroke(0);
        rect(0, 0, width-1, height-1);
        return;
    }
    

    //Show field
    for(let i = 0; i < fieldW; i++){
        for(let j = 0; j<fieldH; j++){
            let n = field[i][j].num;
            //Back
            fill(200);
            if(field[i][j].isRight ) fill(0, 255, 0);
            rect(i*tileW, j*tileH, tileW, tileH);
            
            if(n > 0) {
                //Number
                fill(colors[n][0], colors[n][1], colors[n][2]);
                text(field[i][j].num, i*tileW+tileW/3, j*tileH+tileH*2/3);
            }
            else if(n == -1){
                //Bomb
                fill(0);
                ellipse(i*tileW+tileW/2, j*tileH+tileH/2, tileW*2/3, tileH*2/3);
            }

            //Cover
            if(!field[i][j].isOpen){
                fill(250);
                if(field[i][j].isWrong) fill(255, 0, 0);
                rect(i*tileW, j*tileH, tileW, tileH);
                if(field[i][j].isFlagged){
                    // fill(255, 0, 0);
                    // text("F", i*tileW+tileW/3, j*tileH+tileH*2/3);
                    drawFlag(i*tileW, j*tileH, tileW, tileH);
                }
            }

        }
    }
    if(flagged == mines){
        won = true;
        for(let i = 0; i<fieldW; i++){
            for(let j = 0; j<fieldH; j++){
                if(field[i][j].isFlagged){
                    if(field[i][j].num != -1) won = false;
                }
            }
        }
    }
    if(opened >= fieldW*fieldH - mines || won){
        gameOver();
        fill(0);
        text("Win", 10, 50);
    }

    if(alive){
        elapsedTime = round(((new Date()).getTime() - timeStarted)/1000);
    }
    if(timeStarted == 0) elapsedTime = 0;
    //Draw bottom
    fill(250);
    strokeWeight(2);
    rect(0, height-bottom, width, bottom);
    strokeWeight(1);

    rect(boxW, boxH+height-bottom, boxW*2, boxH);
    fill(0);
    text(mines-flagged, boxW+textSize(), boxH+height-bottom+textSize());
    fill(250);
    rect(width-boxW*3, boxH+height-bottom, boxW*2, boxH);
    fill(0);
    text(elapsedTime, width-boxW*3+textSize(), boxH+height-bottom+textSize());
    if(!alive){
        fill(250);
        rect(width/2-boxW, boxH+height-bottom, boxW*2, boxH);
        fill(0);
        text("Reset", width/2-boxW*3/2+textSize(), boxH+height-bottom+textSize());
    }
    noFill();
    stroke(0);
    rect(0, 0, width-1, height-1);
}

function drawFlag(x, y, w, h){
    fill(74, 74, 74);
    noStroke();
    rect(x+w/10, y+h*9/10, w-w*2/10, h/10);
    rect(x+w/2-w/10, y, w/10, h);
    fill(184, 0, 0);
    triangle(x+w/2, y, x+w, y+h/4, x+w/2, y+h/2);

    stroke(0);
}

function mousePressed(){
        framesWhenTouched = frameCount;
}

function mouseReleased(){
    if(!sizeChosen){
        if(mouseY<height/3){
            fieldW = 8;
            fieldH = 8;
            mines = 10;
        }
        else if(mouseY<height*2/3){
            fieldW = 16;
            fieldH = 16;
            mines = 40;
        }
        else if(mouseY<height){
            fieldW = 20;
            fieldH = 20;
            mines = 99;
        }
        sizeChosen = true;
        tileW = width/fieldW;
        tileH = (height-bottom)/fieldH;
        
        
        //setup the field
        for(let i = 0; i < fieldW; i++){
            let t = [];
            for(let j = 0; j<fieldH; j++){
                t.push(new Tile(0));
            }
            field.push(t);
        }
    
    }
    else{
        if(alive){
            if(mouseX<0 || mouseX>width || mouseY<0 || mouseY>height-bottom) return;
            x = floor(mouseX/tileW);
            y = floor(mouseY/tileH);
            
            if(!generated){
                xClicked = x;
                yClicked = y;
                generateField();
                generated = true;
                timeStarted = (new Date()).getTime();
            }
            if(mouseButton == LEFT){
                //Left
                if(isTouch){
                    if(frameCount - framesWhenTouched > 15){
                        field[x][y].isFlagged ? flagged-- : flagged++;
                        field[x][y].isFlagged = !field[x][y].isFlagged;
                        return;
                    }
                }
                if(!field[x][y].isFlagged){
                    open(x, y);
                    if(field[x][y].num == -1){
                        gameOver();
                        return;
                    }
                }
            }
            else if(mouseButton == RIGHT){
                //Right
                field[x][y].isFlagged ? flagged-- : flagged++;
                field[x][y].isFlagged = !field[x][y].isFlagged;
            }
            else if(mouseButton == CENTER && field[x][y].isOpen){
                let count = 0;
                for(let i = -1; i<=1; i++){
                    for(let j = -1; j<=1; j++){
                        if(x+i < 0 || x+i >= fieldW || y+j < 0 || y+j >= fieldH) continue;
                        if(field[x+i][y+j].isFlagged) count++;
                    }
                }
                console.log(field[x][y].num);
                if(count == field[x][y].num){
                    for(let i = -1; i<=1; i++){
                        for(let j = -1; j<=1; j++){
                            openAround(x+i, y+j);
                        }
                    }
                }
            }
        }   
        else{
            if(mouseX > width/2-boxW && mouseY > boxH+height-bottom && mouseX < width/2-boxW+boxW*2 && mouseY < boxH+height-bottom+boxH){
                reset();
            }
        }
    }
}
function openAround(x,y){
    if(x<0 || y<0 || x>field.length-1 || y>field[0].length-1) return;
    if(field[x][y].isOpen) return;
    if(!field[x][y].isFlagged){
        field[x][y].isOpen = true;
        opened++;
        if(field[x][y].num == -1) {
            console.log('bruh')
            gameOver();
             for(let dx = -1; dx<=1; dx++){
                 for(let dy = -1; dy<=1; dy++){
                     if(dx == 0 && dy==0) continue;
                     open(x+dx, y+dy);
                 }
             }
        }
    }
}

function open(x, y){
    if(x<0 || y<0 || x>field.length-1 || y>field[0].length-1) return;
    if(field[x][y].isOpen) return;
    if(!field[x][y].isFlagged){
        field[x][y].isOpen = true;
        opened++;
    }
    if(field[x][y].num != 0) return;
    
    for(let dx = -1; dx<=1; dx++){
        for(let dy = -1; dy<=1; dy++){
            if(dx == 0 && dy==0) continue;
            open(x+dx, y+dy);
        }
    }
}

function gameOver(){
    alive = false;
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
     
    //Expanding the array by one because of edge cases
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
