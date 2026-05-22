

import { createApp } from 'vue';
import App from './App.vue';
import 'a2ui-vue/dist/a2ui-vue.css';
import './styles.css';
import {DEFAULT_CATALOG, provideA2UI} from "a2ui-vue";
import {theme} from "@/theme.ts";

const app = createApp(App);

provideA2UI({
    app,
    catalog: DEFAULT_CATALOG,
    theme,
});
app.mount('#app')
