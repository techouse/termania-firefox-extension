import i18n from "@/i18n"

export const contextMenuItem = {
    id: "termania_menu",
    title: i18n.t("Look up on Termania.net"),
    contexts: [
        "selection",
    ],
}

const findDefinition = (query, dictionaryId) => {
    import(/* webpackChunkName: "services" */ "@/services").then(({ search }) => {
        search(query, dictionaryId)
            .then((result) => {
                console.log("[OK] SEARCH RESULT: ", result)

                browser.storage.local.set({ result }, () => {
                    browser.runtime.sendMessage({
                        msg: "search_complete",
                        data: {
                            result,
                            query,
                        },
                    })
                })
            })
            .catch(() => {
                console.log(`[ERROR] NO SEARCH RESULTS FOR "${query}"`)

                browser.runtime.sendMessage({
                    msg: "error404",
                    data: {
                        error: "Search query yielded no results!",
                        query,
                    },
                })
                browser.storage.local.set({
                    error404: true,
                    query,
                })
            })
    })
}

const createWindow = () => {
    import(/* webpackChunkName: "misc" */ "@/services/misc").then(({ getAutoClose }) => {
        browser.storage.local.get("popupWindowIds", ({ popupWindowIds }) => {
            /**
             * Make a local copy
             */
            let removedIds = []

            if (popupWindowIds) {
                getAutoClose()
                    .then((autoClose) => {
                        if (autoClose) {
                            /**
                             * Close any open popup windows
                             */
                            browser.windows.getAll({ windowTypes: ["popup"] }, (popupWindows) => {
                                /**
                                 * Only close existing windows
                                 */
                                if (popupWindows.length) {
                                    removedIds = popupWindows.filter((popupWindow) => popupWindowIds.includes(popupWindow.id))
                                                             .map((popupWindow) => popupWindow.id)
                                    removedIds.forEach((id) => {
                                        browser.windows.remove(id)
                                    })
                                }
                            })
                        }
                    })
            }

            /**
             * Create a new popup window
             */
            browser.windows.create({
                url: "html/result.html",
                type: "popup",
                width: 640,
                height: 480,
            }, (popupWindow) => {
                /**
                 * Store it in local storage
                 */
                browser.storage.local.set({
                    popupWindowIds: popupWindowIds ? popupWindowIds.filter((id) => !removedIds.includes(id))
                                                                   .concat([popupWindow.id])
                                                   : [popupWindow.id],
                })
            })
        })
    })
}

export const contextClicked = (clickData) => {
    if (clickData.menuItemId === contextMenuItem.id
        && clickData.selectionText
    ) {
        console.log("[OK] SELECTION TEXT: ", clickData.selectionText)

        const query = clickData.selectionText.trim()
                               .toLowerCase()

        console.log("[OK] QUERY: ", query)

        browser.storage.local.set({ query }, () => {
            createWindow()

            import(/* webpackChunkName: "dictionary" */ "@/models/Dictionary").then(({ default: Dictionary }) => {
                Dictionary.getActive()
                          .then(({ id, languages }) => {
                              if (languages.includes("sl")) {
                                  import(/* webpackChunkName: "services" */ "@/services").then(({ getLemma }) => {
                                      getLemma(query)
                                          .then((lemma) => {
                                              console.log("[OK] COMMON LEMMA: ", lemma)

                                              findDefinition(lemma, id)
                                          })
                                          .catch(() => {
                                              getLemma(query, true)
                                                  .then((lemmaProper) => {
                                                      console.log("[OK] PROPER LEMMA: ", lemmaProper)

                                                      findDefinition(lemmaProper, id)
                                                  })
                                                  .catch(() => {
                                                      console.log(`[WARNING] NO LEMMA FOUND FOR "${query}". NOW SEARCHING EXACTLY FOR "${query}".`)

                                                      findDefinition(query, id)
                                                  })
                                          })
                                  })
                              } else {
                                  console.log(`[INFO] ACTIVE DICTIONARY DOES NOT SUPPORT SLOVENIAN LANGUAGE. NOT USING A SEARCHING FOR LEMMA. NOW SEARCHING EXACTLY FOR "${query}".`)

                                  findDefinition(query, id)
                              }
                          })
            })
        })
    }
}

export const createContextMenu = () => {
    browser.contextMenus.create(contextMenuItem, () => {
        console.log("created new menu")
    })
}

export default () => {
    browser.contextMenus.onClicked.addListener((clickData) => {
        console.log("clicked ", clickData.menuItemId)
        contextClicked(clickData)
    })
    console.log("listening for context menu click events")
}
