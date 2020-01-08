import Vue          from "vue"
import i18n         from "@/i18n"
import Dictionaries from "@/components/Dictionaries"

const app = new Vue({
    el: "#app",
    i18n,
    render: (h) => h(Dictionaries),
})
