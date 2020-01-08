/**
 * Install the database if needed
 */
import { DEFAULT_DICTIONARY_ID } from "@/services/constants"

browser.runtime.onInstalled.addListener(() => {
    import(/* webpackChunkName: "services" */ "@/services").then(({ getDictionaries }) => {
        getDictionaries()
            .then(() => {
                import(/* webpackChunkName: "dictionary" */ "@/models/Dictionary").then(({ default: Dictionary }) => {
                    Dictionary.getActive()
                              .catch(() => {
                                  browser.storage.local.get("dictionaries", ({ dictionaries }) => Dictionary.setActive(dictionaries.dictionaries.find((dict) => dict.id === DEFAULT_DICTIONARY_ID)))
                              })
                })
            })
    })

    import(/* webpackChunkName: "install" */ "@/install").then(({ default: install }) => {
        install()
    })

    import(/* webpackChunkName: "context" */ "@/context").then(({ createContextMenu }) => {
        createContextMenu()
    })
})

/**
 * Add the context menu
 */
import(/* webpackChunkName: "context" */ "@/context").then(({ default: context }) => {
    context()
})
