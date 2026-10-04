const BIKES = [
  {
    id: 1,
    name: "Royal Enfield Classic 350",
    type: "Cruiser",
    price: 1200,
    em: "🏍️",
    bg: "#ffe3d6",
    cc: "350cc",
    mileage: "35 km/l",
  },
  {
    id: 2,
    name: "Bajaj Pulsar NS200",
    type: "Sports",
    price: 900,
    em: "🏍️",
    bg: "#e6f0ff",
    cc: "200cc",
    mileage: "40 km/l",
  },
  {
    id: 3,
    name: "Yamaha R15 V4",
    type: "Sports",
    price: 1100,
    em: "🏁",
    bg: "#e6f0ff",
    cc: "155cc",
    mileage: "45 km/l",
  },
  {
    id: 4,
    name: "KTM Duke 200",
    type: "Sports",
    price: 1000,
    em: "🏍️",
    bg: "#ffe9d0",
    cc: "200cc",
    mileage: "35 km/l",
  },
  {
    id: 5,
    name: "Honda Activa 6G",
    type: "Scooter",
    price: 400,
    em: "🛵",
    bg: "#e5f5e0",
    cc: "110cc",
    mileage: "50 km/l",
  },
  {
    id: 6,
    name: "TVS Jupiter",
    type: "Scooter",
    price: 380,
    em: "🛵",
    bg: "#e5f5e0",
    cc: "110cc",
    mileage: "50 km/l",
  },
  {
    id: 7,
    name: "Hero Splendor Plus",
    type: "Commuter",
    price: 350,
    em: "🏍️",
    bg: "#f3ecd9",
    cc: "100cc",
    mileage: "70 km/l",
  },
  {
    id: 8,
    name: "Honda Shine",
    type: "Commuter",
    price: 450,
    em: "🏍️",
    bg: "#f3ecd9",
    cc: "125cc",
    mileage: "60 km/l",
  },
  {
    id: 9,
    name: "Ola S1 Pro",
    type: "Electric",
    price: 600,
    em: "⚡",
    bg: "#e0f7f4",
    cc: "Electric",
    mileage: "170 km/charge",
  },
  {
    id: 10,
    name: "Ather 450X",
    type: "Electric",
    price: 700,
    em: "⚡",
    bg: "#e0f7f4",
    cc: "Electric",
    mileage: "110 km/charge",
  },
];

const HELMET = 50; // per day
const INSURANCE = 100; // per day
const COUPON = "RIDE10";

const $ = (id) => document.getElementById(id);
const rupee = (n) => "₹" + n.toLocaleString("en-IN");

let cat = "All";
let bookings = []; // {id, helmet, ins}
let discount = false;

/* ---------- Dates ---------- */
const iso = (d) => d.toISOString().split("T")[0];
const today = new Date();
const tomorrow = new Date(Date.now() + 86400000);

$("pickup").min = iso(today);
$("pickup").value = iso(today);
$("ret").min = iso(today);
$("ret").value = iso(tomorrow);

function getDays() {
  const a = new Date($("pickup").value);
  const b = new Date($("ret").value);
  const d = Math.round((b - a) / 86400000);
  return d;
}

function updateDays() {
  const d = getDays();
  if (isNaN(d) || d < 1) {
    $("dateErr").textContent = "Return date must be after pickup date.";
    $("daysBox").textContent = "-";
    return false;
  }
  $("dateErr").textContent = "";
  $("daysBox").textContent = d + (d === 1 ? " day" : " days");
  renderGrid();
  renderCart();
  return true;
}

$("pickup").onchange = () => {
  $("ret").min = $("pickup").value;
  if ($("ret").value <= $("pickup").value) {
    const n = new Date($("pickup").value);
    n.setDate(n.getDate() + 1);
    $("ret").value = iso(n);
  }
  updateDays();
};
$("ret").onchange = updateDays;

/* ---------- Bikes grid ---------- */
function renderChips() {
  const cats = ["All", ...new Set(BIKES.map((b) => b.type))];
  $("chips").innerHTML = cats
    .map(
      (c) =>
        `<button class="chip ${c === cat ? "on" : ""}" data-c="${c}">${c}</button>`,
    )
    .join("");
}

function renderGrid() {
  const s = $("sort").value;
  const days = Math.max(1, getDays() || 1);
  let list = BIKES.filter((b) => cat === "All" || b.type === cat);
  if (s === "lo") list.sort((a, b) => a.price - b.price);
  if (s === "hi") list.sort((a, b) => b.price - a.price);

  $("grid").innerHTML = list.length
    ? list
        .map((b) => {
          const booked = bookings.some((x) => x.id === b.id);
          return `
    <article class="card">
      <div class="pic" style="background:${b.bg}">${b.em}</div>
      <div class="info">
        <h3>${b.name}</h3>
        <small>${b.type}</small>
        <div class="specs"><span>${b.cc}</span><span>${b.mileage}</span></div>
        <div class="price">${rupee(b.price)} <small>/ day</small></div>
        <div class="est">${days} ${days === 1 ? "day" : "days"}: ${rupee(b.price * days)}</div>
        <button class="add" data-id="${b.id}" ${booked ? "disabled" : ""}>${booked ? "Added" : "Book this bike"}</button>
      </div>
    </article>`;
        })
        .join("")
    : `<p class="empty">No bikes in this category.</p>`;
}

$("chips").onclick = (e) => {
  const c = e.target.dataset.c;
  if (!c) return;
  cat = c;
  renderChips();
  renderGrid();
};
$("sort").onchange = renderGrid;
$("grid").onclick = (e) => {
  const id = +e.target.dataset.id;
  if (!id) return;
  if (!updateDays()) return;
  bookings.push({ id, helmet: false, ins: false });
  toast(BIKES.find((b) => b.id === id).name + " added");
  renderGrid();
  renderCart();
};

