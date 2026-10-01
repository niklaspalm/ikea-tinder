Backend
[x] Create backend server (node)
[x] Create endpoint with all available languages/countries
[x] Create endpoint that proxies the IKEA latest product request (found in ./Project.md)
[x] Download images to server if not already available

Frontend
[x] The frontend and backend should run on the same port
[x] Initialize a Svelte app
[x] Install Tailwind css
[x] Create UI color based on the colors in /assets/logo.svg
[x] Use Noto Sans as main font
[x] Create a component showcase route
[x] Create a product preview card (IMAGE, NAME, PRICE, LIKE BUTTON, MORE INFO BUTTON, DISLIKE BUTTON)
[x] Add product preview card to component page with dummy data generated from a random product in a product response
[x] Create UI translations, start with english for now. All future UI component should use translations
[x] Create a mobile like bottom navigation with these three menu points (Swipe, Matches, About)
[x] Menu points should have 4 states, normal, hover/focus, active and pressed
[x] Each menu point should have a svg icon, outlined if not active, solid if active
[x] Add menu to component page
[x] Create match list item
[x] Create match list search item
[x] Create a product view component, where you list more info than the actual swipe card.
[x] Product preview and product card should have a lot of sharable components, like price, title and so on.
[x] Ensure that we don't have duplicate markup product Card and View
[x] Create dark/light mode. Use system as standard, also create a toggle that is available inside component page
[x] Create a country selector component. Keep it simple, to begin we have Denmark, UK, Sweden and Germany
[x] Create frontpage, if country not selected display country picker
[x] Product view should have Like / Dislike buttons depending on if it is an existing match or not. You can figure it out.
[x] Create the swiping view
    - Render pre created component
    - Implement swipe right = like, swipe left = dislike function
    - Make buttons work
    - If like button clicked item goes right
    - If dislike button clicked item goes left
    - It should render the views that the user still hasn't taken action on
    - Save items in local storage, liked/disliked
[x] Use swiping page as frontpage, if country is selected
[x] In about, create a reset button that resets all my likes and dislikes
[x] Instead of sorting by newest like we do now, I want to divide the products into 4 groups, newest 1, 2, 3 and 4. And then randomize inside these groups and the display them so that the user don't always see the same product order. Should still be 200 products though.
[x] Translate UI labels to danish, swedish and german and make add an option to change language of app as well
[x] Make header sticky
[x] On matches page, only scroll matches, keep search sticky in the top
[x] On the product card, we want to be able to see more images, I want a click on the right side of the image to see the next image, and left side for previous image, previous click is disabled if it is the first image and next if it is the last image.
[x] Create pills underneath image to indicate which image you're viewing and if there are more images
[x] Decrease button sizes for dislike, info and like on the product card a but on smaller devices like the iphone SE
[x] Create nice transitions when switching between "Swipe", "Matches" and "About"
[x] Also add nice animations when showing and hiding product preview cards
[x] Create a loading screen when the api is slow to respond
[x] Product preview UI - The close button could be placed in a better position, right now it is pushing down content
[x] In product preview mode, it would be nice to be able to click the product images and make them bigger, zoomable maybe
[x] Implement an undo button for users that dislike something they actually liked, should only be possible for the latest dislike
[x] Swiping on iPhone is sometimes a bit off. It is like the whole page is "dragged". Try to figure out a fix