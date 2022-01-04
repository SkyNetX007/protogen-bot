// Config

botConfig = {
    host: 'localhost',             // minecraft server ip
    username: 'email@example.com', // minecraft username
    password: '12345678'           // minecraft password, comment out if you want to log into online-mode=false servers
    // port: 25565,                // only set if you need a port that isn't 25565
    // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
    // auth: 'mojang'              // only set if you need microsoft auth, then set this to 'microsoft'

    // only set if you need to use a custom Yggdrasil API to login, you don't need to set "auth" if you use this
    // authServer: "https://littleskin.cn/api/yggdrasil/authserver",
    // sessionServer: "https://littleskin.cn/api/yggdrasil/sessionserver",
}

neteaseApi = {
    url: 'http://localhost:3000', // NeteaseCloudMusicApi server url
    realIP: '123.123.123.123',       // Use any CN IP, if the music server is not in China
}
