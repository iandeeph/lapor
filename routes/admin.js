var express     = require('express');
var router      = express.Router();
var _           = require('lodash');
var mysql       = require('promise-mysql');
var Promise     = require('bluebird');
var moment      = require('moment');

var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

//source : http://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
var db_config = {
  host         : 'localhost',
  user         : 'root',
  password     : 'c3rmat',
  insecureAuth : 'true',
  database     : 'db_portal_it'
};

var laporanConn;

function handleDisconnect() {
  laporanConn = mysql.createPool(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  laporanConn.getConnection(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  laporanConn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


/* GET home page. */
router.get('/', function(req, res, next) {
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        var layoutAntrian = [];
        var layoutPekerja = {};
        var tomorrow = moment().subtract(1,'d');
        var afterTomorrow = moment().subtract(2,'d');
        var loginUser = req.session.name;
        var privUser = req.session.priv;
        var classification;
        var color = "";

        function warnaAntrian(tanggal){
            if(moment(tanggal) <= afterTomorrow){
                color = "red"
            }else if(moment(tanggal) < tomorrow){
                color = "orange"
            }else{
                color = "green darken-3"
            }

            return color;
        }
        laporanConn.query("SELECT * FROM laporan ORDER BY noantrian")
            .then(function (result) {
                //console.log(result);
                var resultPromise = new Promise(function (resolve, reject) {
                    resolve(_.filter(result, {'status':'On Queue', 'resolve':'FALSE', 'assign':'open'}));
                });

                resultPromise.then(function(antrianItem) {
                    //console.log(antrianItem);
                    Object.keys(antrianItem).forEach(function (key) {
                        if((antrianItem[key].jenis == "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis == "Informasi Anak Resign") && privUser == "2"){
                            classification = "1";
                        }else if((antrianItem[key].jenis == "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis == "Informasi Anak Resign") && privUser == "1"){
                            classification = "3";
                        }else if((antrianItem[key].jenis != "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis != "Informasi Anak Resign") && privUser == "2"){
                            classification = "3";
                        }else if((antrianItem[key].jenis != "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis != "Informasi Anak Resign") && privUser == "1"){
                            classification = "2";
                        }
                        layoutAntrian[key] = {
                            "noAntrian": antrianItem[key].noantrian,
                            "jenis": antrianItem[key].jenis,
                            "nama": antrianItem[key].nama,
                            "divisi": antrianItem[key].divisi,
                            "tanggalBuat": antrianItem[key].tanggalBuat,
                            "detail" : antrianItem[key].detail,
                            "idLaporan" : antrianItem[key].idlaporan,
                            "warna" : warnaAntrian(antrianItem[key].tanggalBuat),
                            "classification" : classification
                        };
                    });

                    return Promise.all(layoutAntrian)
                        .then(function (a) {
                            var promisePekerja = new Promise(function (resolve, reject) {
                                resolve(_.filter(result, function(row) {
                                    //return (row.status != "On Queue" && !row.resolve && row.assign != 'open')
                                    return (row.status != "On Queue" && row.assign != 'open' && row.resolve != "TRUE" && row.assign != 'Oby Sumampouw')
                                }));
                            });
                            promisePekerja.then(function(resultPekerja) {
                                laporanConn.query("select nama from admin where nama != 'Oby Sumampouw' order by nama")
                                    .then(function(adminResult) {
                                        var groupedAssign = _.groupBy(adminResult, 'nama');
                                        var arrGrpAssign = _.toArray(groupedAssign);
                                        return Promise.each(arrGrpAssign, function (rowAssign){
                                            layoutPekerja[rowAssign[0].nama] = {};
                                        }).then(function(){
                                            var arrNoAntrian = _.toArray(resultPekerja);
                                            return Promise.each(arrNoAntrian, function (rowNoAntrian) {
                                                layoutPekerja[rowNoAntrian.assign][rowNoAntrian.noantrian] = {};
                                            }).then(function(){
                                                var arrPekerja = _.toArray(resultPekerja);
                                                return Promise.each(arrPekerja, function (rowPekerja){
                                                    layoutPekerja[rowPekerja.assign][rowPekerja.noantrian] = {
                                                        "noAntrian" : rowPekerja.noantrian,
                                                        "jenis": rowPekerja.jenis,
                                                        "nama":rowPekerja.nama,
                                                        "divisi":rowPekerja.divisi,
                                                        "tanggalBuat":rowPekerja.tanggalBuat,
                                                        "warna":warnaAntrian(rowPekerja.tanggalBuat),
                                                        "assign":rowPekerja.assign,
                                                        "catatan":rowPekerja.catatan,
                                                        "status":rowPekerja.status,
                                                        "idLaporan":rowPekerja.idlaporan,
                                                        "detail":rowPekerja.detail,
                                                        "loginUser":loginUser
                                                    };
                                                }).then(function(b){
                                                    //console.log(a);
                                                    res.render('admin-index', {
                                                        layout: "admin",
                                                        layoutTemplate: a,
                                                        layoutPekerja: layoutPekerja
                                                    });
                                                })

                                            });
                                            //var groupedAssign = _.groupBy(arrAdmRes, 'nama');
                                            //Object.keys(groupedAssign).forEach(function(assign) {
                                            //    layoutPekerja[assign] = [];
                                            //});
                                            //
                                            //Object.keys(resultPekerja).forEach(function(key) {
                                            //    //layoutPekerja[assign][key] = [];
                                            //    if(resultPekerja[key].assign != 'open'){
                                            //        layoutPekerja[resultPekerja[key].assign][resultPekerja[key].noantrian] = [];
                                            //        layoutPekerja[resultPekerja[key].assign][resultPekerja[key].noantrian].push({
                                            //            "noAntrian" : resultPekerja[key].noantrian,
                                            //            "jenis": resultPekerja[key].jenis,
                                            //            "nama":resultPekerja[key].nama,
                                            //            "divisi":resultPekerja[key].divisi,
                                            //            "tanggalBuat":resultPekerja[key].tanggalBuat,
                                            //            "assign":resultPekerja[key].assign,
                                            //            "status":resultPekerja[key].status
                                            //        });
                                            //    }
                                            //});

                                        });
                                    });
                            });
                        });
                });
            });
    }
});

/* POST home page. */
router.post('/', function(req, res, next) {
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        var updateQry = "";
        var loginUser = req.session.name;
        var idKerjakan = req.body.idKerjakan || {};
        var assign = req.body.assign || {};
        var idAssign = req.session.priv || {};
        var idLaporan = req.body.idLaporan || {};
        var laporsubmit = req.body.laporsubmit || {};
        var laporUpdate = req.body.laporStatus || {};
        if(laporsubmit == "kerjakan"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'On Doing', " +
                "assign = '"+loginUser+"', " +
                "tanggalAssign = '"+dateNow+"' " +
                "WHERE idlaporan = '"+idKerjakan+"' ";
        }else if(laporsubmit == "selesai" && idAssign == "1"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'Done', " +
                "resolve = 'TRUE', " +
                "tanggalSelesai = '"+dateNow+"' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        }else if(laporsubmit == "selesai" && idAssign == "2"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'Done' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        }else if(laporsubmit == "update"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "catatan = '"+laporUpdate+"' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        }else if(laporsubmit == "takeOver"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'On Doing', " +
                "assign = '"+loginUser+"', " +
                "tanggalAssign = '"+dateNow+"' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        }else{
            console.log("Error");
        }

        laporanConn.query(updateQry)
            .then(function(updateResult) {
                //console.log(a);
                res.redirect('/admin');
            }).catch(function (error) {
                //logs out the error
                console.error(error);
            });
    }

});

/* GET timeline page. */
router.get('/workflow', function(req, res, next) {
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    //if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
    //    console.log("Not Logged");
    //    res.redirect('/portal-auth');
    //}else {
        var layoutTemplate = {};
        var timelineQry= "SELECT *, DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated FROM laporan WHERE status = 'Done' AND resolve ='TRUE' ORDER BY tanggalSelesai DESC ";
        laporanConn.query(timelineQry)
            .then(function(timelineResQry) {
                var groupedDate = _.groupBy(timelineResQry, 'doneDateFormated');
                var arrGrpDate = _.toArray(groupedDate);
                return Promise.each(arrGrpDate, function (rowDate){
                    layoutTemplate[rowDate[0].doneDateFormated] = [];
                }).then(function(){
                    var arrResult = _.toArray(timelineResQry);
                    return Promise.each(arrResult, function (rowTimeline) {
                        layoutTemplate[rowTimeline.doneDateFormated].push({
                            "tanggalSelesai" : rowTimeline.tanggalSelesai,
                            "jenis": rowTimeline.jenis,
                            "nama":rowTimeline.nama,
                            "divisi":rowTimeline.divisi,
                            "tanggalBuat":rowTimeline.tanggalBuat,
                            "assign":rowTimeline.assign,
                            "status":rowTimeline.status,
                            "idLaporan":rowTimeline.idlaporan,
                            "detail":rowTimeline.detail
                        });
                    }).then(function(){
                        //console.log(layoutTemplate);
                        res.render('admin-timeline', {
                            layout: "admin",
                            layoutTemplate: layoutTemplate
                        });
                    });
                });
            }).catch(function (error) {
                //logs out the error
                console.error(error);
            });
    //}

});

module.exports = router;