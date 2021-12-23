class Player {
  constructor(x, y, score, id) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    let newx;
    let newy;
    if (dir == 'dx') {
      newx = this.x + speed;
      if (newx > 10 && newx < 690) { // canvas width plus or minus radius 10
        this.x = newx;
      } // see game.mjs for width of canvas
    } else if (dir == 'dy') {
      newy = this.y + speed;
      if (newy < 490 && newy > 40) {  // canvas height and line height plus or minus radius 10
        this.y = newy;
      }
    }
  }

  collision() {
    this.score += 1;
  }

  calculateRank(arr) {
    // arr.sort((a, b) => (a.score > b.score) ? -1 : 1);
    // for (let i = 0; i < arr.length; i++) {
    //   if (arr[i].id == this.id) {
    //     return `Rank: ${i}/${arr.length}`;
    //   }
    // }
    let rank = 1;
    arr.forEach(player => {
      if (player.score > this.score) {
        rank += 1;
      }
    })
    return `Rank: ${rank}/${arr.length}`;
  }
}

export default Player;
