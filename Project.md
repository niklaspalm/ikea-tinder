# IKEA TINDER
A Tinder like web application written in Node and Vue 3 (using vue-facing-decorator) that lets a user swipe through the 200 latest products from IKEA.

## Flow
1. The user selects its location (country, for example: sv/se)
2. The server queries https://sik.search.blue.cdtapps.com/`se/sv`/search?c=listaf&v=20250507
    With this:
        `{"searchParameters":{"input":"new_product","type":"SPECIAL"},"isUserLoggedIn":false,"isB2B":false,"components":[{"component":"PRIMARY_AREA","columns":4,"types":{"main":"PRODUCT","breakouts":["PLANNER","LOGIN_REMINDER","MATTRESS_WARRANTY"]},"filterConfig":{"subcategories-style":"tree-navigation","max-num-filters":6},"sort":"RELEVANCE","window":{"offset":0,"size":200},"allVariants":false}]}`
3. The UI, which looks like Tinder, but in IKEA colors and style then presents the user with cards, that he then can swipe right or left, just like Tinder.
3.1 There should always be an option to see what you've liked

---
This is it for now