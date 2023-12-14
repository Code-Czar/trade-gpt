import { boot } from 'quasar/wrappers';
import pinia from '@/plugins/piniaPersistent';

export default boot(({ app }) => {
    app.use(pinia);
});