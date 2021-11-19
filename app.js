const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const inventoryViewer = require('mineflayer-web-inventory');
const http = require('http');

const config = require('./config');
const { readLine, close } = require('./readconsole');
const { VLC } = require('node-vlc-http');

const vlc = new VLC(vlcConfig)

vlc.on('error', (error) => {
    console.error("VLC player connection gone wrong!" + error)
    process.exit()
})

const bot = mineflayer.createBot(botConfig)

inventoryViewer(bot, inventoryOptions)
bot.loadPlugin(pathfinder)

vlc.on('connect', () => {
    console.log('VLC connected')
})

bot.on('chat', (username, message) => {
    if (username === bot.username) return
    console.log(`<${username}> ${message}`)
    if (message === 'tpBot2Me') {
        bot.chat('/tpa ' + username)
    }
    if (message === 'tp2Bot') {
        bot.chat('/tpahere ' + username)
    }
})

bot.on('messagestr', (message, messagePosition, jsonMsg) => {
    if (messagePosition === 'chat') return
    console.log(message)
    if (message.startsWith('[AllMusic]正在播放：')) {
        let musicInfoStr = message.substr(15)
        let musicInfoArr = musicInfoStr.split('|')
        musicInfoArr.splice(3, 1)
        console.log(`歌名：${musicInfoArr[0]}\t艺术家：${musicInfoArr[1]}\t专辑：${musicInfoArr[2]}`) // MusicName, Artist, Album, PlayerName
        let query = neteaseApi.url + `/cloudsearch?limit=1&keywords=${musicInfoArr[0]} ${musicInfoArr[1]} ${musicInfoArr[2]}`
        http.get(query, (res) => {
            // console.log(`Got response: ${res.statusCode}`)
            res.on('data', (chunk) => {
                var InfoJson = JSON.parse(chunk)
                var mName = InfoJson.result.songs[0].name
                var mArtist = InfoJson.result.songs[0].ar[0].name
                var mAlbum = InfoJson.result.songs[0].al.name
                var mId = InfoJson.result.songs[0].id
                console.log(`[API]歌名：${mName}\t艺术家：${mArtist}\t专辑：${mAlbum}\tMID: ${mId}`)
                vlc.playlistEmpty()
                vlc.addToQueueAndPlay(`https://music.163.com/song/media/outer/url?id=${mId}.mp3`)
            });
        }
        )
    }
})

bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: false })

    bot.on('path_update', (r) => {
        const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
        console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`)
        const path = [bot.entity.position.offset(0, 0.5, 0)]
        for (const node of r.path) {
            path.push({ x: node.x, y: node.y + 0.5, z: node.z })
        }
        bot.viewer.drawLine('path', path, 0xff00ff)
    })

    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)

    bot.viewer.on('blockClicked', (block, face, button) => {
        if (button !== 2) return // only right click

        const p = block.position.offset(0, 1, 0)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z))
    })
})

async function CommandInput() {
    console.log("准备读取命令...")
    let input = await readLine()
    while (true) {
        if (input === '') { continue }
        if (input === ':help') {
            console.log(
                `:help - 显示帮助
:exit :quit - 退出
:stats - 状态`)
        }
        else if (input === ':exit' || input === ':quit') {
            close()
            bot.quit()
            process.exit()
        }
        else if (input === ':stats') {
            console.log(`生命值：${bot.health}\t饥饿度：${bot.food}\t坐标：${bot.entity.position}\t维度：${bot.game.dimension}`)
        }
        else if (input[0] === '/') {
            let cmd = input.substr(1)
            console.log('Command: ' + cmd)
            bot.chat(input)
        }
        else {
            console.log(`<${bot.username}> ` + input)
            bot.chat(input)
        }
        input = await readLine()
    }
}

function greetings() {
    bot.chat("群精华语录：" + "男人看男人，算什么男人")
}


bot.once('spawn', () => { bot.chat("开始摸鱼") })
CommandInput()

//  记录错误和被踢出服务器的原因:
bot.on('kicked', console.log)
bot.on('error', console.log)
