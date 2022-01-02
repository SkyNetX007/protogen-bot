const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const express = require('express');
var http = require("http");
var fs = require("fs");
var url = require("url");
var bodyParser = require("body-parser");
var log4js = require('log4js');

// Self awake
require("./heroku");

const config = require("./config");
const { readLine, close } = require("./readconsole");
const { json } = require("express/lib/response");
const app = express();
const port = process.env.PORT || 3000;

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'logs/bot.log', maxLogSize: 10240, backups: 1, category: 'default' },
    },
    categories: {
        default: { appenders: ['console', 'file'], level: 'info' },
    }
})

var logger = log4js.getLogger('FurryBot');
logger.level = 'INFO';

var bot = mineflayer.createBot(botConfig);
bot.loadPlugin(pathfinder);
bindEvents(bot);

function bindEvents(bot) {

    var onlineState = false;

    bot.on("chat", async (username, message) => {
        logger.info(`<${username}> ${message}`);

        if (username === bot.username) return;

        if (/^zzz/.test(message)) {
            goToSleep();
        }

        if (/furry|福瑞/.test(message)) {
            bot.chat("福瑞...嘿嘿...福瑞！");
        }

        if (/^:cmd#[\w/@*!#=\[\]\x20/\u4E00-\u9FA5]+$/.test(message)) {
            cmd = message.slice(5);
            logger.info("Command: " + cmd);
            bot.chat("/" + cmd);
        }

        if (/^:msg#[\w/@*!#=\[\]\x20/\u4E00-\u9FA5]+$/.test(message)) {
            msg = message.slice(5);
            logger.info("Message: " + msg);
            bot.chat(msg);
        }

        if (/^:bot#help$/.test(message)) {
            var helpMsg = `:bot#[CMD] - 执行命令[CMD]
:bot#help - 显示帮助
:bot#exit - 退出
:bot#stats - 状态
:bot#tp2Me - 将 bot 传送到自己
:bot#tp2Bot - 将自己传送到 bot
:bot#inv - 显示 bot 的背包
:bot#toss [ITEM] - 丢弃物品[ITEM]
:bot#toss [AMOUNT] [ITEM] - 丢弃物品[ITEM] [AMOUNT] 个
:cmd#[CMD] - 执行命令[CMD]
:msg#[MSG] - 发送消息[MSG]
zzz - 找床摸鱼`;
            bot.whisper(username, helpMsg);
        }

        if (/^:bot#stats$/.test(message)) {
            bot.whisper(username, botStats());
        }

        if (/^:bot#exit$/.test(message)) {
            close();
            bot.quit();
            process.exit();
        }

        if (/^:bot#tp2Me$/.test(message)) {
            bot.chat("/tpa " + username);
        }

        if (/^:bot#tp2Bot$/.test(message)) {
            bot.chat("/tpahere " + username);
        }

        const InventoryCommand = message.split(" ");
        if (/^:bot#inv$/.test(message)) {
            sayItems();
        }

        if (/^:bot#toss \d+ \w+$/.test(message)) {
            // toss amount name
            // ex: toss 64 diamond
            tossItem(InventoryCommand[2], InventoryCommand[1]);
        }

        if (/^:bot#toss \w+$/.test(message)) {
            // toss name
            // ex: toss diamond
            tossItem(InventoryCommand[1]);
        }
    });

    bot.on("messagestr", async (message, messagePosition, jsonMsg) => {
        if (messagePosition === "chat") return;
        logger.info(message);
    });

    //bot.once('spawn', () => { bot.chat("开始摸鱼"); });
    bot.on("login", () => { onlineState = true; });
    bot.on("death", () => {
        bot.chat("呜呜呜，不许欺负福瑞！");
    });
    CommandInput();

    //  记录错误和被踢出服务器的原因:
    bot.on("kicked", logger.info);
    bot.on("error", logger.info);
    bot.on("end", () => {
        logger.info("Bot disconnected");
        onlineState = false;
        ReConnect();
    });

    // Web panel
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.get('/api/state', function (req, res) {
        var botState = { "isOnline": false, "username": "Steve", "health": 0, "food": 0, "level": 0, "dimension": "Furry Island", "position": { "x": 0, "y": 0, "z": 0, }, "inventory": {}, };
        if (onlineState) {
            botState = { "isOnline": onlineState, "username": bot.username, "health": bot.health, "food": bot.food, "level": bot.experience.level, "dimension": bot.game.dimension, "position": { "x": bot.entity.position.x, "y": bot.entity.position.y, "z": bot.entity.position.z, }, "inventory": bot.inventory, };
        }
        var json = JSON.stringify(botState);
        res.send(json);
    });
    app.post('/api/cmd', function (req, res) {
        var msg = req.body.msg;
        bot.chat("/" + msg);
    });
    app.post('/api/chat', function (req, res) {
        var msg = req.body.msg;
        bot.chat(msg);
    });
    app.post('/api/botcmd', function (req, res) {
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
            close();
            bot.quit();
            process.exit();
        } else if (msg === ":stats") {
            logger.info(botStats());
        }
    });
    app.get('/api/log', function (req, res) {
        fs.readFile('./logs/bot.log', 'utf8', function (err, data) {
            if (!err) {
                res.send(data);
            }
            else {
                res.send(err);
            }
        })
    });

    app.listen(port, () => logger.info(`Server running on ${port}`));

    /*
    var server = http.createServer(function (request, response) {
        // 获得HTTP请求的method和url:
        // console.log(request.method + ': ' + request.url);
        // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
        response.writeHead(200, { 'Content-Type': 'text/html' });
 
        var pathname = url.parse(request.url).pathname;
        if (pathname == '/') {
            fs.readFile("index.html", function (err, data) {
                if (!err) {
                    response.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
                    response.end(data);
                } else {
                    throw err;
                }
            });
        } else if (pathname == '/api/state') {
            response.writeHead(200, { "Content-Type": "application/json;charset=UTF-8" });
            var botState = { "isOnline": false, "health": 0, "food": 0, "level": 0, "dimension": "Furry Island", "position": { "x": 0, "y": 0, "z": 0, }, "inventory": [], };
            if (onlineState) {
                botState = { "isOnline": onlineState, "health": bot.health, "food": bot.food, "level": bot.experience.level, "dimension": bot.game.dimension, "position": { "x": bot.entity.position.x, "y": bot.entity.position.y, "z": bot.entity.position.z, }, "inventory": bot.inventory.items, };
            }
            var json = JSON.stringify(botState);
            response.end(json);
        } else {
            fs.readFile("./" + pathname, function (err, data) {
                if (!err) {
                    response.end(data);
                } else {
                    throw err;
                }
            });
        }
    }).listen(port);
    */
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ReConnect() {
    await delay(10000);
    try {
        logger.info("重新连接...");
        bot = mineflayer.createBot(botConfig);
        //bindEvents(bot);
    } catch (error) {
        logger.info("Error: " + error);
        ReConnect();
    }
}

