// BLY MATRIX - white storefront
const CONFIG = {
  whatsappNumber: "918590594972",
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlBQE9KajG2smjPzbrfERzdhOO3jXwqYqbwZM4gCwVv_XsSyp8BiufKAJShHRFHw/pub?gid=941357181&single=true&output=csv"
};

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
const getStore = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const setStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let products = [];
let activeCategory = "All";

function parseCSV(text) {
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], next=text[i+1];
    if(c === '"' && quoted && next === '"'){cell+='"';i++;}
    else if(c === '"'){quoted=!quoted;}
    else if(c === ',' && !quoted){row.push(cell);cell="";}
    else if((c === '\n' || c === '\r') && !quoted){
      if(c === '\r' && next === '\n') i++;
      row.push(cell); if(row.some(v=>v.trim()!=="")) rows.push(row);
      row=[];cell="";
    } else cell+=c;
  }
  row.push(cell); if(row.some(v=>v.trim()!=="")) rows.push(row);
  if(!rows.length) return [];
  const headers=rows.shift().map(h=>h.trim().toLowerCase());
  return rows.map(r=>{
    const o={}; headers.forEach((h,i)=>o[h]=(r[i]||"").trim());
    return {
      id:o.id, name:o.name, category:o.category||"Other",
      price:Number(o.price)||0, mrp:Number(o.mrp)||0,
      image:o.image||"", description:o.description||"",
      active:(o.active||"true").toLowerCase()!=="false"
    };
  }).filter(p=>p.id && p.name && p.active);
}

const demoProducts = [
  {id:"P001",name:"Smart Watch",category:"Electronics",price:1499,mrp:2499,image:"",description:"Add your product description in Google Sheets.",active:true},
  {id:"P002",name:"Wireless Earbuds",category:"Electronics",price:999,mrp:1799,image:"",description:"Add your product description in Google Sheets.",active:true},
  {id:"P003",name:"Travel Backpack",category:"Fashion",price:799,mrp:1299,image:"",description:"Add your product description in Google Sheets.",active:true}
];

