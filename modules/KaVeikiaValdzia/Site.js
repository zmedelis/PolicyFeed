/*
    Copyright 2010 Emilis Dambauskas

    This file is part of KąVeikiaValdžia.lt website.

    KąVeikiaValdžia.lt is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    KąVeikiaValdžia.lt is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with KąVeikiaValdžia.lt.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require("fs");
var PolicyFeed = require("PolicyFeed");


var ctlTemplate = require("ctl/Template");
var ctlRequest = require("ctl/Request");
var WebMapper = require("ctl/WebMapper");

// These get used a lot:
exports.dirname = fs.directory(module.path) + "/Site";


/**
 * Home page of the website.
 */
exports.showIndex = function(req)
{
    return PolicyFeed.showDocumentList(req);
}


/**
 * Main template for the website.
 */
exports.showContent = function(content)
{
    if (typeof(content) == 'string')
        content = { html: content };

    content.title = content.title || "";
    content.links = content.links || this.showBlock("links");

    return ctlTemplate.fetch(this.dirname + "/tpl/showContent.ejs", content);
}


/**
 * Error page for the website.
 */
exports.showError = function(msg)
{
    if (typeof(msg) == 'undefined')
        msg = 404;

    if (typeof(msg) == "number")
        loadObject("WebMapper").status = msg;
    else
        loadObject("WebMapper").status = 501;

    return ctlTemplate.fetch(this.dirname + "/tpl/showError.ejs", { code: code });
}


/**
 * Static pages for the website.
 */
exports.showPage = function(req, name)
{
    print("Site.showPage", name, ctlRequest.getRemoteAddr(req));

    var file_name = this.dirname + "/pages/" + name + ".ejs";

    if (!fs.exists(file_name))
        return WebMapper.returnHtml(this.showError(404));
    else
    {
        return WebMapper.returnHtml(
            this.showContent(
                ctlTemplate.fetchObject( file_name)));
    }
}


/**
 * HTML blocks for the website.
 */
exports.showBlock = function(name)
{
    return ctlTemplate.fetch( this.dirname + "/blocks/" + name + ".ejs" );
}

