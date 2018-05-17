var express             = require('express');
var router              = express.Router();
var _                   = require('lodash');
var mysql               = require('promise-mysql');
var Promise             = require('bluebird');
var moment              = require('moment');

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

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function capitalizeFirstLetter(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function addedSlaByDays(date,sla) {
    var addSla;
    var numDay = moment(date).format("E");
    if (numDay == 5 || numDay == 6){
        addSla = 2;
    }else if (numDay == 7){
        addSla = 1;
    }else{
        addSla = 0;
    }
    var added = (addSla + sla);
    var dateAdd = moment().add(added,'d');

    addSla = moment(dateAdd).format("YYYY-MM-DD HH:mm:ss");

    return addSla;
}

function translateJenis(jenis, callback) {
    var result;
    laporanConn.query("select * from jenis where idjenis = '"+ jenis +"'")
        .then(function(rowResult) {
            if (!_.isEmpty(rowResult)){
                result = jenis;
            }else{
                result = rowResult.nama;
            }
            //console.log(rowResult[0].nama);
            callback(result);
        });
}

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
    //console.log("tanggal = "+moment());
    //console.log("moment(dueDate).subtract(1,'d') = "+moment().subtract(1,'d'));
    //console.log("moment(tanggal).add(1,'d') = "+moment().add(1,'d'));
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    var dateNowStart = moment().format("YYYY-MM-DD 00:00:00");
    var dateNowEnd = moment().format("YYYY-MM-DD 23:59:59");
    var layoutAntrian = [];
    var layoutPekerja = {};

    laporanConn.query("select *, laporan.nama nama, laporan.status status, jenis.nama namaJenis, jenis.status statusJenis from laporan left join jenis on laporan.jenis = jenis.idjenis order by laporan.noantrian")
        .then(function(rowResult) {
            //console.log(rowResult);
            var promiseAntrian = new Promise(function (resolve, reject) {
                resolve(_.filter(rowResult, function(row){
                    return (row.status == "On Queue" && row.resolve == 'FALSE' && row.assign == 'open')
                }));
            });
            promiseAntrian.then(function(result) {
                Object.keys(result).forEach(function(key) {
                    layoutAntrian[key] = {
                        "noAntrian" : result[key].noantrian,
                        "idLaporan" : result[key].idlaporan,
                        "jenis": (!_.isEmpty(result[key].namaJenis))?result[key].namaJenis:result[key].jenis,
                        "nama":result[key].nama,
                        "divisi":result[key].divisi,
                        "tanggalBuat":result[key].tanggalBuat,
                        "tanggalBatas":result[key].tanggalBatas,
                        "detail":result[key].detail,
                        "warna": warnaAntrian(result[key].tanggalBuat, result[key].tanggalBatas)};
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
                            laporanConn.query("select nama,division from admin where nama != 'Oby Sumampouw' order by nama")
                                .then(function(adminResult) {
                                    var groupedAssign = _.groupBy(adminResult, 'nama');
                                    var arrGrpAssign = _.toArray(groupedAssign);
                                    var groupedPriv = _.groupBy(adminResult, 'division');
                                    var arrGrpPriv = _.toArray(groupedPriv);
                                    return Promise.each(arrGrpPriv, function (rowPriv){
                                        layoutPekerja[rowPriv[0].division] = {};
                                    }).then(function(){
                                        return Promise.each(arrGrpAssign, function (rowAssign){
                                            layoutPekerja[rowAssign[0].division][rowAssign[0].nama] = {};
                                        }).then(function(){
                                            var arrNoAntrian = _.toArray(resultPekerja);
                                            //console.log(layoutPekerja);
                                            return Promise.each(arrNoAntrian, function (rowNoAntrian) {
                                                if(!_.isUndefined(layoutPekerja['1'][rowNoAntrian.assign])) {
                                                    layoutPekerja['1'][rowNoAntrian.assign][rowNoAntrian.noantrian] = {};
                                                }else{
                                                    layoutPekerja['2'][rowNoAntrian.assign][rowNoAntrian.noantrian] = {};
                                                }
                                            }).then(function(){
                                                var arrPekerja = _.toArray(resultPekerja);
                                                //console.log(resultPekerja);
                                                return Promise.each(arrPekerja, function (rowPekerja){

                                                    if(!_.isUndefined(layoutPekerja['1'][rowPekerja.assign])) {
                                                        layoutPekerja['1'][rowPekerja.assign][rowPekerja.noantrian] = {
                                                            "noAntrian": rowPekerja.noantrian,
                                                            "idLaporan": rowPekerja.idlaporan,
                                                            "jenis": (!_.isEmpty(rowPekerja.namaJenis))?rowPekerja.namaJenis:rowPekerja.jenis,
                                                            "nama": rowPekerja.nama,
                                                            "divisi": rowPekerja.divisi,
                                                            "tanggalBuat": rowPekerja.tanggalBuat,
                                                            "tanggalBatas": rowPekerja.tanggalBatas,
                                                            "assign": rowPekerja.assign,
                                                            "status": rowPekerja.status,
                                                            "detail": rowPekerja.detail,
                                                            "catatan": rowPekerja.catatan,
                                                            "warna": warnaAntrian(rowPekerja.tanggalBuat,rowPekerja.tanggalBatas)
                                                        };
                                                    }else{
                                                        layoutPekerja['2'][rowPekerja.assign][rowPekerja.noantrian] = {
                                                            "noAntrian" : rowPekerja.noantrian,
                                                            "idLaporan" : rowPekerja.idlaporan,
                                                            "jenis": (!_.isEmpty(rowPekerja.namaJenis))?rowPekerja.namaJenis:rowPekerja.jenis,
                                                            "nama":rowPekerja.nama,
                                                            "divisi":rowPekerja.divisi,
                                                            "tanggalBuat":rowPekerja.tanggalBuat,
                                                            "tanggalBatas":rowPekerja.tanggalBatas,
                                                            "assign":rowPekerja.assign,
                                                            "status":rowPekerja.status,
                                                            "detail":rowPekerja.detail,
                                                            "catatan":rowPekerja.catatan,
                                                            "warna": warnaAntrian(rowPekerja.tanggalBuat, rowPekerja.tanggalBatas)};
                                                    }
                                                    //console.log(warnaAntrian(rowPekerja.tanggalBuat));
                                                }).then(function(b){
                                                    var layoutWorkflow = {};
                                                    var timelineQry= "SELECT *, DATE_FORMAT(tanggalSelesai, '%e %b %Y') doneDateFormated FROM laporan WHERE tanggalSelesai between '"+dateNowStart+"' AND '"+dateNowEnd+"' AND status = 'Done' AND resolve ='TRUE' ORDER BY tanggalSelesai DESC ";
                                                    //console.log(timelineQry);
                                                    laporanConn.query(timelineQry)
                                                        .then(function(timelineResQry) {
                                                            var groupedDate = _.groupBy(timelineResQry, 'doneDateFormated');
                                                            var arrGrpDate = _.toArray(groupedDate);
                                                            return Promise.each(arrGrpDate, function (rowDate){
                                                                layoutWorkflow[rowDate[0].doneDateFormated] = [];
                                                            }).then(function(){
                                                                var arrResult = _.toArray(timelineResQry);
                                                                return Promise.each(arrResult, function (rowTimeline) {
                                                                    layoutWorkflow[rowTimeline.doneDateFormated].push({
                                                                        "tanggalSelesai" : rowTimeline.tanggalSelesai,
                                                                        "jenis": (!_.isEmpty(rowTimeline.namaJenis))?rowTimeline.namaJenis:rowTimeline.jenis,
                                                                        "nama":rowTimeline.nama,
                                                                        "divisi":rowTimeline.divisi,
                                                                        "tanggalBuat":rowTimeline.tanggalBuat,
                                                                        "tanggalBatas":rowTimeline.tanggalBatas,
                                                                        "assign":rowTimeline.assign,
                                                                        "status":rowTimeline.status,
                                                                        "idLaporan":rowTimeline.idlaporan,
                                                                        "detail":rowTimeline.detail
                                                                    });
                                                                }).then(function(){
                                                                    //console.log(layoutPekerja);
                                                                    res.render('index', {
                                                                        layoutTemplate: a,
                                                                        layoutPekerja: layoutPekerja,
                                                                        layoutWorkFlow: layoutWorkflow
                                                                    });
                                                                });
                                                            });
                                                        });
                                                })
                                            });
                                        });
                                    });
                                });
                        });
                    });
            });
        });
});

