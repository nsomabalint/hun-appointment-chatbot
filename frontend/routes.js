const axios = require('axios');
var express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
var router = express.Router();
require('./feedback.model');
const FeedbackModel = mongoose.model('feedback');

const bodyParser = require('body-parser');
let rawdata = fs.readFileSync('node_credentials.json');
const credentials = JSON.parse(rawdata);

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json({}));

// Home page route.
router.post('/mongo', (req, res, next) => {
    if(req.body.user_id && req.body.description){
        var feedback = new FeedbackModel({
            user_id: req.body.user_id,
            description: req.body.description
        });
        feedback.save((err, doc) => {
            if (err) res.status(500).send("Adatbazis hiba");
            if (doc) res.status(200).send("Sikeres visszajelzes!");
        })
    }
});

router.post("/rasa/webhook", (req, res) => {
    if(req.body.message && req.body.sender){
        //doesnt work because of https
        axios.post('https://inf.u-szeged.hu/algmi/chatbot/rasa/webhooks/rest/webhook', {
        //can test this only with docker
        //axios.post('http://rasa_server:5005/rasa/webhooks/rest/webhook', {
        message: req.body.message,
        sender: req.body.sender
        })
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send("Belso szerver hiba");
            console.log(error);
        }) 
    } else {
        console.log(req.body);
        res.status(400).send("Nincs megadva id vagy üzenet");
    }
    
});
router.get('/tts/:text', (req, res) => {
    axios.get(`http://${credentials.tts_user}:${credentials.tts_pw}@cyrus.tmit.bme.hu/hmmtts2/synth_hmm_wav.php?speaker=NG&q=${req.params.text}`)
    .then(response => {
        res.status(200).send(response);
    })
    .catch(error => {
        res.status(500).send("Sikertelen tts hívás");
    })
})

module.exports = router;