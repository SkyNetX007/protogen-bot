const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const config = require('./config');
const { readLine, close } = require('./readconsole');

const bot = mineflayer.createBot(botConfig);
bot.loadPlugin(pathfinder);

bot.on('chat', async (username, message) => {
    
    if (username === bot.username) return

    console.log(`<${username}> ${message}`);

    if (/^zzz/.test(message)) {
        goToSleep();
    }

    if (/furry|福瑞/.test(message)) {
        bot.chat('福瑞...嘿嘿...福瑞！');
    }
    
    if (/^:cmd#[\w/@*\x20/\u4E00-\u9FA5]+$/.test(message)) {
        cmd = message.split('#');
        console.log('/' + cmd[1]);
        bot.chat('/' + cmd[1]);
    }

    if (/^:bot#help$/.test(message)) {
        var helpMsg = 
`:bot#[CMD] - 执行命令[CMD]
:bot#help - 显示帮助
:bot#exit - 退出
:bot#stats - 状态
:bot#tp2Me - 将 bot 传送到自己
:bot#tp2Bot - 将自己传送到 bot
:bot#inv - 显示 bot 的背包
:bot#toss [ITEM] - 丢弃物品[ITEM]
:bot#toss [AMOUNT] [ITEM] - 丢弃物品[ITEM] [AMOUNT] 个
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
        bot.chat('/tpa ' + username);
    }

    if (/^:bot#tp2Bot$/.test(message)) {
        bot.chat('/tpahere ' + username);
    }
        
    const InventoryCommand = message.split(' ');
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

})

bot.on('messagestr', async (message, messagePosition, jsonMsg) => {
    if (messagePosition === 'chat') return
    console.log(message);
})

async function CommandInput() {
    console.log("准备读取命令...");
    let input = await readLine();
    while (true) {
        if (input === '') { continue }
        if (input === ':help') {
            console.log(
`:help - 显示帮助
:exit :(q)uit - 退出
:stats - 状态`)
        }
        else if (input === ':exit' || input === ':quit' || input === ':q') {
            close();
            bot.quit();
            process.exit();
        }
        else if (input === ':stats') {
            console.log(botStats());
        }
        else if (input[0] === '/') {
            let cmd = input.substr(1);
            console.log('Command: ' + cmd);
            bot.chat(input);
        }
        else {
            console.log(`<${bot.username}> ` + input);
            bot.chat(input);
        }
        input = await readLine();
    }
}

async function goToSleep () {
    const bed = bot.findBlock({
    matching: (block) => bot.isABed(block),
    });
    if (bed) {
        try {
            const mcData = require('minecraft-data')(bot.version);
            const defaultMove = new Movements(bot, mcData);

            const p = bed.position;
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new goals.GoalNear(p.x,p.y,p.z,1));

            await bot.sleep(bed, ()=>{
                bot.chat("Oyasumi...");
            });
        } catch (err) {
            bot.chat(`${err.message}.`);
        }
    } else {
        bot.chat('莫得床！');
    }
}

function sayItems (items = null) {
    if (!items) {
        items = bot.inventory.items();
        if (require('minecraft-data')(bot.version).isNewerOrEqualTo('1.9') && bot.inventory.slots[45]) items.push(bot.inventory.slots[45]);
    }
    const output = items.map(itemToString).join(', ');
    if (output) {
        bot.chat(output);
    } else {
        bot.chat('一穷二白');
    }
}

function tossItem (name, amount) {
    amount = parseInt(amount, 10);
    const item = itemByName(name);
    if (!item) {
        bot.chat(`没有 ${name}`);
    } else if (amount) {
        bot.toss(item.type, null, amount, checkIfTossed);
    } else {
        bot.tossStack(item, checkIfTossed);
    }

    function checkIfTossed (err) {
    if (err) {
      bot.chat(`无法丢弃： ${err.message}`);
    } else if (amount) {
      bot.chat(`丢弃了 ${amount} 个 ${name}`);
    } else {
      bot.chat(`丢弃了 ${name}`);
    }
    }
}

function itemToString (item) {
    if (item) {
        return `${item.name} x ${item.count}`
    } else {
        return '(nothing)'
    }
}

function itemByName (name) {
    const items = bot.inventory.items()
    if (require('minecraft-data')(bot.version).isNewerOrEqualTo('1.9') && bot.inventory.slots[45]) items.push(bot.inventory.slots[45]);
    return items.filter(item => item.name === name)[0]
}

function botStats() {
    var stats = `生命值：${bot.health}    饥饿度：${bot.food}    等级：${bot.experience.level}    坐标：${bot.entity.position}    维度：${bot.game.dimension}\n`;
    var playerList = Object.keys(bot.players);
    for (var i = playerList.length - 1; i>=0; i--) {
        if (playerList[i][0] === '~') {
            playerList.splice(i, 1);
        }
    }
    stats += `玩家人数：${playerList.length}    玩家列表：${playerList}`;
    return stats
}

bot.once('spawn', () => { bot.chat("开始摸鱼"); });
CommandInput();

//  记录错误和被踢出服务器的原因:
bot.on('kicked', console.log)
bot.on('error', console.log)
