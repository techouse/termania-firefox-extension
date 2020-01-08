<template>
    <div id="dict-select" class="p-4">
        <div class="flex flex-col justify-center items-center">
            <img src="/images/logo_large.png" alt="Termania.net logo" class="w-56">
            <i class="text-sm text-gray-500">{{ $t("Dictionary Settings") }}</i>
        </div>
        <div class="flex justify-center items-center mt-4">
            <label class="block w-full">
                <span class="text-gray-700">{{ $t("Active Dictionary") }}</span>
                <vue-single-select v-model="dictionary"
                                   :options="dictionaries"
                                   :required="true"
                                   :option-key="optionKey"
                                   :option-label="optionLabel"
                                   :get-option-description="getOptionDescription"
                                   :placeholder="$t('Type to search a dictionary ...')"
                                   max-height="300px"
                                   @input="valueChanged"
                />
            </label>
        </div>
    </div>
</template>

<script>
    import VueSingleSelect           from "vue-single-select"
    import { isEmpty }               from "lodash-es"
    import { getDictionaries }       from "@/services"
    import Dictionary                from "@/models/Dictionary"
    import { DEFAULT_DICTIONARY_ID } from "@/services/constants"

    export default {
        name: "Dictionaries",

        components: {
            VueSingleSelect,
        },

        data() {
            return {
                dictionary: null,
                dictionaries: [],
                optionKey: "id",
                optionLabel: "name",
                classes: {
                    input: "form-input",
                    wrapper: "form-select mt-1 block w-full",
                },
            }
        },

        created() {
            getDictionaries()
                    .then((dictionaries) => {
                        this.$set(this, "dictionaries", dictionaries)

                        Dictionary.getActive()
                                  .then((activeDictionary) => {
                                      this.$set(this, "dictionary", activeDictionary)
                                  })
                                  .catch(() => {
                                      this.$set(this, "dictionary", this.dictionaries.find((dict) => dict.id === DEFAULT_DICTIONARY_ID))
                                  })
                    })
        },

        methods: {
            getOptionDescription(option) {
                return option[this.optionLabel]
            },

            valueChanged(activeDictionary) {
                /**
                 * Firefox has some issues here and we have to check for empty objects
                 */
                if (activeDictionary && !isEmpty(activeDictionary)) {
                    Dictionary.setActive(activeDictionary)
                }
            },
        },
    }
</script>
