var moment          = require('moment');
var _               = require('lodash');
var Handlebars      = require('handlebars');
var crypto          = require('crypto');

exports.fullDate = function (date) {
    var parse = "";
    if(_.isDate(date)){
        parse = moment(date).format("YYYY-MM-DD");
    }else{
        parse = "-";
    }

    return parse;
};

exports.dateTime = function (date) {
    var parse = "";
    if(_.isDate(date)){
        parse = moment(date).format("YYYY-MM-DD HH:mm:ss");
    }else{
        parse = "-";
    }

    return parse;
};

exports.materializeDate = function (date) {
    var parse = "";
    if(_.isDate(date)){
        parse = moment(date).format("DD MMMM, YYYY");
    }else{
        parse = "-";
    }

    return parse;
};

exports.numbyIndex = function (index) {
    var parse = "";
    parse = parseInt(index) + 1;

    return parse;
};

exports.joinTextOutbox = function(textOutbox, textOutboxMultipart) {
    var joinText = "";
    if(textOutboxMultipart) {
        joinText = textOutbox + "" + textOutboxMultipart;
    }else{
        joinText = textOutbox;
    }
    return joinText;
};

exports.section = function(name, options){
    if(!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
};

exports.joinText = function(a, b){
    var joinRes = "";
    if(_.isEmpty(a) || _.isEmpty(b) ||  _.isNull(a) || _.isNull(b)){
        joinRes = "";
    }else{
        joinRes = a+" ("+b+")";
    }
    return joinRes;
};

exports.joinTextUserInventory = function(a, b){
    var joinRes = "";
    if(_.isEmpty(a) || _.isNull(a) || a == '0') {
        joinRes = "Stock";
    }else if(_.isEmpty(b) || _.isNull(b)) {
        joinRes = a+" ( - )";
    }else{
        joinRes = a+" ("+b+")";
    }
    return joinRes;
};

exports.parseUntuk = function(untuk){
    var parse = "";
    if (untuk == '1'){
        parse = "Kedoya";
    }else if (untuk == '2') {
        parse = "Biak"
    }else{
        parse = "Other"
    }
    return parse;
};

exports.parsePrivilege = function(priv){
    var parse = "";
    if (priv == '1'){
        parse = "Administrator";
    }else if (priv == '2') {
        parse = "User"
    }else{
        parse = "Error"
    }
    return parse;
};

exports.parsePrivilegeLapor = function(priv){
    var parse = "";
    if (priv == '1'){
        parse = "Administrator";
    }else if (priv == '0') {
        parse = "Operator"
    }else{
        parse = "Error"
    }
    return parse;
};

exports.parseJabatan = function(division){
    var parse = "";
    if (division == '1'){
        parse = "IT Support";
    }else if (division == '2') {
        parse = "General Affair"
    }else{
        parse = "Error"
    }
    return parse;
};

exports.parseStatus = function(status) {
    var parse = "";
    switch (status) {
        case 'SendingOK':
            parse = "Success";
            break;
        case 'SendingOKNoReport':
            parse = "Success";
            break;
        case 'SendingError':
            parse = "Failed";
            break;
        case 'DeliveryOK':
            parse = "Failed";
            break;
        case 'DeliveryFailed':
            parse = "Failed";
            break;
        case 'DeliveryPending':
            parse = "Failed";
            break;
        case 'DeliveryUnknown':
            parse = "Success";
            break;
        case 'Error':
            parse = "Failed";
            break;
        default:
            parse = "status error";
            break;
    }

    return parse;
};

exports.parseCategory = function(id) {
    var parse = "";
    switch (id) {
        case '1':
            parse = "Laptop";
            break;
        case '2':
            parse = "Adaptor";
            break;
        case '3':
            parse = "Mouse";
            break;
        case '4':
            parse = "Headset";
            break;
        case '5':
            parse = "Keyboard";
            break;
        case '6':
            parse = "Monitor";
            break;
        default:
            parse = "category error";
            break;
    }

    return parse;
};

exports.nl2br = function(str, is_xhtml){
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br/>' : '<br>';
    return decodeURIComponent((str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2'));
};

exports.sums = function(a,b){
    return currencyFormatter.format(_.sumBy(a, b), { code: 'IDR' });
};

exports.breakLine = function(text){
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
};

exports.zeroOrNumber = function (number) {
    var parse = "";
    if(_.isNull(number)){
        parse = 0;
    }else{
        parse = number;
    }

    return parse;
};

exports.stripForNull = function (string) {
    var parse = "";
    if(_.isNull(string) || _.isEmpty(string)){
        parse = "-";
    }else{
        parse = string;
    }

    return parse;
};

exports.compare = function (lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    };

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

};

exports.equal = function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

exports.isEmpty = function(value, options) {
    if(_.isEmpty(value)) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

exports.decrypt = function (password) {
    //console.log(password);
    var mykeydec = crypto.createDecipher('aes-128-cbc', 'Cermat123hebat');
    var mystrdec = mykeydec.update(password, 'hex', 'utf8');
    mystrdec += mykeydec.final('utf8');
    //console.log(mystrdec);

    return mystrdec;
};