/*
    Copyright 2009,2010 Emilis Dambauskas

    HtmlUnit functions for RingoJS.

    HtmlUnit functions is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    HtmlUnit functions is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with HtmlUnit functions.  If not, see <http://www.gnu.org/licenses/>.
*/

module.shared = true;


importClass(com.gargoylesoftware.htmlunit.WebClient,
        com.gargoylesoftware.htmlunit.BrowserVersion,
        com.gargoylesoftware.htmlunit.WebRequestSettings,
        com.gargoylesoftware.htmlunit.StringWebResponse,
        com.gargoylesoftware.htmlunit.TopLevelWindow,
        com.gargoylesoftware.htmlunit.TextUtil,
        com.gargoylesoftware.htmlunit.WebResponseData,
        com.gargoylesoftware.htmlunit.WebResponseImpl,
        com.gargoylesoftware.htmlunit.util.NameValuePair
        );


var web_client = new WebClient(BrowserVersion.FIREFOX_3);
web_client.setActiveXNative(false);
web_client.setAppletEnabled(false);
web_client.setCssEnabled(false);
web_client.setJavaScriptEnabled(false);
web_client.setPopupBlockerEnabled(true);
web_client.setThrowExceptionOnFailingStatusCode(false);

/* This is a workaround for HtmlUnit bug 2952333:
 * https://sourceforge.net/tracker/?func=detail&atid=448266&aid=2952333&group_id=47038
 */
web_client.openWindow(WebClient.URL_ABOUT_BLANK, "do_not_use_this");



/**
 * @return com.gargoylesoftware.htmlunit.WebClient
 */
exports.getWebClient = function()
{
    return web_client;
}


/**
 * @return com.gargoylesoftware.htmlunit.WebWindow
 */
exports.getWindow = function(name)
{
    if (!name)
        name = "default";

    try {
        return web_client.getWebWindowByName(name);
    }
    catch (err)
    {
        if (err.javaException instanceof com.gargoylesoftware.htmlunit.WebWindowNotFoundException)
        {
            // We switch to a blank window to avoid HtmlUnit bug 2952333 (see comment above).
            web_client.setCurrentWindow( web_client.getWebWindowByName("do_not_use_this") );

            return web_client.openWindow(WebClient.URL_ABOUT_BLANK, name);
        }
        else
            throw err;
    }
}


/**
 * @return com.gargoylesoftware.htmlunit.Page
 */
exports.getPage = function(url, window_name)
{
    loadObject("Events").create("htmlunit.getpage-debug", [window_name, url]);

    return web_client.getPage(
            this.getWindow(window_name),
            new WebRequestSettings(java.net.URL(url))
            );
}


/**
 * @return com.gargoylesoftware.htmlunit.Page
 */
exports.getPageFromHtml = function(str, url, window_name, charset)
{
    loadObject("Events").create("htmlunit.getPageFromHtml-debug", [window_name, url, charset]);

    return web_client.loadWebResponseInto(
            this.getWebResponseFromString(str, charset, url),
            this.getWindow(window_name)
            );
}

//----------------------------------------------------------------------------

/**
 * Creates a WebResponse object from given string. Used instead of StringWebResponse, which ignores charset.
 */
exports.getWebResponseFromString = function(str, charset, url)
{
    // Default charset:
    if (!charset)
        charset = "UTF-8";

    var is = TextUtil.toInputStream(str, charset);
    var rh = new java.util.ArrayList();
    rh.add(new NameValuePair("Content-Type", "text/html; charset=" + charset));
    var wrd = new WebResponseData(is, 200, "OK", rh);

    // Default value for url:
    if (!url)
        url = WebClient.URL_ABOUT_BLANK;
    // Set correct type for url:
    if (typeof(url) != "object" || !(url instanceof java.net.URL))
        url = java.net.URL(url);

    var wrs = new WebRequestSettings(java.net.URL(url));

    var wri = new WebResponseImpl(wrd, wrs, 0);

    return wri;
}


/**
 * INTERNAL API. SUBJECT TO CHANGE.
 */
exports.getPageFromWebResponse = function(web_response, window_name)
{
    return web_client.loadWebResponseInto( web_response, this.getWindow(window_name) );
}


/**
 *
 */
exports.setPageCharset = function(page, charset)
{
    if (!charset)
        charset = "UTF-8";

    var meta_tags = page.getByXPath("//meta");
    for (var i=0; i<meta_tags.size(); i++)
    {
        var tag = meta_tags.get(i);
        if (tag.getAttribute("http-equiv").toLowerCase() == "content-type" || tag.getAttribute("name").toLowerCase() == "content-type")
        {
            tag.setAttribute("content", "text/html; charset=" + charset);
        }
    }

    return page;
}


/**
 *
 */
exports.fixPageUrls = function(page) {
    var anchors = page.getAnchors().toArray();

    anchors.map(function (a) {
            if (a.hasAttribute("href"))
                a.setAttribute("href", page.getFullyQualifiedUrl(a.getAttribute("href")).toString());
        });

    var images = page.getByXPath("//img").toArray();

    images.map(function (i) {
            i.setAttribute("src", page.getFullyQualifiedUrl(i.getAttribute("src")).toString());
        });
}