async function CommandInput() {
    console.info("准备读取命令...");
    let input = await readLine();
    while (true) {
        if (input === "") {
            continue;
        }
        if (input === ":help") {
            console.log(`调试指令：
:help - 显示帮助
:exit :(q)uit - 退出
:stats - 状态`
            );
        } else if (input === ":exit" || input === ":quit" || input === ":q") {
            close();
            bot.quit();
            process.exit();
        } else if (input === ":stats") {
            console.log(botStats());
        } else if (input[0] === "/") {
            let cmd = input.substr(1);
            console.log("Command: " + cmd);
            bot.chat(input);
        } else {
            console.log(`<${bot.username}> ` + input);
            bot.chat(input);
        }
        input = await readLine();
    }
}

async function goToSleep() {
    const bed = bot.findBlock({
        matching: (block) => bot.isABed(block),
    });
    if (bed) {
        try {
            const mcData = require("minecraft-data")(bot.version);
            const defaultMove = new Movements(bot, mcData);

            const p = bed.position;
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalNear(p.x, p.y, p.z, 1));

            await bot.sleep(bed, () => {
                bot.chat("Oyasumi...");
            });
        } catch (err) {
            bot.chat(`${err.message}.`);
        }
    } else {
        bot.chat("莫得床！");
    }
}

function sayItems(items = null) {
    if (!items) {
        items = bot.inventory.items();
        if (
            require("minecraft-data")(bot.version).isNewerOrEqualTo("1.9") &&
            bot.inventory.slots[45]
        )
            items.push(bot.inventory.slots[45]);
    }
    const output = items.map(itemToString).join(", ");
    if (output) {
        bot.chat(output);
    } else {
        bot.chat("一穷二白");
    }
}

function tossItem(name, amount) {
    amount = parseInt(amount, 10);
    const item = itemByName(name);
    if (!item) {
        bot.chat(`没有 ${name}`);
    } else if (amount) {
        bot.toss(item.type, null, amount, checkIfTossed);
    } else {
        bot.tossStack(item, checkIfTossed);
    }

    function checkIfTossed(err) {
        if (err) {
            bot.chat(`无法丢弃： ${err.message}`);
        } else if (amount) {
            bot.chat(`丢弃了 ${amount} 个 ${name}`);
        } else {
            bot.chat(`丢弃了 ${name}`);
        }
    }
}

function itemToString(item) {
    if (item) {
        return `${item.name} x ${item.count}`;
    } else {
        return "(nothing)";
    }
}

function itemByName(name) {
    const items = bot.inventory.items();
    if (
        require("minecraft-data")(bot.version).isNewerOrEqualTo("1.9") &&
        bot.inventory.slots[45]
    )
        items.push(bot.inventory.slots[45]);
    return items.filter((item) => item.name === name)[0];
}

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
