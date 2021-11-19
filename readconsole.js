const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/**
 * 读入一行
 */
function readLine() {
    return new Promise(resolve => {
        rl.on('line', (str) => {
            resolve(str)
        })
    })
}

/**
 * 退出逐行读取
 */
function close() {
    console.log('Stop\n')
    rl.close()
}

module.exports = {
    readLine,
    close
}