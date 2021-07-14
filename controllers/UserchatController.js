const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieparser = require('cookie-parser');
const jwt_decode = require('jwt-decode');
const request = require("express");

const express = require("express");
const app = require('express')();
app.use(cookieparser());

exports.start = async (req, res) => {
    //req.query.id
    const maindb = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password:  '',
        database: 'nodejs_login',
        multipleStatements: true
    });
    let id_from_user = req.query.id;

    maindb.query('SELECT * FROM users WHERE id = ? ', [id_from_user], async (error, results) => {
        if (!results || results.length == 0) {

        }
        else {
            var row = [];
            var names =[];
            var ids = [];
            var emitterlist = [];
            var getterlist= [];
            var messageslist = [];
            var htmlmessageslist = [];

            try {
                var unid = req.cookies.jwt;
                var id = jwt_decode(unid);
                console.log(id.id)
                maindb.query("SELECT * FROM users", function (err, result, fields) {
                    maindb.query('SELECT * FROM users WHERE id = ? ', [id.id], async (error, results) => {
                        maindb.query('SELECT * FROM messages WHERE ((emitter = ' + id.id + ') AND (getter = ' + id_from_user + ')) OR ((getter = ' + id.id + ') AND (emitter = ' + id_from_user + '))', async (error, results2) => {

                        var ur_id = results[0].id;
                        var ur_name = results[0].name;
                        var ur_email = results[0].email;

                        // if any error while executing above query, throw error
                        if (err) throw err;
                        // if there is no error, you have the result
                        // iterate for all the rows in result
                            for (var i = 0; i < results2.length; i++) {
                                emitterlist.push(results2[i].emitter)
                                getterlist.push(results2[i].getter)
                                messageslist.push(results2[i].message)

                                if (results2[i].emitter == id.id && results2[i].getter !=id.id) {

                                    htmlmessageslist.push('outgoing-message ' + results2[i].message)
                                }
                                if (results2[i].emitter != id.id && results2[i].getter == id.id) {
                                    htmlmessageslist.push('ingoing-message ' + results2[i].message)
                                }

                            }
                            console.log(htmlmessageslist)



                        Object.keys(result).forEach(function(key) {
                            row = result[key];
                            names.push(row.name);
                            ids.push(row.id);
                        });
                        var ids2 = ids;
                        var names2 = names;
                        res.render('../chat/chat', {
                            style: 'stylesheet/style_chat.css',
                            names: names2.toString(),
                            ids: ids2,
                            urname: ur_name,
                            urid: ur_id,
                            uremail: ur_email,
                            savedmessages: htmlmessageslist,
                            savedmessages_size: htmlmessageslist.length


                        });
                        names = [];
                        ids = [];
                        console.log("urname " + ur_name)
                        console.log("names: " + names2)
                        console.log("ids: " + ids2)

                        });
                    });

                });

            } catch (InvalidTokenError) {
                res.render('login', {
                    style: 'stylesheet/style_login.css'
                })
            }

        }


    });





}