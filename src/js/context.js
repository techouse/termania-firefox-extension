export const contextMenuItem = {
    id: "termania_menu",
    title: "Search on Termania.net",
    contexts: [
        "selection",
    ],
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
            browser.windows.create({
                url: "html/result.html",
                type: "popup",
                width: 640,
                height: 480,
            })

            import(/* webpackChunkName: "services" */ "@/services").then(({ getLemma, search }) => {
                getLemma(query)
                    .then((lemma) => {
                        console.log("[OK] LEMMA: ", lemma)

                        import(/* webpackChunkName: "dictionary" */ "@/models/Dictionary").then(({ default: Dictionary }) => {
                            Dictionary.getActive()
                                      .then(({ id }) => {
                                          search(lemma, id)
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
                        })
                    })
                    .catch(() => {
                        console.log(`[ERROR] NO LEMMA FOUND FOR "${query}"`)

                        browser.runtime.sendMessage({
                            msg: "error404",
                            data: {
                                error: "Lemma not found!",
                                query,
                            },
                        })
                        browser.storage.local.set({
                            error404: true,
                            query,
                        })
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
