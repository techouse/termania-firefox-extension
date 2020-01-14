export const setAutoClose = (autoClose) => new Promise((resolve) => {
    browser.storage.local.set({ autoClose: Boolean(autoClose) }, () => resolve(Boolean(autoClose)))
})

export const getAutoClose = () => new Promise((resolve) => {
    browser.storage.local.get("autoClose", ({ autoClose }) => {
        if (!autoClose) {
            setAutoClose(false)
        }
        resolve(Boolean(autoClose))
    })
})
