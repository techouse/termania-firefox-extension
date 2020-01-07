# Termania.net Lookup Firefox Extension

![Mozilla Add-on](https://img.shields.io/amo/v/termania-net-lookup)
![Mozilla Add-on](https://img.shields.io/amo/users/termania-net-lookup)
[![GitHub license](https://img.shields.io/github/license/techouse/termania-firefox-extension)](https://github.com/techouse/termania-firefox-extension/blob/master/LICENSE)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/72f7d4de02be4536bc96c5bc5b06c9a6)](https://www.codacy.com/manual/techouse/termania-firefox-extension?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=techouse/termania-firefox-extension&amp;utm_campaign=Badge_Grade)

This Firefox extension enables foreigners as well as Slovenian native speakers to search the extensive Slovenian
dictionary search engine [Termania.net](https://www.termania.net) with the click of a single button.

## Why yet another Firefox Extension
Actually this is a port of my original [Termania.net Lookup Google Chrome Extension](https://github.com/techouse/termania-chrome-extension).

## How do I install it? :rocket:
Simply visit Firefox Browser Add-ons and [download](https://addons.mozilla.org/en-US/firefox/addon/termania-net-lookup/) it.

## Is there a Chrome version as well? :crystal_ball:
Yes and it can be accessed [here](https://github.com/techouse/termania-chrome-extension).

## How does it work?
The user first needs to select a Slovenian word and right-click it to open Firefox's context menu:

![Context menu](screenshots/context.png)

In order to query only the [lemmas][1] of each word form the extension makes use of the
[Morphological lexicon Sloleks 2.0](http://eng.slovenscina.eu/sloleks/opis) indexed in an IndexedDB database
which holds over 100.000 lemmas.
In order to get the [1.5 GB lexicon from XML](https://www.clarin.si/repository/xmlui/handle/11356/1230) to SQLite and
then finally into IndexedDB I wrote [parser](https://github.com/techouse/sloleks-parser) in Python.

Once the correct lemma is identified an API call gets sent to [Termania.net](https://www.termania.net)
which in turn supplies all the information that is then presented to the user in a popup window.

![Results](screenshots/result.png)

## Why is the installation of the extension taking so long?
Unfortunately the Sloleks database housing all those 100.000 lemmas is quite large (approx. 50MB)
and importing it into IndexedDB takes about 5 minutes to complete during which time you wou't be
able to use the extension.

## How do I build it from source?
The extension uses a lot of different JavaScript libraries and has to be compiled with [npm](https://nodejs.org/en/)
and [Webpack](https://webpack.js.org). Ensure you have `Node.js` and `npm` installed and run these commands:

```bash
npm install
npm run build
```

The finished extension will present itself in a directory called `build`. From there you can
[load it as a temporary extension](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).


[1]: https://en.wikipedia.org/wiki/Lemma_(morphology)
