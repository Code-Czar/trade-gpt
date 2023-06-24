"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://nuxt.com/docs/api/configuration/nuxt-config
exports.default = defineNuxtConfig({
    devtools: { enabled: true },
    srcDir: 'src/',
    buildModules: ["@nuxt/typescript-build", "@pinia/nuxt"],
    modules: [
        [
            "@pinia/nuxt",
            {
                autoImports: ["defineStore", ["defineStore", "definePiniaStore"]],
            },
        ],
    ],
});
