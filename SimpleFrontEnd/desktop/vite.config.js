export default {
    build: {

        define: {
            // Mock the entire 'process' object
            'process': JSON.stringify({
                env: {},
                versions: { node: false },
                platform: ''
            }),
        }
    }
};