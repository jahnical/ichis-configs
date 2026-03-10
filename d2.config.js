/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    name: 'iCHIS Configuration App',
    title: 'iCHIS Config',
    description: 'GUI for managing iCHIS DHIS2 datastore configurations',

    entryPoints: {
        app: './src/App.jsx',
    },

    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
