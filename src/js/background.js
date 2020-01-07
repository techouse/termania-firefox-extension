import install                        from "@/install"
import context, { createContextMenu } from "@/context"

/**
 * Install the database if needed
 */
browser.runtime.onInstalled.addListener(() => {
    install()
    createContextMenu()
})

/**
 * Add the context menu
 */
context()
