import { siteUrl } from '../../utils/siteUrl.js';

export function BtnDonate(donateText = 'دوست داری ازش حمایت کنی ؟', dir = 'rtl', locale = 'fa') {
    return `<a href="${siteUrl('/supporters/', locale)}" target="_blank" class="AsSBtn AsDonate" dir="${dir}" style="z-index: 900; text-decoration: none; display: inline-block;">${donateText}</a>`
}
