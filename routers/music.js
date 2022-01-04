var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

require('../config-dev.js');

router.get('/', function (req, res) {
    res.redirect('/404');
});

router.get('/song', function (req, res) {
    const APIUrl = neteaseApi.url;
    const realIP = neteaseApi.realIP;
    var musicId = req.query.id || 1839207650; // Feels - Low Roar

    fetch(`${APIUrl}/song/detail?ids=${musicId}`).then((res) => { return res.json() }).then((data) => {
        let obj = {
            name: data.songs[0].name,
            artist: data.songs[0].ar.map(function (ar) { return ar.name }).join(','),
            cover: data.songs[0].al.picUrl,
        }
        return obj;
    }).then((detail) => {
        fetch(`${APIUrl}/lyric?id=${musicId}`).then((res) => { return res.json() }).then((data) => {
            let obj = {
                lrc: data.lrc.lyric,
            }
            return Object.assign({}, detail, obj);
        }).then((lyric) => {
            fetch(`${APIUrl}/song/url?realIP=${realIP}&id=${musicId}`).then((res) => { return res.json() }).then((data) => {
                let obj = {
                    url: data.data[0].url,
                }
                return Object.assign({}, lyric, obj);
            }).then((musicInfo) => {
                console.log("musicInfo: " + JSON.stringify(musicInfo));
                res.json(musicInfo);
            });
        });
    });
});

module.exports = router;