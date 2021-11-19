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

vlcConfig = {
    // VLC web interface settings, you can check VLC documentation
    host: 'localhost',
    port: 8080,
    username: '',
    password: '',
    // update automatically status and playlist of VLC, default true.
    autoUpdate: true,
    // how many times per seconds (in ms) node-vlc-http will update the status of VLC, default 1000/30 ~ 33ms (30fps)
    tickLengthMs: 33,
    // checks that browse, status and playlist have changed since the last update of one of its elements,
    // if it the case fire browsechange, statuschange or playlistchange event. default true.
    changeEvents: true,
    // max tries at the first connection before throwing an error set it to -1 for infinite try, default 3
    maxTries: 3,
    // interval between each try in ms, default 1000
    triesInterval: 1000,
}

inventoryOptions = {
    // inventory web viewer options, change it as you wish
    port: 3008
    // path: PATH,
    // express: EXPRESS,
    // app: APP,
    // http: HTTP,
    // io: IO,
    // startOnLoad: BOOLEAN,
    // debounceTime: INT
}

neteaseApi = {
    url: 'http://localhost:3000' // NeteaseCloudMusicApi server url
}
