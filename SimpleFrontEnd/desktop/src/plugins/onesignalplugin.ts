import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

const APP_ID = "c9f90795-f921-4717-92b2-3dd1e9405b30";
console.log('THIS', this)
export default ({ app, router, store, Vue }) => {
    console.log("🚀 ~ file: onesignalplugin.ts:5 ~ app:", app)
    // something to do
    // app.use(OneSignalVuePlugin, {
    //     appId: APP_ID,
    // })

}