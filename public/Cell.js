const cellSize = 20;

function Cell(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type

    this.show = function () {
        // noStroke();
        stroke(0);
        switch (this.type) {
            case 'empty':
                fill(255);
                break;
        }
        rect(this.x, this.y, cellSize, cellSize);
    }
}