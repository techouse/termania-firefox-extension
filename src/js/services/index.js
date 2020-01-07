import { addMinutes }                          from "date-fns"
import md5                                     from "crypto-js/md5"
import api                                     from "./api"
import db                                      from "./db"
import { dictionaries, CACHE_TIME_IN_MINUTES } from "./constants"


const getEntryIndex = (query, dictionaryId) => new Promise((resolve, reject) => {
    api.get("/entry-index", {
           params: {
               dictionaryId,
               query,
               headword: query,
           },
       })
       .then(({ data }) => resolve({
           ...data,
           query,
           dictionaryId,
       }))
       .catch((error) => reject(error))
})

const getEntry = (entryId, dictionaryId) => new Promise((resolve, reject) => {
    api.get("/get-entry", {
           params: {
               dictionaryId,
               entryId,
           },
           headers: {
               Accept: "text/xml", // specifically request an XML payload
           },
       })
       .then(({ data }) => {
           const parser = new DOMParser()
           const xmlDoc = parser.parseFromString(data, "text/xml")
           return resolve({
               dictionaryId: Number(xmlDoc.getElementsByTagName("dictionary_id")[0].childNodes[0].nodeValue),
               entryId: Number(xmlDoc.getElementsByTagName("entry_id")[0].childNodes[0].nodeValue),
               headword: xmlDoc.getElementsByTagName("headword")[0].childNodes[0].nodeValue,
               html: xmlDoc.getElementsByTagName("html_content")[0].innerHTML,
           })
       })
       .catch((error) => reject(error))
})

export const search = (query, dictionaryId = dictionaries.presis) => new Promise((resolve, reject) => {
    const cacheKey = md5(`${query}_${dictionaryId}`)
        .toString()

    browser.storage.local.get(cacheKey, (data) => {
        /**
         * Check if we have a cached copy of the result
         */
        if (data[cacheKey] && "expires" in data[cacheKey] && new Date(data[cacheKey].expires) > new Date()) {
            console.log(`[OK] CACHED SEARCH RESULT FOR "${query}"`)
            return resolve(data[cacheKey])
        }

        /**
         * Data does not exist in cache or is not valid anymore
         */
        getEntryIndex(query, dictionaryId)
            .then((entryIndex) => {
                /**
                 * Check if there are any results
                 */
                if (entryIndex.AbsoluteIndex > -1 && entryIndex.RelativeIndex > -1) {
                    getEntry(entryIndex.AbsoluteIndex, dictionaryId)
                        .then((entry) => {
                            /**
                             * Cache the result
                             */
                            const cache = {}
                            cache[cacheKey] = {
                                query,
                                ...entry,
                                expires: addMinutes(new Date(), CACHE_TIME_IN_MINUTES)
                                    .toISOString(),
                            }
                            browser.storage.local.set(cache)

                            /**
                             * Resolve the HTML element
                             */
                            return resolve(cache[cacheKey])
                        })
                        .catch((error) => reject(error))
                } else {
                    /**
                     * In case there are no results
                     */
                    return reject(Error("Search query yielded no results!"))
                }
            })
            .catch((error) => reject(error))
    })
})

export const getLemma = (query) => new Promise((resolve, reject) => {
    db.words.where("word")
      .equalsIgnoreCase(query)
      .first((word) => {
          if (!word || !("lemma" in word)) {
              return reject(Error(`Lemma of "${query}" not found!`))
          }
          return resolve(word.lemma)
      })
      .catch("DatabaseClosedError", (exception) => {
          console.warn(`DatabaseClosed error: ${exception.message}`)
          db.open()
            .then(() => resolve(getLemma(query)))
      })
      .catch((error) => {
          console.warn(error.stack || error)
      })
})
