// Content script entry point
import './websitePresence';
import './utils/originalState';
import { initSelectedFont } from './utils/applySelectedFont';
import './main.js';

initSelectedFont();

