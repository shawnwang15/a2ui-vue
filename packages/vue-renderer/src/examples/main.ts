

import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import {provideA2UI} from "@/config.ts";
import {DEFAULT_CATALOG} from "@/catalog/default.ts";
import {theme} from "@/theme.ts";

const app = createApp(App);

provideA2UI({
    app,
    catalog: DEFAULT_CATALOG,
    theme,
});
app.mount('#app');