async function loadProducts(){
  if(!CONFIG.googleSheetCsvUrl){products=demoProducts;showNotice("Add your published Google Sheets CSV URL in app.js to load your own products.");return;}
  try{
    const res=await fetch(CONFIG.googleSheetCsvUrl,{cache:"no-store"});
    if(!res.ok) throw new Error("CSV request failed");
    const data=parseCSV(await res.text());
    if(!data.length) throw new Error("No active products found");
    products=data;
  }catch(err){products=demoProducts;showNotice("Could not load Google Sheets. Check the published CSV URL and sheet headers.");}
}
function showNotice(message){const n=$("notice");n.textContent=message;n.hidden=false;}
function updateCounts(){
  $("wishlistCount").textContent=getStore("blyWishlist").length;
  $("cartCount").textContent=getStore("blyCart").reduce((s,x)=>s+Number(x.qty||1),0);
}
function productImage(p, cls=""){
  return p.image ? `<img class="${cls}" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" onerror="this.style.display='none'">` : `<span class="no-image">Image not added</span>`;
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHTML(s);}
function isSaved(id){return getStore("blyWishlist").includes(id);}
function toggleWishlist(id){
  let list=getStore("blyWishlist");
  list=list.includes(id)?list.filter(x=>x!==id):[...list,id];
  setStore("blyWishlist",list);updateCounts();
  renderCurrentPage();
}
function card(p){
  return `<article class="product-card">
    <button class="heart ${isSaved(p.id)?"saved":""}" aria-label="Add to wishlist" onclick="toggleWishlist('${escapeAttr(p.id)}')">${isSaved(p.id)?"♥":"♡"}</button>
    <a href="index.html?product=${encodeURIComponent(p.id)}">
      <div class="product-image">${productImage(p)}</div>
      <div class="product-info">
        <div class="product-name">${escapeHTML(p.name)}</div>
        <div class="price-line"><span class="price">${money(p.price)}</span>${p.mrp>p.price?`<span class="mrp">${money(p.mrp)}</span>`:""}</div>
      </div>
    </a>
    <div class="product-info" style="padding-top:0"><div class="card-actions">
      <a class="btn btn-dark" href="index.html?product=${encodeURIComponent(p.id)}">View product</a>
      <button class="btn btn-light" onclick="addToCart('${escapeAttr(p.id)}')">Add to cart</button>
    </div></div>
  </article>`;
}
function renderHome(){
  $("homePage").hidden=false;$("detailPage").hidden=true;$("wishlistPage").hidden=true;$("cartPage").hidden=true;
  const categories=["All",...new Set(products.map(p=>p.category).filter(Boolean))];
  $("categoryBar").innerHTML=categories.map(c=>`<button class="category-btn ${activeCategory===c?"active":""}" onclick="setCategory('${escapeAttr(c)}')">${escapeHTML(c)}</button>`).join("");
  const q=($("searchInput").value||"").toLowerCase();
  const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.description} ${p.id}`).toLowerCase().includes(q));
  $("productGrid").innerHTML=list.length?list.map(card).join(""):`<div class="empty">No products found.</div>`;
}
function setCategory(c){activeCategory=c;renderHome();}
function showDetail(id){
  const p=products.find(x=>x.id===id);if(!p){showNotice("Product not found.");renderHome();return;}
  $("homePage").hidden=true;$("detailPage").hidden=false;$("wishlistPage").hidden=true;$("cartPage").hidden=true;
  $("detailPage").innerHTML=`<p class="muted"><a href="index.html">Home</a> / ${escapeHTML(p.category)}</p>
    <div class="detail-layout">
      <div class="detail-image">${productImage(p)}</div>
      <div class="detail-copy">
        <p class="eyebrow">${escapeHTML(p.category)}</p><h1>${escapeHTML(p.name)}</h1>
        <p class="product-code">Product Code: ${escapeHTML(p.id)}</p>
        <div><span class="detail-price">${money(p.price)}</span>${p.mrp>p.price?`<span class="detail-mrp">${money(p.mrp)}</span>`:""}</div>
        <p class="description">${escapeHTML(p.description||"Contact us for more product details.")}</p>
        <div class="quantity-row"><strong>Quantity</strong><div class="quantity-control">
          <button onclick="changeQty(-1)" aria-label="Decrease quantity">−</button>
          <input id="detailQty" type="number" min="1" max="99" value="1">
          <button onclick="changeQty(1)" aria-label="Increase quantity">+</button>
        </div></div>
        <div class="detail-actions">
          <button class="btn btn-gold" onclick="buyNow('${escapeAttr(p.id)}')">Buy Now on WhatsApp</button>
          <button class="btn btn-dark" onclick="addToCart('${escapeAttr(p.id)}')">Add to Cart</button>
          <button class="btn btn-light" onclick="toggleWishlist('${escapeAttr(p.id)}')">${isSaved(p.id)?"♥ Saved":"♡ Wishlist"}</button>
        </div>
      </div>
    </div>`;
}
function changeQty(delta){const input=$("detailQty");if(input)input.value=Math.max(1,Math.min(99,(Number(input.value)||1)+delta));}
function addToCart(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const qty=Math.max(1,Number($("detailQty")?.value)||1);
  let cart=getStore("blyCart");const existing=cart.find(x=>x.id===id);
  if(existing)existing.qty+=qty;else cart.push({id,qty});
  setStore("blyCart",cart);updateCounts();showNotice(`${p.name} added to cart.`);
}
function buyNow(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const qty=Math.max(1,Math.min(99,Number($("detailQty")?.value)||1));
  const total=p.price*qty;
  const message=`Hello BLY MATRIX! I want to order this product.%0A%0AProduct: ${encodeURIComponent(p.name)}%0AProduct Code: ${encodeURIComponent(p.id)}%0APrice: ${encodeURIComponent(money(p.price))}%0AQuantity: ${qty}%0ATotal: ${encodeURIComponent(money(total))}%0A%0APlease confirm availability.`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`,"_blank","noopener");
}
function renderWishlist(){
  $("homePage").hidden=true;$("detailPage").hidden=true;$("wishlistPage").hidden=false;$("cartPage").hidden=true;
  const ids=getStore("blyWishlist");const list=products.filter(p=>ids.includes(p.id));
  $("wishlistGrid").innerHTML=list.length?list.map(card).join(""):`<div class="empty">Your wishlist is empty.</div>`;
}
function renderCart(){
  $("homePage").hidden=true;$("detailPage").hidden=true;$("wishlistPage").hidden=true;$("cartPage").hidden=false;
  const cart=getStore("blyCart");const lines=cart.map(x=>({p:products.find(p=>p.id===x.id),qty:Number(x.qty)||1})).filter(x=>x.p);
  if(!lines.length){$("cartContent").innerHTML='<div class="empty">Your cart is empty.</div>';return;}
  const total=lines.reduce((s,x)=>s+x.p.price*x.qty,0);
  $("cartContent").innerHTML=lines.map(x=>`<div class="cart-row">
    <div>${productImage(x.p)}</div><div><h3>${escapeHTML(x.p.name)}</h3><div class="muted">Code: ${escapeHTML(x.p.id)}</div><strong>${money(x.p.price)}</strong><div class="muted">Quantity: ${x.qty}</div><button class="remove" onclick="removeCartItem('${escapeAttr(x.p.id)}')">Remove</button></div>
    <strong>${money(x.p.price*x.qty)}</strong></div>`).join("")+
    `<div class="cart-total"><span>Total</span><span>${money(total)}</span></div>
    <button class="btn btn-gold" onclick="checkoutCart()">Order all items on WhatsApp</button>`;
}
function removeCartItem(id){setStore("blyCart",getStore("blyCart").filter(x=>x.id!==id));updateCounts();renderCart();}
function checkoutCart(){
  const cart=getStore("blyCart");const lines=cart.map(x=>({p:products.find(p=>p.id===x.id),qty:Number(x.qty)||1})).filter(x=>x.p);
  if(!lines.length)return;
  const total=lines.reduce((s,x)=>s+x.p.price*x.qty,0);
  let message="Hello BLY MATRIX! I want to order:%0A%0A";
  lines.forEach((x,i)=>{message+=`${i+1}. ${encodeURIComponent(x.p.name)} | Code: ${encodeURIComponent(x.p.id)} | Price: ${encodeURIComponent(money(x.p.price))} | Qty: ${x.qty}%0A`;});
  message+=`%0ATotal: ${encodeURIComponent(money(total))}%0A%0APlease confirm availability.`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`,"_blank","noopener");
}
function renderCurrentPage(){
  const params=new URLSearchParams(location.search);
  if(params.has("product"))showDetail(params.get("product"));
  else if(params.get("page")==="wishlist")renderWishlist();
  else if(params.get("page")==="cart")renderCart();
  else renderHome();
  updateCounts();
}
$("searchForm").addEventListener("submit",e=>{e.preventDefault();activeCategory="All";renderHome();});
$("searchInput").addEventListener("input",()=>{if(!$("homePage").hidden)renderHome();});
$("year").textContent=new Date().getFullYear();
(async()=>{await loadProducts();renderCurrentPage();})();
