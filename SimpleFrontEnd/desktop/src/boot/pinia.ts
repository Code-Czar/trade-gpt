import { boot } from 'quasar/wrappers';
import pinia from 'src/plugins/pinia-persistence';

export default boot(({ app }) => {
    app.use(pinia);
});