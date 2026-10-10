// Content script entry point
import './websitePresence';
import './utils/originalState';
import { initSelectedFont } from './utils/applySelectedFont';
import { watchCopyrightLanguage } from './utils/copyrightI18n';
import './main.js';

initSelectedFont();
watchCopyrightLanguage();