/* GET lapor page. */
router.get('/lapor', function(req, res, next) {
    //var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    //console.log(addedSlaByDays(moment(), 3));
    laporanConn.query("select * from jenis where status = 'main'")
        .then(function(result) {
            res.render('lapor',{
                layout: 'main',
                jenis: result
            });

        });
});

/* POST lapor page. */
router.post('/lapor', function(req, res, next) {
    var dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    var arrayQueryValue = [];
    var nama = "";
    var divisi = "";
    var jenis = "";
    var detail = "";
    var status = "";
    var noantrian = "";
    var queryString = "";
    var lokasi = "";
    var lantai = "";

    var postLapor = req.body.lapor || {};

    laporanConn.query("select max(noantrian) noantrian from laporan where resolve = 'FALSE' AND status != 'Done' limit 1")
        .then(function(result) {
            if (req.body.laporsubmit == "newMember"){
                //EXAMPLE RESULT
                //{
                //   lapor:{
                //    jenis: 'Permintaan Perlengkapan & Akses Login Anak Baru',
                //    nama: 'Masian yang paling ganteng',
                //    divisi: 'CS'
                //   },
                //    detail:
                //        [ { nama: 'asdasd',
                //            email: 'asdasda@dsadsadasd.com',
                //            divsi: 'sadfsads',
                //            jabatan: 'sadasd',
                //            akses: [Array],
                //            salesCode: 'sfsdf',
                //            zohoRole: 'dsfsdfsdf',
                //            portalRole: 'sdfdsf',
                //            catatan: 'sdfsdf' },
                //            { nama: 'sdfsdf',
                //                email: 'sdfsdfdsf@cermati.com',
                //                divsi: 'dsfdsfsd',
                //                jabatan: 'fdsfdsfsd',
                //                akses: [Array],
                //                catatan: 'adssadasdas das das da sda'}
                //        ],
                //     laporsubmit: 'Kirim'
                //}

                var postDetail = req.body.detail || {};
                nama = capitalizeFirstLetter(postLapor.nama) || {};
                divisi = postLapor.divisi || {};
                jenis = postLapor.jenis || {};
                status = "On Queue";
                noantrian = _.isNull(result[0].noantrian)? 1 : parseInt(result[0].noantrian) + 1;
                var num = 0;

                return Promise.each(postDetail, function (rowDetail) {
                    var rowDetailAkses = !_.isNull(rowDetail.akses)?rowDetail.akses.toString() : "";
                    var detailTextIT  = "Nama Anak : "+ capitalizeFirstLetter(rowDetail.nama) +"\r\n" +
                        "Email Pribadi : "+ rowDetail.email.toLowerCase() +"\r\n" +
                        "Divisi Anak : "+ rowDetail.divisi +"\r\n" +
                        "Jabatan Anak : "+ rowDetail.jabatan +"\r\n" +
                        "Kebutuhan Akses : "+ rowDetailAkses +"\r\n" +
                        "Salescode : "+ rowDetail.salesCode +"\r\n" +
                        "Zoho Role : "+ rowDetail.zohoRole +"\r\n" +
                        "Portal Role : "+ rowDetail.portalRole +"\r\n" +
                        "Catatan Tambahan : "+ rowDetail.catatan +"\r\n\r\n";
                    //arrayDetail.push(JSON.stringify(rowDetail));
                    //arrayDetailIT.push(detailTextIT.toString());

                    var detailTextGA  = "Nama Anak : "+ capitalizeFirstLetter(rowDetail.nama) +"\r\n" +
                        "Email Pribadi : "+ rowDetail.email.toLowerCase() +"\r\n" +
                        "Divisi Anak : "+ rowDetail.divisi +"\r\n" +
                        "Jabatan Anak : "+ rowDetail.jabatan +"\r\n" +
                        "Catatan Tambahan : "+ rowDetail.catatan +"\r\n\r\n";
                    //arrayDetail.push(JSON.stringify(rowDetail));
                    //arrayDetailGA.push(detailTextGA.toString());

                    arrayQueryValue.push([(noantrian+(num*2)), nama, divisi, "Permintaan Perlengkapan Anak Baru", detailTextGA,status, dateNow, addedSlaByDays(moment(), 3)]);
                    arrayQueryValue.push([((noantrian+(num*2))+1), nama, divisi, "Permintaan Akses Login Anak Baru", detailTextIT,status, dateNow, addedSlaByDays(moment(), 3)]);

                    num++;
                }).then(function () {
                    //laporan: idlaporan, noantrian, nama, divisi, jenis, detail. status, resolve, tanggalBuat
                    queryString = "INSERT INTO db_portal_it.laporan " +
                        "(noantrian, nama, divisi, jenis, detail, status, tanggalBuat, tanggalBatas) " +
                        "VALUES ?";

                    //console.log(arrayQueryValue);

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

                });

            }else if (req.body.laporsubmit == "resign"){
                nama = capitalizeFirstLetter(postLapor.nama);
                divisi = postLapor.divisi;
                jenis = postLapor.jenis;
                detail = postLapor.detail;
                status = "On Queue";
                noantrian = _.isNull(result[0].noantrian)? 1 : parseInt(result[0].noantrian) + 1;

                //laporan: idlaporan, noantrian, nama, divisi, jenis, detail. status, resolve, tanggalBuat
                arrayQueryValue.push([noantrian, nama, divisi, "Permohonan Tarik Perangkat", detail,status, dateNow, addedSlaByDays(moment(), 2)]);
                arrayQueryValue.push([(noantrian+1), nama, divisi, "Permohonan Hapus Akses (resign)", detail,status, dateNow, addedSlaByDays(moment(), 2)]);
                queryString = "INSERT INTO db_portal_it.laporan " +
                    "(noantrian, nama, divisi, jenis, detail, status, tanggalBuat, tanggalBatas) " +
                    "VALUES ?";

                //console.log(arrayQueryValue);

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
            }else if (req.body.laporsubmit == "other"){
                nama = capitalizeFirstLetter(postLapor.nama);
                divisi = postLapor.divisi;
                jenis = postLapor.jenis;
                lokasi = postLapor.lokasi;
                lantai = postLapor.lantai;
                detail = "Lokasi = "+lokasi+", lantai "+lantai+"\r\nDetail Permintaan = "+postLapor.detail;
                status = "On Queue";
                noantrian = _.isNull(result[0].noantrian)? 1 : parseInt(result[0].noantrian) + 1;

                //laporan: idlaporan, noantrian, nama, divisi, jenis, detail. status, resolve, tanggalBuat
                arrayQueryValue.push([noantrian, nama, divisi, jenis, detail,status, dateNow, addedSlaByDays(moment(), 3)]);
                queryString = "INSERT INTO db_portal_it.laporan " +
                    "(noantrian, nama, divisi, jenis, detail, status, tanggalBuat, tanggalBatas) " +
                    "VALUES ?";

                //console.log(arrayQueryValue);

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
            }else if (req.body.laporsubmit == "lastOther"){
                nama = capitalizeFirstLetter(postLapor.nama);
                divisi = postLapor.divisi;
                jenis = postLapor.jenis;
                lokasi = postLapor.lokasi;
                lantai = postLapor.lantai;
                detail = "Lokasi = "+lokasi+", lantai "+lantai+"\r\nDetail Permintaan = "+postLapor.detail;
                status = "On Queue";
                noantrian = _.isNull(result[0].noantrian)? 1 : parseInt(result[0].noantrian) + 1;

                //laporan: idlaporan, noantrian, nama, divisi, jenis, detail. status, resolve, tanggalBuat
                arrayQueryValue.push([noantrian, nama, divisi, jenis, detail,status, dateNow, addedSlaByDays(moment(), 7)]);
                queryString = "INSERT INTO db_portal_it.laporan " +
                    "(noantrian, nama, divisi, jenis, detail, status, tanggalBuat, tanggalBatas) " +
                    "VALUES ?";

                //console.log(arrayQueryValue);

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
            }
        }).catch(function (error) {
            //logs out the error
            console.error(error);
        });

});

module.exports = router;
