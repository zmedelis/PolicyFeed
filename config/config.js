module.shared = true;

import("fs");

var ROOT_DIR = fs.absolute(module.directory + "../");

exports.httpConfig = {
    staticDir: ROOT_DIR + '/static/'
};

exports.urls = [
    // docs:
    [ /(docs\/\d\d\d\d\/\d\d\/\d\d\/\d+)\.(json)/,  "PolicyFeed", "showDocumentFormat" ],
    [ /(docs\/\d\d\d\d\/\d\d\/\d\d\/\d+)/,          "PolicyFeed", "showDocument" ],
    [ /docs\/(\d\d\d\d\/\d\d\/\d\d)/,               "PolicyFeed", "showDay" ],
    [ /docs\/(\d\d\d\d\/\d\d)/,                     "PolicyFeed", "showMonth" ],
    [ /docs\/(\d\d\d\d)/,                           "PolicyFeed", "showYear" ],

    [ /docs\/search/,           "PolicyFeed", "search" ],
    [ /docs\/rss/,              "PolicyFeed", "showRss" ],
    [ /docs\/?$/,               "PolicyFeed", "showDocumentList" ],

    // static pages:
    [ /pages\/(.+)/,            "KaVeikiaValdzia/Site", "showPage" ],

    // Default mapping by request parameters. See: ctl/WebMapper.mapRequest().
    [ /.*/, 'ctl/WebMapper'] 
];

/*
exports.middleware = [
    'ringo/middleware/gzip',
    'ringo/middleware/etag',
    'ringo/middleware/responselog',
    'ringo/middleware/error',
    'ringo/middleware/notfound'
    // 'ringo/middleware/profiler'
];
//*/

// the JSGI app
exports.app = require('ringo/webapp').handleRequest;

/*
exports.macros = [
    './helpers',
    'ringo/skin/macros',
    'ringo/skin/filters'
];
*/

exports.charset = 'UTF-8';
exports.contentType = 'text/html';



// --- Gluestick constants: ---

var WEB_DIR = ROOT_DIR;
var WEB_URL = "";
exports.WEB_DIR = ROOT_DIR;
exports.WEB_URL = WEB_URL;

exports.FILES_DIR = WEB_DIR + "/static/files";
exports.FILES_URL = WEB_URL + "/static/files";
exports.UPLOADS_DIR = WEB_DIR + "/static/uploads";
exports.UPLOADS_URL = WEB_URL + "/static/uploads";

exports.CONFIG_DIR = WEB_DIR + "/config";
exports.DATA_DIR = WEB_DIR + "/data";
exports.LIB_DIR = WEB_DIR + "/lib";
exports.PACKAGES_DIR = exports.LIB_DIR + "/packages";
exports.MODULES_DIR = WEB_DIR + "/modules";


// --- Gluestick config: ---

exports.gluestick = {
    interfaces: {
        DB: "ctl/DB/Sqlite",
        DB_old: "ctl/DB/MySQL",
        DB_urls: "ctl/DB/Sqlite",
        Events: "ctl/Events",
        Site: "KaVeikiaValdzia/Site",
        WebMapper: "ctl/WebMapper"
    }
};

// --- Interface config: ---

exports.DB = {
    filename: exports.DATA_DIR + "/default.sqlite3",
};

exports.DB_urls = {
    filename: exports.DATA_DIR + "/policyfeed_urls.sqlite3"
};

exports.DB_old = {
    host: "localhost",
    db_name: "govsrvr",
    user: "root",
    password: "",
    useUnicode: "yes",
    characterEncoding: "UTF-8"
};

exports.Events = {
    callbacks: [
        [ /./,                                  "ctl/Events/Logger:logEvent" ],
        [ /(debug|error|warning)/,                    "ctl/Events/ShellWriter:printEvent" ]
    ]
};


exports.WebMapper = {
    default_call: "Site:showIndex",
    allowed: [
        "Site",
        "PolicyFeed",
        "PolicyFeed/Calendar",
        "PolicyFeed/Comments"
    ]
};


// --- Module config: ---


exports.PolicyFeed = {
    Crawler: {
        parser_dir: exports.MODULES_DIR + "/KaVeikiaValdzia/Parsers",
        parser_prefix: "KaVeikiaValdzia/Parsers/"
    },
    UrlErrors: {
        to: "policyfeed-errors@mailinator.com",
        from: "policyfeed@localhost",
        subject: "PolicyFeed/UrlErrors status"
    }
};

