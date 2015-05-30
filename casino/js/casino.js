// var text = x.textContent || x.innerText
function getAndSimulate() {
    var upde = document.getElementById('usrPerDay');
    var ice = document.getElementById('initCoins');
    var te = document.getElementById('trials');
    var rde = document.getElementById('resDays');
    var pse = document.getElementById('pSued');

    var usrPerDay = parseInt(upde.value);
    var initCoins = parseInt(ice.value);
    var trials = parseInt(te.value);

    var result = simulate(usrPerDay, initCoins, trials);

    rde.innerText = result.daysSued.toString() + "/" + trials;
    rde.textContent = result.daysSued.toString() + "/" + trials;
    pse.innerText = result.probSued.toString();
    pse.textContent = result.probSued.toString();
}

function simulate(usrPerDay, initCoins, trials) {
    var daysSued = 0;
    var probSued;
    var coinsInSlot;
    var trial;
    var player;
    var winnings;
    var suedToday;

    for(trial = 0; trial < trials; trial++) {
        // Begining of trial (start of day)

        coinsInSlot = initCoins;
        suedToday = false;

        for(player = 0; player < usrPerDay; player++) {
            // Beginning of a game
            coinsInSlot += 1; // User inserts a coin;
            if(Math.random() < 0.5) { // If first reel is an arrow
                winnings = 1;
                // While last reel is an arrow AND winnings don't exceed available winnings
                // No need to keep computing this game and day if a sue is already guaranteed
                while(Math.random() < 0.5 && winnings <= coinsInSlot) { 
                    winnings *= 2;
                }
                coinsInSlot -= winnings;
                suedToday = coinsInSlot < 0;
                if(suedToday) {
                    // No need to let the remaining players play for today
                    break;
                }
            }
            // End of a game
        }

        if(suedToday) {
            daysSued += 1;
        }

        // End of trial (close of day)
    }

    return {
        'daysSued': daysSued,
        'probSued': daysSued/trials
    }
}