const towerCosts = {archer: [10, 25, 50, 100], thrower: [5, 10, 20, 50], soldier: [10, 20, 80, 160]};
let enemies = [];
let towers = [];
function wait (millis) {
    let timestamp = game.time;
    while (true) if (game.time - timestamp >= millis / 1000) break;
} 
function moneyReward (t) {
    switch (t.type) {
        case 'skeleton': return 15;
        case 'headhunter': return 10;
        case 'scout': return 3;
        case 'shaman': return 2;
        case 'ogre': return 5 + (t.maxHealth === 250 ? 2.5 : 0);
    }
    return 1;
}
function rewardPlayer (event) {
    let t = event.target;
    game.money += moneyReward(t);
    enemies.splice(enemies.indexOf(t), 1);
    t.destroy();
}
function moneyHandler (cost) {
    let bool = game.money >= cost;
    game.money -= cost * bool;
    return bool;
}
function isOnTrack (pos) {
    return square(pos, 23, 32, 28, 52) || square(pos, 23, 62, 28, 37) || square(pos, 23, 62, 43, 52) || square(pos, 53, 62, 13, 37) || square(pos, 53, 62, 43, 62);
}
function manageTower (event) {
    let tower = event.target;
    if (isWithin(tower.pos.x, 2, 57.5) && isWithin(tower.pos.y, 1, 60)) pathMove(event);
    tower.attackable = false;
    tower.team = 'humans';
    if (tower.scale < 1) {
        tower.health = 'toBuy';
        let p = tower.pos;
        while (true) tower.moveXY(p.x, p.y);
    }
    tower.health = NaN;
    let f = e => (e.team === 'ogres' || e.type === 'skeleton') && (!(isNaN(e.health))) && isOnTrack(e.pos);
    tower.enemies = () => tower.findFriends().filter(f).concat(tower.findEnemies().filter(f));
    tower.furthest = () => {
        let towerEnemies = tower.enemies().filter(e => tower.distanceTo(e) <= tower.attackRange);
        let largest = towerEnemies[0];
        for (let enemy of towerEnemies) if (enemies.indexOf(enemy) > enemies.indexOf(largest)) largest = enemy;
        return largest;
    };
    let def = {x: tower.pos.x, y: tower.pos.y};
    towers.push(tower);
    if (tower.type === 'thrower') {
        while (true) {
            let upgrade = getUpgradeOf(tower, true);
            if (tower !== game.towerSelected) tower.say(upgrade);
            switch (upgrade) {
                case 1:
                    tower.attackCooldown = 0.2;
                    tower.attackDamage = 2.5;
                    break;
                case 2:
                    tower.attackCooldown = 0.1;
                    tower.attackDamage = 2.5;
                    break;
                case 3:
                    tower.attackCooldown = 0;
                    tower.attackDamage = 2.5;
                    break;
                case 4:
                    tower.attackCooldown = 0.1;
                    tower.attackDamage = 10;
                    break;
                case 5:
                    tower.attackCooldown = 0;
                    tower.attackDamage = 10;
                    break;
            }
            let enemy = tower.furthest();
            if (enemy && tower.distanceTo(enemy) <= 25) tower.attack(enemy); 
            if (tower.distanceTo(def) > 0.5) tower.moveXY(def.x, def.y);
        }
    }
    if (tower.type === 'soldier') {
        tower.attackRange = 12.5;
        while (true) {
            let upgrade = getUpgradeOf(tower, true);
            if (tower !== game.towerSelected) tower.say(upgrade);
            switch (upgrade) {
                case 1:
                    tower.attackCooldown = 0.5;
                    tower.attackDamage = 1;
                    break;
                case 2:
                    tower.attackCooldown = 0.5;
                    tower.attackDamage = 2;
                    break;
                case 3:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 2.5;
                    break;
                case 4:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 50;
                    break;
                case 5:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 100;
                    break;
            }
            let enemy = tower.furthest();
            if (enemy && enemy.distanceTo(def) <= 12.5) tower.attack(enemy); 
            else tower.moveXY(def.x, def.y);
        }
    }
    if (tower.type === 'archer') {
        while (true) {
            let upgrade = getUpgradeOf(tower, true);
            if (tower !== game.towerSelected) tower.say(upgrade);
            switch (upgrade) {
                case 1:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 5;
                    break;
                case 2:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 10;
                    break;
                case 3:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 5;
                    break;
                case 4:
                    tower.attackCooldown = 0.25;
                    tower.attackDamage = 5;
                    break;
                case 5:
                    tower.attackCooldown = 0;
                    tower.attackDamage = 1;
                    break;
            }
            let enemy = tower.furthest();
            if (enemy && tower.distanceTo(enemy) <= 25) tower.attack(enemy); 
            if (tower.distanceTo(def) > 0.5) tower.moveXY(def.x, def.y);
        }
    }
}
function spawnTowerTypes (x, y) {
    game.towerPos = {x: x, y: y};
    if (game.arch.scale === 0.75 || game.sold.scale === 0.75 || game.thro.scale === 0.75) {
        thingy();
        wait(300);
    }
    game.arch.pos.x = x + 1.5;
    game.arch.pos.y = y;
    game.sold.pos.x = x - 1.5;
    game.sold.pos.y = y;
    game.thro.pos.x = x - 0.25;
    game.thro.pos.y = y;
    game.arch.scale = 0.75;
    game.sold.scale = 0.75;
    game.thro.scale = 0.75;
}
function isWithin (n1, w, n2) {
    return n1 > n2 - w && n1 < n2 + w;
}
function thingy (type) {
    game.arch.scale = 0.01;
    game.sold.scale = 0.01;
    game.thro.scale = 0.01;
    if (type) game.spawnXY(type, game.towerPos.x, game.towerPos.y);
}
function canUpgrade (t) {
    return getUpgradeOf(t, true) < 3;
}
function getUpgradeOf (t, bool) {
    return Math.round((t.scale - 1) / 0.25) + (bool ? 1 : 0);
}
function getCost (t) {
    return towerCosts[t.type][getUpgradeOf(t, false)];
}
function square (thang, x1, x2, y1, y2) {
    return thang.x >= x1 && thang.x <= x2 && thang.y >= y1 && thang.y <= y2;
}
function towerBuild (event) {
    let mouse = event.pos;
    let t = event.other.type;
    let costs = {archer: 25, soldier: 5, thrower: 10};
    if (event.other.health === 'toBuy') {
        if (moneyHandler(costs[t])) thingy(t);
        else event.other.say('Sorry, you don\'t have enough money for that');
    } else if (t && event.other.team === 'humans') {
        game.towerSelected = event.other;
        while (game.towerSelected === event.other) {
            let str = '';
            if (canUpgrade(event.other)) {
                str += 'Press "U" to upgrade me for ' + getCost(event.other) + ' money ';
            }
            str += 'press "S" to sell me, and press "C" to de-select me.';
            event.other.say(str);
            wait(10);
        }
        event.other.say('');
    } else {
        spawnTowerTypes(mouse.x, mouse.y);
    }
}
function move (thang, pos) {
    while (thang.distanceTo(pos) > 0.1) {
        thang.moveXY(pos.x, pos.y);
        wait(1);
    }
}
function pathMove (event) {
    game.enemiesLeftInWave--;
    let ogre = event.target;
    enemies.push(ogre);
    ogre.team = 'ogres';
    if (isNaN(ogre.health)) ogre.health = 7;
    ogre.maxHealth *= Math.ceil(game.wave / 10);
    ogre.health *= Math.ceil(game.wave / 10);
    ogre.maxSpeed = 12.5;
    move(ogre, {x: 57.5, y: 47.5});
    move(ogre, {x: 27.5, y: 47.5});
    move(ogre, {x: 27.5, y: 32.5});
    move(ogre, {x: 57.5, y: 32.5});
    move(ogre, {x: 57.5, y: 17.5});
    game.lives--;
    game.money -= moneyReward(ogre);
    if (game.lives <= 0) {
        if (game.lives < 0) game.lives = 0;
        game.setGoalState(game.survive, false);
    }
    ogre.defeat();
}
function buildRect (type, x1, x2, y1, y2) {
    for (let x = x1; x <= x2; x += 2) {
        for (let y = y1; y <= y2; y += 2) {
            game.spawnXY(type, x, y);
        }
    }
}
function charDetect (event) {
    switch (event.keyChar) {
        case 'N':
            if (!game.isSpawningWave) game.wave++;
            break;
        case 'P':
            thingy();
            break;
        case 'C': 
            game.towerSelected = null;
            break;
        case 'U':
            if (game.towerSelected && canUpgrade(game.towerSelected) && moneyHandler(getCost(game.towerSelected))) {
                game.towerSelected.scale += 0.25;
                game.towerSelected = null;
            }
            break;
        case 'R':
            if (game.keyReqPressed1 && game.keyReqPressed2) game.setGoalState(game.survive, true);
            break;
        case 'S':
            if (game.towerSelected) {
                let costsOfTowers = {soldier: 5, thrower: 10, archer: 25};
                let costs = towerCosts[game.towerSelected.type];
                let sum = costsOfTowers[game.towerSelected.type];
                for (let cost of costs) {
                    if (costs.indexOf(cost) >= getUpgradeOf(game.towerSelected, false)) break;
                    sum += cost;
                }
                sum /= 2;
                game.money += Math.ceil(sum);
                towers.splice(towers.indexOf(game.towerSelected));
                game.towerSelected.defeat();
                game.towerSelected.destroy();
            }
            break;
        case 'O':
            game.keyReqPressed2 = true;
            game.timestamp2 = game.time;
            break;
        case 'X':
            game.keyReqPressed1 = true;
            game.timestamp1 = game.time;
            break;
    }
}
function nextWave (event) {
    game.isSpawningWave = true;
    let waveEnemies = [{thrower: [10, 500]}, {munchkin: [15, 500], thrower: [10, 500]}, {scout: [5, 500]}, {ogre: [5, 1000]}, {ogreF: [2, 500]}, {headhunter: [1, 0]}, {skeleton: [5, 500]}, {shaman: [25, 500], ogreF: [10, 500]}, {headhunter: [5, 500], skeleton: [2, 500]}, {ogreF: [20, 500], skeleton: [10, 500]}];
    let waveEnemyArray = waveEnemies[game.wave - 1];
    for (let enemyType in waveEnemyArray) game.enemiesLeftInWave += waveEnemyArray[enemyType][0];
    for (let enemyType in waveEnemyArray) {
        let enemyNum = waveEnemyArray[enemyType][0];
        let delay = waveEnemyArray[enemyType][1];
        for (let i = 0; i < enemyNum; i++) {
            wait(delay);
            if (enemyType === 'ogreF') game.spawnXY('ogre-f', 57.5, 60);
            else game.spawnXY(enemyType, 57.5, 60);
        }
    }
    game.isSpawningWave = false;
}
function manageGame (event) {
    while (true) {
        if (game.towerPos && isOnTrack(game.towerPos)) thingy();
        for (let tower of towers) if (game.towerPos && tower.distanceTo(game.towerPos) <= tower.scale * 2) thingy();
        if (game.timestamp1 && game.keyReqPressed1 && game.time - game.timestamp1 >= 0.5) game.keyReqPressed1 = false;
        if (game.timestamp2 && game.keyReqPressed2 && game.time - game.timestamp2 >= 0.5) game.keyReqPressed2 = false;
        game.enemiesAlive = enemies.length;
        wait(1);
    }
}
game.on('click', towerBuild);
game.setPropertyFor('thrower', 'health', NaN);
game.setPropertyFor('thrower', 'team', 'humans');
game.setActionFor('skeleton', 'spawn', pathMove);
game.setActionFor('headhunter', 'spawn', pathMove);
game.setActionFor('shaman', 'spawn', pathMove);
game.setActionFor('ogre-f', 'spawn', pathMove);
game.setActionFor('ogre', 'spawn', pathMove);
game.setActionFor('scout', 'spawn', pathMove);
game.setActionFor('thrower', 'spawn', manageTower);
game.setActionFor('munchkin', 'spawn', pathMove);
game.setActionFor('headhunter', 'defeat', rewardPlayer);
game.setActionFor('skeleton', 'defeat', rewardPlayer);
game.setActionFor('ogre-f', 'defeat', rewardPlayer);
game.setActionFor('ogre', 'defeat', rewardPlayer);
game.setActionFor('scout', 'defeat', rewardPlayer);
game.setActionFor('shaman', 'defeat', rewardPlayer);
game.setActionFor('thrower', 'defeat', rewardPlayer);
game.setActionFor('munchkin', 'defeat', rewardPlayer);
game.setActionFor('soldier', 'spawn', manageTower);
game.setActionFor('archer', 'spawn', manageTower);
game.setActionFor('x-mark-stone', 'spawn', manageGame);
buildRect('x-mark-bones', 55, 60, 45, 60); // vert 1
buildRect('x-mark-bones', 25, 30, 29, 44); // vert 2
buildRect('x-mark-bones', 25, 60, 45, 50); // hori 1
buildRect('x-mark-bones', 25, 60, 29, 34); // hori 2
buildRect('x-mark-bones', 55, 60, 15, 29); // vert 3
const processor = game.spawnXY('x-mark-stone', 57, 17);
processor.scale = 0;
const player = game.spawnPlayerXY('knight', 5, 5);
player.destroy();
game.survive = game.addManualGoal('Survive until wave 10.');
game.on('keydown', charDetect);
game.lives = 25;
game.money = 100;
game.wave = 0;
game.previousWave = 0;
game.arch = null;
game.sold = null;
game.enemiesLeftInWave = 0;
game.enemiesAlive = 0;
game.isSpawningWave = false;
game.keyReqPressed1 = false;
game.timestamp1 = null;
game.keyReqPressed2 = false;
game.timestamp2 = null;
game.towerSelected = null;
ui.track(game, 'lives');
ui.track(game, 'money');
ui.track(game, 'wave');
ui.track(game, 'enemiesLeftInWave');
ui.track(game, 'enemiesAlive');
ui.setText('directions', 'Survive 10 waves.');
ui.setText('directions', 'Press "N" for the next wave.');
ui.setText('directions', 'Click anywhere (except for the track or another tower) to place a tower.');
ui.setText('directions', 'Press "P" to cancel placing a tower.');
ui.setText('directions', 'Press "C" to un-select a tower.');
ui.setText('directions', 'Press "S" to sell the selected tower.');
ui.setText('directions', 'Press "U" to upgrade the selected tower.');
ui.setText('directions', 'An archer costs 25.');
ui.setText('directions', 'A thrower costs 10.');
ui.setText('directions', 'A soldier costs 5.');
ui.setText('directions', 'PRO TIPS:');
ui.setText('directions', '1) Don\'t buy throwers, they are an excellent game-lagger.');
ui.setText('directions', '2) Upgrade towers, they are much better if you do.');
game.addSurviveGoal();
game.arch = game.spawnXY('archer', 0, 0);
game.sold = game.spawnXY('soldier', 0, 0);
game.thro = game.spawnXY('thrower', 0, 0);
game.sold.team = 'humans';
game.thro.team = 'humans';
game.arch.team = 'humans';
game.arch.attackable = false;
game.sold.attackable = false;
game.thro.attackable = false;
game.arch.scale = 0.01;
game.sold.scale = 0.01;
game.thro.scale = 0.01;
while (true) {
    if (game.wave - 1 === game.previousWave) nextWave();
    if (game.wave >= 10 && game.enemiesAlive === 0 && game.enemiesLeftInWave === 0 && game.lives > 0) game.setGoalState(game.survive, true);
    if (game.wave !== game.previousWave) game.previousWave = game.wave;
    wait(10);
}
