var express     = require('express');
var router      = express.Router();
var _           = require('lodash');
var mysql       = require('promise-mysql');
var Promise     = require('bluebird');
var moment      = require('moment');

var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

//source : http://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
var db_config = {
    host         : '1.1.1.200',
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
    var layoutAntrian = [];
    var layoutPekerja = {};
    laporanConn.query("select * from laporan order by noantrian")
        .then(function(rowResult) {
            //console.log(result);
            var promiseAntrian = new Promise(function (resolve, reject) {
                resolve(_.filter(rowResult, function(row){
                    return (row.status == "On Queue" && row.resolve == 'FALSE' && row.assign == 'open')
                }));
            });
            promiseAntrian.then(function(result) {
                Object.keys(result).forEach(function(key) {
                    layoutAntrian[key] = {
                        "noAntrian" : result[key].noantrian,
                        "jenis": result[key].jenis,
                        "nama":result[key].nama,
                        "divisi":result[key].divisi,
                        "tanggalBuat":result[key].tanggalBuat};
                });

                return Promise.all(layoutAntrian)
                    .then(function(a){
                        var promisePekerja = new Promise(function (resolve, reject) {
                            resolve(_.filter(rowResult, function(row) {
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
                                                    "assign":rowPekerja.assign,
                                                    "status":rowPekerja.status
                                                };
                                            }).then(function(b){
                                                console.log(layoutPekerja);
                                                res.render('index', {
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
});

/* GET lapor page. */
router.get('/lapor', function(req, res, next) {
  res.render('lapor');
});

/* POST lapor page. */
router.post('/lapor', function(req, res, next) {
    var arrayQueryValue = [];

    var postInputData = req.body.lapor || {};

    laporanConn.query("select max(noantrian) noantrian from laporan limit 1")
        .then(function(result) {
            var nama = postInputData.nama;
            var divisi = postInputData.divisi;
            var jenis = postInputData.jenis;
            var detail = postInputData.detail;
            var status = "On Queue";
            var noantrian = _.isNull(result[0].noantrian)? 1 : parseInt(result[0].noantrian) + 1;
            var tanggalMulai = dateNow;

            console.log(nama);

            //laporan: idlaporan, noantrian, nama, divisi, jenis, detail. status, resolve, tanggalBuat
            arrayQueryValue.push([noantrian, nama, divisi, jenis, detail, status, dateNow]);
            var queryString = "INSERT INTO db_portal_it.laporan " +
                "(noantrian, nama, divisi, jenis, detail, status, tanggalBuat) " +
                "VALUES ?";

            return laporanConn.query(queryString, [arrayQueryValue])
                .then(function (queryResult) {
                        res.render('lapor', {
                            layout: 'main',
                            message: "Permintaan berhasil dibuat.. Nomor Antrian anda "+ noantrian +" .. Silahkan lihat antrian anda di Halaman Home.."
                        });
                    }).catch(function (error) {
                        //logs out the error
                        console.error(error);
                    });
    }).catch(function (error) {
        //logs out the error
        console.error(error);
    });

});

module.exports = router;
