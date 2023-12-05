export default {
    build: {

        define: {
            // Mock the entire 'process' object
            'process': JSON.stringify({
                env: {},
                versions: { node: false },
                platform: ''
            }),
        },
        esbuild: {
            target: 'es2019' // or another appropriate target
        }
    },
    optimizeDeps: {
        include: ['../../Shared'] // Adjust the path accordingly
    },
    resolve: {
        alias: {
            'trading-shared': path.resolve(__dirname, '../../Shared/dist')
        }
    }
};