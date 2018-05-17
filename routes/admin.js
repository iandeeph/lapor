var express     = require('express');
var router      = express.Router();
var _           = require('lodash');
var mysql       = require('promise-mysql');
var Promise     = require('bluebird');
var moment      = require('moment');
var humanizeDuration = require('humanize-duration');

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

function warnaAntrian(tanggal, dueDate){
    var hMin1 = "";
    var hMin2 = "";
    var color = "";
    if (dueDate != "0000-00-00 00:00:00"){
        hMin1 = moment(dueDate).subtract(1,'d');
        hMin2 = moment(dueDate).subtract(2,'d');
    }else{
        hMin1 = moment(tanggal).add(1,'d');
        hMin2 = moment(tanggal).add(2,'d');
    }
    //console.log("tanggal = "+moment(tanggal));
    //console.log("hMin1 = "+hMin1);
    //console.log("hMin2 = "+hMin2);
    if(moment() < hMin1){
        color = "green darken-3";
    }else if(moment() >= hMin1 && moment() < hMin2){
        color = "orange"
    }else if(moment() >= hMin2){
        color = "red"
    }else{
        color = "grey"
    }

    return color;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        var layoutAntrian = [];
        var layoutPekerja = {};
        var loginUser = req.session.name;
        var loginRole = req.session.role;
        var privUser = req.session.priv;
        var classification;
        var color = "";
        var jenisWarna = "";

        function warnaJenis(jenis) {
            if(jenis == "Permintaan Perlengkapan Anak Baru" || jenis == "Informasi Anak Resign"){
                jenisWarna = ""
            }else{
                jenisWarna = "grey lighten-2"
            }

            return jenisWarna;
        }
        laporanConn.query("SELECT *, laporan.nama nama, jenis.nama namaJenis, laporan.status status, jenis.status statusJenis, DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated " +
            "FROM laporan left join admin on laporan.assign = admin.nama left join jenis on laporan.jenis = jenis.idjenis order by laporan.noantrian")
            .then(function (result) {
                //console.log(result);
                var resultPromise = new Promise(function (resolve, reject) {
                    resolve(_.filter(result, {'status':'On Queue', 'resolve':'FALSE', 'assign':'open'}));
                });

                resultPromise.then(function(antrianItem) {
                    //console.log(antrianItem);
                    Object.keys(antrianItem).forEach(function (key) {
                        if((antrianItem[key].jenis == "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis == "Permintaan Perlengkapan Anak Baru" || antrianItem[key].jenis == "Informasi Anak Resign") && privUser == "2"){
                            classification = "1";
                        }else if((antrianItem[key].jenis == "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis == "Permintaan Perlengkapan Anak Baru" || antrianItem[key].jenis == "Informasi Anak Resign") && privUser == "1"){
                            classification = "2";
                        }else if((antrianItem[key].jenis != "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis != "Permintaan Perlengkapan Anak Baru" || antrianItem[key].jenis != "Informasi Anak Resign") && privUser == "2"){
                            classification = "2";
                        }else if((antrianItem[key].jenis != "Permintaan Perlengkapan & Akses Login Anak Baru" || antrianItem[key].jenis != "Permintaan Perlengkapan Anak Baru" || antrianItem[key].jenis != "Informasi Anak Resign") && privUser == "1"){
                            classification = "1";
                        }

                        layoutAntrian[key] = {
                            "noAntrian": antrianItem[key].noantrian,
                            "jenis": (!_.isEmpty(antrianItem[key].namaJenis))?antrianItem[key].namaJenis:antrianItem[key].jenis,
                            "nama": antrianItem[key].nama,
                            "divisi": antrianItem[key].divisi,
                            "tanggalBuat": antrianItem[key].tanggalBuat,
                            "tanggalBatas": antrianItem[key].tanggalBatas,
                            "detail" : antrianItem[key].detail,
                            "idLaporan" : antrianItem[key].idlaporan,
                            "warna" : warnaAntrian(antrianItem[key].tanggalBuat, antrianItem[key].tanggalBatas),
                            "warnaJenis" : warnaJenis(antrianItem[key].jenis),
                            "loginRole":loginRole,
                            "classification" : classification
                        };
                    });

                    return Promise.all(layoutAntrian)
                        .then(function (a) {
                            //console.log(layoutAntrian);
                            var promisePekerja = new Promise(function (resolve, reject) {
                                resolve(_.filter(result, function(row) {
                                    //return (row.status != "On Queue" && !row.resolve && row.assign != 'open')
                                    return (row.status != "On Queue" && row.assign != 'open' && row.resolve != "TRUE" && row.assign != 'Oby Sumampouw')
                                }));
                            });
                            promisePekerja.then(function(resultPekerja) {
                                //console.log(resultPekerja);
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
                                                        "jenis": (!_.isEmpty(rowPekerja.namaJenis))?rowPekerja.namaJenis:rowPekerja.jenis,
                                                        "nama":rowPekerja.nama,
                                                        "divisi":rowPekerja.divisi,
                                                        "tanggalBuat":rowPekerja.tanggalBuat,
                                                        "tanggalBatas":rowPekerja.tanggalBatas,
                                                        "warna":warnaAntrian(rowPekerja.tanggalBuat, rowPekerja.tanggalBatas),
                                                        "assign":rowPekerja.assign,
                                                        "role":rowPekerja.role,
                                                        "catatan":rowPekerja.catatan,
                                                        "status":rowPekerja.status,
                                                        "idLaporan":rowPekerja.idlaporan,
                                                        "detail":rowPekerja.detail,
                                                        "loginRole":loginRole,
                                                        "loginUser":loginUser
                                                    };
                                                }).then(function(b){
                                                    //console.log(layoutPekerja);
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
        var jenis = req.body.jenis || {};
        var laporUpdate = req.body.laporStatus || {};
        var laporDueDate = moment(new Date(req.body.laporDueDate)).format("YYYY-MM-DD 12:00:00") || {};
        if(laporsubmit == "kerjakan"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'On Doing', " +
                "assign = '"+loginUser+"', " +
                "tanggalAssign = '"+dateNow+"' " +
                "WHERE idlaporan = '"+idKerjakan+"' ";
        }else if(laporsubmit == "selesai"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "status = 'Done', " +
                "resolve = 'TRUE', " +
                "tanggalSelesai = '"+dateNow+"' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        //}else if(laporsubmit == "selesai" && idAssign == "1"){
        //    updateQry = "UPDATE db_portal_it.laporan SET " +
        //        "status = 'Done', " +
        //        "resolve = 'TRUE', " +
        //        "tanggalSelesai = '"+dateNow+"' " +
        //        "WHERE idlaporan = '"+idLaporan+"' ";
        //}else if(laporsubmit == "selesai" && idAssign == "2" && jenis != "Permintaan Pergantian Perangkat (mouse rusak, laptop error, dll)"){
        //    updateQry = "UPDATE db_portal_it.laporan SET " +
        //        "status = 'Done' " +
        //        "WHERE idlaporan = '"+idLaporan+"' ";
        //}else if(laporsubmit == "selesai" && idAssign == "2" && jenis == "Permintaan Pergantian Perangkat (mouse rusak, laptop error, dll)"){
        //    updateQry = "UPDATE db_portal_it.laporan SET " +
        //        "status = 'Done', " +
        //        "resolve = 'TRUE', " +
        //        "tanggalSelesai = '"+dateNow+"' " +
        //        "WHERE idlaporan = '"+idLaporan+"' ";
        }else if(laporsubmit == "update"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "catatan = '"+laporUpdate+"' " +
                "WHERE idlaporan = '"+idLaporan+"' ";
        }else if(laporsubmit == "editDueDate"){
            updateQry = "UPDATE db_portal_it.laporan SET " +
                "tanggalBatas = '"+laporDueDate+"' " +
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
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        var layoutTemplate = {};
        var timelineQry= "SELECT *, laporan.nama nama, jenis.nama namaJenis, laporan.status status, jenis.status statusJenis, DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated " +
            "FROM laporan left join admin on laporan.assign = admin.nama left join jenis on laporan.jenis = jenis.idjenis WHERE laporan.status = 'Done' AND resolve ='TRUE' ORDER BY tanggalSelesai DESC";
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
                            "jenis": (!_.isEmpty(rowTimeline.namaJenis))?rowTimeline.namaJenis:rowTimeline.jenis,
                            "nama":rowTimeline.nama,
                            "divisi":rowTimeline.divisi,
                            "tanggalBuat":rowTimeline.tanggalBuat,
                            "assign":rowTimeline.assign,
                            "division":rowTimeline.division,
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
    }
});

/* GET logout page. */
router.get('/logout', function(req, res) {
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        req.session.destroy(function(err) {
            res.redirect('/portal-auth');
        })
    }
});

/* GET report page. */
router.get('/report', function(req, res) {
    if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
        console.log("Not Logged");
        res.redirect('/portal-auth');
    }else {
        var layoutTemplate = {};
        var timelineQry= "SELECT *, laporan.nama nama, jenis.nama namaJenis, laporan.status status, jenis.status statusJenis, DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated " +
            "FROM laporan left join admin on laporan.assign = admin.nama left join jenis on laporan.jenis = jenis.idjenis WHERE laporan.status = 'Done' AND resolve ='TRUE' ORDER BY assign ASC";
        laporanConn.query(timelineQry)
            .then(function(timelineResQry) {
                var groupedAssign = _.groupBy(timelineResQry, 'assign');
                var arrGrpAssign = _.toArray(groupedAssign);
                var arrResult = _.toArray(timelineResQry);
                var templateLaporan = [];
                //console.log(arrGrpAssign);
                return Promise.each(arrGrpAssign, function (rowName){
                    //console.log(rowName);
                    layoutTemplate[rowName[0].assign] = {};
                }).then(function(){
                    return Promise.each(arrResult, function (rowJenis) {
                        //console.log(rowJenis[0].jenis);
                        layoutTemplate[rowJenis.assign][rowJenis.jenis] = [];
                    }).then(function(){
                        //console.log(layoutTemplate);
                        return Promise.each(arrResult, function (rowTimeline) {
                            //console.log(humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf()));
                            layoutTemplate[rowTimeline.assign][rowTimeline.jenis].push({
                                "point" : 1,
                                "tanggalSelesai" : rowTimeline.tanggalSelesai,
                                "totalWaktuTiket" : moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf(),
                                "totalWaktuPengerjaan" : moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalAssign).valueOf(),
                                "totalWaktuTiketFormated" : humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf(),{
                                    language : 'id',
                                    round: true,
                                    units: ['d', 'h', 'm']

                                }),
                                "totalWaktuPengerjaanFormated" : humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalAssign).valueOf(),{
                                    language : 'id',
                                    round: true,
                                    units: ['d', 'h', 'm']
                                }),
                                "jenis": (!_.isEmpty(rowTimeline.namaJenis))?rowTimeline.namaJenis:rowTimeline.jenis,
                                "nama":rowTimeline.nama,
                                "divisi":rowTimeline.divisi,
                                "tanggalBuat":rowTimeline.tanggalBuat,
                                "tanggalAssign":rowTimeline.tanggalAssign,
                                "assign":rowTimeline.assign,
                                "division":rowTimeline.division,
                                "status":rowTimeline.status,
                                "idLaporan":rowTimeline.idlaporan,
                                "detail":rowTimeline.detail
                            });
                        }).then(function(){
                            for (var assign in layoutTemplate) {
                                if (layoutTemplate.hasOwnProperty(assign)) {
                                    //console.log(assign + " -> " + layoutTemplate[assign]);
                                    for (var item in layoutTemplate[assign]) {
                                        if (layoutTemplate[assign].hasOwnProperty(item)) {
                                            //console.log(_.sumBy(layoutTemplate[assign][item], "totalWaktuTiket"));
                                            templateLaporan.push({
                                                "assign":assign,
                                                "jenis":item,
                                                "jumlah":_.sumBy(layoutTemplate[assign][item], "point"),
                                                "avgTimeTicket":humanizeDuration(_.sumBy(layoutTemplate[assign][item], "totalWaktuTiket")/_.sumBy(layoutTemplate[assign][item], "point"),{
                                                    language : 'id',
                                                    round: true,
                                                    units: ['d', 'h', 'm']
                                                }),
                                                "avgTimeDone":humanizeDuration(_.sumBy(layoutTemplate[assign][item], "totalWaktuPengerjaan")/_.sumBy(layoutTemplate[assign][item], "point"),{
                                                    language : 'id',
                                                    round: true,
                                                    units: ['d', 'h', 'm']
                                                })
                                            })
                                        }
                                    }
                                }
                            }
                        }).then(function(){
                            var timelineQry= "SELECT assign FROM laporan left join admin on laporan.assign = admin.nama WHERE status = 'Done' AND resolve ='TRUE' GROUP BY assign ORDER BY assign ASC";
                            laporanConn.query(timelineQry)
                                .then(function(timelineResQry) {
                                    var arrGrpAssign = _.toArray(timelineResQry);
                                    var assignSelect = {};
                                    assignSelect["Pilih User"] = [];

                                    assignSelect["Pilih User"].push({
                                        'assign' : "Pilih User",
                                        'disabled' : "disabled",
                                        'selected' : 'selected'});
                                    return Promise.each(arrGrpAssign, function (rowAssign){
                                        assignSelect[rowAssign.assign] = [];
                                    }).then(function(){
                                        return Promise.each(arrGrpAssign, function (rowAssign2){
                                            assignSelect[rowAssign2.assign].push({
                                                'assign' : rowAssign2.assign,
                                                'disabled' : "",
                                                'selected' : ''});
                                        }).then(function(){
                                            //console.log(layoutTemplate);
                                            res.render('admin-report', {
                                                layout: "admin",
                                                layoutTemplate: templateLaporan,
                                                groupedAssign: groupedAssign,
                                                assignSelect: assignSelect,
                                                layoutTemplateDetail: layoutTemplate
                                            });
                                        });
                                    });
                                });
                        });
                    });
                });
            }).catch(function (error) {
                //logs out the error
                console.error(error);
            });
    }
});

/* POST report page. */
router.post('/report', function(req, res) {
    //if(_.isUndefined(req.session.login) || req.session.login != 'loged'){
    //    console.log("Not Logged");
    //    res.redirect('/portal-auth');
    //}else {
        var loginUser = req.session.name;
        var postReport = req.body.report;
        var postUser = req.body.report || {};
        var arrPostUser = _.toArray(postUser.user) || {};
        var postStartDate = moment(new Date(req.body.report.start)).format("YYYY-MM-DD 00:00:00") || {};
        var postEndDate = moment(new Date(req.body.report.end)).format("YYYY-MM-DD 23:59:59") || {};
        var filterDate = {
            'start': moment(new Date(postStartDate)).format("DD MMMM, YYYY"),
            'end': moment(new Date(postEndDate)).format("DD MMMM, YYYY")
        };
        var layoutTemplate = {};
        var assignQuery = [];
        //console.log(postUser);
        return Promise.each(arrPostUser, function (user){
            assignQuery.push("assign = '"+ user +"'");
        }).then(function(){
        var assignQueryTxt = assignQuery.toString().replace(/,/gi," OR ");
        var timelineQry= "SELECT *, " +
            "laporan.nama nama, " +
            "admin.nama namaAdmin, " +
            "laporan.status status, " +
            "jenis.nama namaJenis, " +
            "jenis.status statusJenis, " +
            "DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated " +
            "FROM " +
            "laporan " +
            "left join " +
            "admin " +
            "on laporan.assign = admin.nama " +
            "left join " +
            "jenis " +
            "on laporan.jenis = jenis.idjenis " +
            "WHERE " +
            "("+assignQueryTxt+") AND " +
            "laporan.status = 'Done' AND " +
            "resolve ='TRUE' AND " +
            "(tanggalAssign between '"+ postStartDate +"' AND '"+ postEndDate +"' OR " +
            "tanggalSelesai between '"+ postStartDate +"' AND '"+ postEndDate +"') " +
            "ORDER BY assign ASC";
        //console.log(timelineQry);
        laporanConn.query(timelineQry)
            .then(function(timelineResQry) {
                var groupedAssign = _.groupBy(timelineResQry, 'assign');
                var groupedJenis = _.groupBy(timelineResQry, 'jenis');
                var arrGrpAssign = _.toArray(groupedAssign);
                var arrGrpJenis = _.toArray(groupedJenis);
                var arrResult = _.toArray(timelineResQry);
                var templateLaporan = [];
                //console.log(arrGrpAssign);
                return Promise.each(arrGrpAssign, function (rowName){
                    //console.log(rowName);
                    layoutTemplate[rowName[0].assign] = {};
                }).then(function(){
                    return Promise.each(arrResult, function (rowJenis) {
                        //console.log(rowJenis[0].jenis);
                        layoutTemplate[rowJenis.assign][rowJenis.jenis] = [];
                    }).then(function(){
                        //console.log(layoutTemplate);
                        return Promise.each(arrResult, function (rowTimeline) {
                            //console.log(humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf()));
                            layoutTemplate[rowTimeline.assign][rowTimeline.jenis].push({
                                "point" : 1,
                                "tanggalSelesai" : rowTimeline.tanggalSelesai,
                                "totalWaktuTiket" : moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf(),
                                "totalWaktuPengerjaan" : moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalAssign).valueOf(),
                                "totalWaktuTiketFormated" : humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalBuat).valueOf(),{
                                    language : 'id',
                                    round: true,
                                    units: ['d', 'h', 'm']

                                }),
                                "totalWaktuPengerjaanFormated" : humanizeDuration(moment(rowTimeline.tanggalSelesai).valueOf() - moment(rowTimeline.tanggalAssign).valueOf(),{
                                    language : 'id',
                                    round: true,
                                    units: ['d', 'h', 'm']
                                }),
                                "jenis": (!_.isEmpty(rowTimeline.namaJenis))?rowTimeline.namaJenis:rowTimeline.jenis,
                                "nama":rowTimeline.nama,
                                "divisi":rowTimeline.divisi,
                                "tanggalBuat":rowTimeline.tanggalBuat,
                                "tanggalAssign":rowTimeline.tanggalAssign,
                                "assign":rowTimeline.assign,
                                "division":rowTimeline.division,
                                "status":rowTimeline.status,
                                "idLaporan":rowTimeline.idlaporan,
                                "detail":rowTimeline.detail
                            });
                        }).then(function(){
                            for (var assign in layoutTemplate) {
                                if (layoutTemplate.hasOwnProperty(assign)) {
                                    //console.log(assign + " -> " + layoutTemplate[assign]);
                                    for (var item in layoutTemplate[assign]) {
                                        if (layoutTemplate[assign].hasOwnProperty(item)) {
                                            //console.log(_.sumBy(layoutTemplate[assign][item], "totalWaktuTiket"));
                                            templateLaporan.push({
                                                "assign":assign,
                                                "jenis":item,
                                                "jumlah":_.sumBy(layoutTemplate[assign][item], "point"),
                                                "avgTimeTicket":humanizeDuration(_.sumBy(layoutTemplate[assign][item], "totalWaktuTiket")/_.sumBy(layoutTemplate[assign][item], "point"),{
                                                    language : 'id',
                                                    round: true,
                                                    units: ['d', 'h', 'm']
                                                }),
                                                "avgTimeDone":humanizeDuration(_.sumBy(layoutTemplate[assign][item], "totalWaktuPengerjaan")/_.sumBy(layoutTemplate[assign][item], "point"),{
                                                    language : 'id',
                                                    round: true,
                                                    units: ['d', 'h', 'm']
                                                })
                                            })
                                        }
                                    }
                                }
                            }
                        }).then(function(){
                            var timelineQry= "SELECT assign FROM laporan left join admin on laporan.assign = admin.nama WHERE status = 'Done' AND resolve ='TRUE' GROUP BY assign ORDER BY assign ASC";
                            laporanConn.query(timelineQry)
                                .then(function(timelineResQry) {
                                    var arrGrpAssign = _.toArray(timelineResQry);
                                    var assignSelect = {};
                                    assignSelect["Pilih User"] = [];

                                    assignSelect["Pilih User"].push({
                                        'assign' : "Pilih User",
                                        'disabled' : "disabled",
                                        'selected' : ''});
                                    return Promise.each(arrGrpAssign, function (rowAssign){
                                        assignSelect[rowAssign.assign] = [];
                                        }).then(function(){
                                        return Promise.each(arrGrpAssign, function (rowAssign2){
                                            var filterUser = _.indexOf(postUser.user, rowAssign2.assign);
                                            //console.log(_.indexOf(postUser.user, rowAssign2.assign));
                                            if(filterUser >=0){
                                                assignSelect[rowAssign2.assign].push({
                                                    'assign' : rowAssign2.assign,
                                                    'disabled' : "",
                                                    'selected' : 'selected'});
                                            }else{
                                                assignSelect[rowAssign2.assign].push({
                                                    'assign' : rowAssign2.assign,
                                                    'disabled' : "",
                                                    'selected' : ''});
                                            }
                                        }).then(function(){
                                            //console.log(assignSelect);
                                            res.render('admin-report', {
                                                layout: "admin",
                                                layoutTemplate: templateLaporan,
                                                groupedAssign: groupedAssign,
                                                postReport: postReport,
                                                filterDate: filterDate,
                                                assignSelect: assignSelect,
                                                layoutTemplateDetail: layoutTemplate
                                            });
                                        });
                                    });
                            });
                        });
                    });
                });
            }).catch(function (error) {
                //logs out the error
                console.error(error);
            });
        });
    //}
});

module.exports = router;