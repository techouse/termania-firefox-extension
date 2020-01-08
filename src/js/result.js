import Vue    from "vue"
import i18n   from "@/i18n"
import Result from "@/components/Result"

const app = new Vue({
    el: "#app",
    i18n,
    render: (h) => h(Result),
})
