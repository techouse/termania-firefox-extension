import i18n from "@/i18n"

const install = () => {
    import(/* webpackChunkName: "db" */ "@/services/db").then(({ default: db }) => {
        /**
         * Populate the IndexedDB database with lemmas from Sloleks
         */
        db.on("populate", () => {
            /**
             * Create a notification about the installation
             */
            browser.notifications.create({
                type: "basic",
                iconUrl: "images/48.png",
                title: i18n.t("Installing Termania.net Lookup"),
                message: i18n.t("Importing SLOLEKS 2.0 database"),
                progress: 0,
            })

            import(/* webpackChunkName: "jszip" */ "jszip").then(({ default: JSZip }) => {
                import(/* webpackChunkName: "dexie-export-import" */ "dexie-export-import").then(({ importDB }) => {
                    fetch(browser.runtime.getURL("data/db.zip"))
                        .then((response) => response.blob())
                        .then((zipBlob) => db.delete()
                                             .then(() => JSZip.loadAsync(zipBlob)
                                                              .then((zip) => zip.file("db.json")
                                                                                .async("blob"))
                                                              .then((blob) => importDB(blob, {
                                                                  progressCallback: ({ totalRows, completedRows }) => {
                                                                      const progress = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0

                                                                      console.log(i18n.t("Importing database {progress}% complete", { progress }))
                                                                  },
                                                              })
                                                                  .then((ImportedDB) => {
                                                                      /**
                                                                       * Notify the user via a notification
                                                                       */
                                                                      browser.notifications.create({
                                                                          type: "basic",
                                                                          iconUrl: "images/48.png",
                                                                          title: i18n.t("Installing Termania.net Lookup complete!"),
                                                                          message: i18n.t("Importing SLOLEKS 2.0 database 100% complete. You may now use the extension!"),
                                                                      })
                                                                      return ImportedDB
                                                                  })))
                                             .catch((error) => {
                                                 console.error(error)
                                             }))
                        .then(() => {
                            /**
                             * Open the database and add the context to Firefox once done
                             */
                            db.open()
                        })
                        .catch((error) => {
                            console.error(error)
                        })
                })
            })
        })
        db.open()
    })
}

export default install