/* ---------- Bookings drawer ---------- */
function calc() {
  const days = Math.max(1, getDays() || 1);
  const sub = bookings.reduce((sum, bk) => {
    const bike = BIKES.find((b) => b.id === bk.id);
    return (
      sum +
      (bike.price + (bk.helmet ? HELMET : 0) + (bk.ins ? INSURANCE : 0)) * days
    );
  }, 0);
  const disc = discount ? Math.round(sub * 0.1) : 0;
  return { days, sub, disc, total: sub - disc };
}

function renderCart() {
  const { days, sub, disc, total } = calc();
  $("count").textContent = bookings.length;
  $("sub").textContent = rupee(sub);
  $("disc").textContent = "-" + rupee(disc);
  $("discRow").hidden = !discount;
  $("total").textContent = rupee(total);
  $("checkout").disabled = !bookings.length;

  $("items").innerHTML = bookings.length
    ? bookings
        .map((bk) => {
          const b = BIKES.find((x) => x.id === bk.id);
          return `
    <div class="row">
      <div class="row-top">
        <span class="em">${b.em}</span>
        <div><strong>${b.name}</strong><br><small>${rupee(b.price)} × ${days} ${days === 1 ? "day" : "days"}</small></div>
        <button class="rm" data-a="rm" data-id="${b.id}">Remove</button>
      </div>
      <div class="addons">
        <label><input type="checkbox" data-a="helmet" data-id="${b.id}" ${bk.helmet ? "checked" : ""}> Helmet +₹${HELMET}/day</label>
        <label><input type="checkbox" data-a="ins" data-id="${b.id}" ${bk.ins ? "checked" : ""}> Insurance +₹${INSURANCE}/day</label>
      </div>
    </div>`;
        })
        .join("")
    : `<p class="empty">No bikes yet. Pick one from the list.</p>`;
}

$("items").onchange = (e) => {
  const a = e.target.dataset.a,
    id = +e.target.dataset.id;
  const bk = bookings.find((x) => x.id === id);
  if (a === "helmet") bk.helmet = e.target.checked;
  if (a === "ins") bk.ins = e.target.checked;
  renderCart();
};
$("items").onclick = (e) => {
  if (e.target.dataset.a !== "rm") return;
  const id = +e.target.dataset.id;
  bookings = bookings.filter((x) => x.id !== id);
  renderGrid();
  renderCart();
};

const drawer = (open) => {
  $("drawer").classList.toggle("open", open);
  $("shade").classList.toggle("open", open);
};
$("openCart").onclick = () => drawer(true);
$("closeCart").onclick = $("shade").onclick = () => drawer(false);

/* ---------- Coupon ---------- */
$("applyCoupon").onclick = () => {
  const code = $("coupon").value.trim().toUpperCase();
  if (code === COUPON) {
    discount = true;
    $("couponMsg").style.color = "green";
    $("couponMsg").textContent = "Coupon applied: 10% off";
  } else {
    discount = false;
    $("couponMsg").style.color = "";
    $("couponMsg").textContent = "Invalid coupon code. Try RIDE10.";
  }
  renderCart();
};

/* ---------- Checkout ---------- */
$("checkout").onclick = () => {
  drawer(false);
  $("box").innerHTML = `
    <h2>Rider details</h2>
    <form id="f" novalidate>
      <label>Name<input id="n" autocomplete="name"><span class="err" id="en"></span></label>
      <label>Phone<input id="ph" inputmode="numeric" maxlength="10"><span class="err" id="ep"></span></label>
      <label>Driving licence no.<input id="dl" placeholder="TN01 20200012345" maxlength="16"><span class="err" id="ed"></span></label>
      <button class="cta" type="submit">Pay ${$("total").textContent}</button>
      <button class="rm" type="button" id="cancel">Cancel</button>
    </form>`;
  $("modal").classList.add("open");
  $("n").focus();
  $("cancel").onclick = () => $("modal").classList.remove("open");

  $("f").onsubmit = (e) => {
    e.preventDefault();
    const n = $("n").value.trim();
    const ph = $("ph").value.trim();
    const dl = $("dl").value.trim().toUpperCase().replace(/\s/g, "");
    const okN = n.length >= 3;
    const okP = /^[6-9]\d{9}$/.test(ph);
    const okD = /^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(dl);
    $("en").textContent = okN ? "" : "Enter your full name";
    $("ep").textContent = okP ? "" : "Enter a valid 10-digit mobile number";
    $("ed").textContent = okD
      ? ""
      : "Enter a valid licence number, e.g. TN01 20200012345";
    if (!(okN && okP && okD)) return;

    const id = "VV" + Math.floor(100000 + Math.random() * 900000);
    const city = $("city").value;
    const pick = $("pickup").value;
    bookings = [];
    discount = false;
    $("coupon").value = "";
    $("couponMsg").textContent = "";
    renderGrid();
    renderCart();
    $("box").innerHTML = `
      <div class="ok"><div class="em">🏍️</div>
      <h2>Booking confirmed</h2>
      <p>Thank you, ${n}. Booking <strong>${id}</strong>.<br>Pickup: ${city}, ${pick}.<br>Carry your original licence.</p><br>
      <button class="cta" id="done">Back to bikes</button></div>`;
    $("done").onclick = () => $("modal").classList.remove("open");
  };
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    drawer(false);
    $("modal").classList.remove("open");
  }
});

/* ---------- Toast ---------- */
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------- Init ---------- */
renderChips();
renderGrid();
renderCart();
updateDays();
