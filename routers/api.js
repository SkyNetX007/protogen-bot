var express = require('express');
var router = express.Router();
var fs = require("fs");

var logger = global.logger;
var bot = global.bot;

router.get('/', function (req, res) {
    res.redirect('/404');
});

router.get('/state', function (req, res) {
    var botState = { "isOnline": false, "username": "Steve", "health": 0, "food": 0, "level": 0, "dimension": "Furry Island", "position": { "x": 0, "y": 0, "z": 0, }, "inventory": {}, };
    if (global.onlineState) {
        botState = { "isOnline": global.onlineState, "username": bot.username, "health": bot.health, "food": bot.food, "level": bot.experience.level, "dimension": bot.game.dimension, "position": { "x": bot.entity.position.x, "y": bot.entity.position.y, "z": bot.entity.position.z, }, "inventory": bot.inventory, };
    }
    var json = JSON.stringify(botState);
    res.send(json);
});

router.post('/cmd', function (req, res) {
    var msg = req.body.msg;
    bot.chat("/" + msg);
});

router.post('/chat', function (req, res) {
    var msg = req.body.msg;
    bot.chat(msg);
});

router.get('/log', function (req, res) {
    fs.readFile('./logs/bot.log', 'utf8', function (err, data) {
        if (!err) {
            res.send(data);
        }
        else {
            res.send(err);
        }
    })
});

router.get('/reboot', function (req, res) {
    bot.quit();
    process.exit();
});

router.post('/botcmd', function (req, res) {
    var msg = req.body.msg;
    if (msg === "") { return; }
    if (msg === ":help") {
        logger.info(
            `调试指令：
:help - 显示帮助
:exit :(q)uit - 退出
:stats - 状态`
        );
    } else if (msg === ":exit" || msg === ":quit" || msg === ":q") {
        bot.quit();
        process.exit();
    } else if (msg === ":stats") {
        logger.info(botStats());
    }
});

function botStats() {
    var stats = `生命值：${bot.health}    饥饿度：${bot.food}    等级：${bot.experience.level}    坐标：${bot.entity.position}    维度：${bot.game.dimension}\n`;
    var playerList = Object.keys(bot.players);
    for (var i = playerList.length - 1; i >= 0; i--) {
        if (playerList[i][0] === "~") {
            playerList.splice(i, 1);
        }
    }
    stats += `玩家人数：${playerList.length}    玩家列表：${playerList}`;
    return stats;
}

module.exports = router;