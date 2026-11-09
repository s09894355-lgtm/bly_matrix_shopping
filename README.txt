BLY MATRIX - WHITE STOREFRONT CODE

Files:
- index.html
- styles.css
- app.js

Setup:
1. Put all three files in the same folder.
2. Open app.js and set CONFIG.googleSheetCsvUrl to your published Google Sheets CSV URL.
3. Keep the Google Sheet columns exactly:
   id,name,category,price,mrp,image,description,active
4. Put public image URLs in the image column. If image is blank, no product image will show.
5. Set active to TRUE or FALSE.
6. Change CONFIG.whatsappNumber only if the WhatsApp order number changes.

Features:
- White responsive ecommerce storefront.
- Separate product detail view (click a product card).
- Wishlist and cart pages.
- Quantity selector on product detail.
- Buy Now opens WhatsApp with product name, code, unit price, quantity and total pre-filled.
- Cart checkout sends all cart items in one WhatsApp message.
- WhatsApp does not send automatically; customer must press Send.

Note:
- Wishlist/cart are stored in the visitor's browser localStorage.
- Google Sheet published as CSV is publicly readable.
- Product images need publicly accessible direct image URLs.
