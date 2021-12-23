const playerRandomCoord = (ballX, ballY, ballR, canW, canH) => { //canvas width canvas height
    let width = canW - (2 * ballR) - 40;
    let height = canH - (2 * ballR) - 70; // extra 30 pixels to account for the line
    let x = Math.floor(Math.random() * width) + ballR + 20;
    let y = Math.floor(Math.random() * height) + ballR + 50; // add the 30 back in with 20 border
    if (Math.abs(ballX - x) < 2 * ballR && Math.abs(ballY - y) < 2 * ballR) {
        let newCoord = playerRandomCoord(ballX, ballY, ballR, canW, canH);
        x = newCoord.x;
        y = newCoord.y;
    }
    return {x: x, y: y};
}

const ballRandomCoord = (ballX, ballY, ballR, canW, canH, players) => {
    console.log("calculating random coordinate for ball");
    let width = canW - (2 * ballR) - 40;
    let height = canH - (2 * ballR) - 40;
    let x = Math.floor(Math.random() * width) + ballR + 20;
    let y = Math.floor(Math.random() * height) + ballR + 20;
    let valid = true;
    players.forEach(player => {
        valid = valid && (Math.abs(ballX - player.x) < 2 * ballR && Math.abs(ballY - player.y) < 2 * ballR)
    })
    if (!valid)  {
        let newCoord = playerRandomCoord(ballX, ballY, ballR, canW, canH, players);
        x = newCoord.x;
        y = newCoord.y;
    }
    return {x: x, y: y};
}

export default {playerRandomCoord, ballRandomCoord};