function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000) + "k";
  }
  return num;
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target"), 10);
  const duration = 1500; // total animation time in ms
  const frameRate = 30;  // update every 30ms
  const totalFrames = duration / frameRate;
  let frame = 0;

  const counterInterval = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const currentValue = Math.round(target * progress);

    el.textContent = formatNumber(currentValue);

    if (frame >= totalFrames) {
      el.textContent = formatNumber(target);
      clearInterval(counterInterval);
    }
  }, frameRate);
}

// Only start counting when the stats section scrolls into view
const counters = document.querySelectorAll(".counter");
let hasAnimated = false;

const statsSection = document.querySelector(".banner-stats");

if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        counters.forEach(animateCounter);
        hasAnimated = true;
      }
    });
  }, { threshold: 0.4 });

  observer.observe(statsSection);
}

const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");
const signinDropdown = document.getElementById("signinDropdown");
const signupDropdown = document.getElementById("signupDropdown");

function toggleDropdown(target, other, e) {
  e.preventDefault();
  other.classList.remove("show");
  target.classList.toggle("show");
}

if (signinBtn && signupBtn) {
  signinBtn.addEventListener("click", (e) => toggleDropdown(signinDropdown, signupDropdown, e));
  signupBtn.addEventListener("click", (e) => toggleDropdown(signupDropdown, signinDropdown, e));

  // Close dropdowns when clicking anywhere else on the page
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".auth-dropdown-wrap")) {
      signinDropdown.classList.remove("show");
      signupDropdown.classList.remove("show");
    }
  });
}
// Services data
const serviceData = {
  "Consultation": [
    "General Consultation",
    "Specialist Consultation",
    "Online Consultation",
    "Follow-up Consultation"
  ],

  "Diagnosis": [
    "General Diagnosis",
    "Laboratory Testing",
    "Medical Imaging",
    "Health Screening"
  ],

  "Treatment": [
    "General Treatment",
    "Emergency Treatment",
    "Surgical Treatment",
    "Physical Therapy"
  ],

  "Prescription": [
    "Prescription Review",
    "Medication Guidance",
    "Prescription Renewal",
    "Online Prescription"
  ],

  "Online Support": [
    "Chat With a Doctor",
    "Online Consultation",
    "Patient Support",
    "Appointment Assistance"
  ],

  "Insurance": [
    "Health Insurance",
    "Insurance Claims",
    "Insurance Verification",
    "Coverage Assistance"
  ]
};


// Get all Find Service links
const serviceLinks = document.querySelectorAll(".service-card a");

serviceLinks.forEach(link => {

  link.addEventListener("click", function(event) {

    // Stop the # link from changing the page
    event.preventDefault();

    // Get the service category from the card
    const card = this.closest(".service-card");
    const category = card.querySelector("h3").textContent.trim();

    // Get services for that category
    const services = serviceData[category];

    // Create popup
    const popup = document.createElement("div");

    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.background = "rgba(0, 0, 0, 0.6)";
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "9999";

    // Create popup box
    const box = document.createElement("div");

    box.style.background = "#fff";
    box.style.padding = "30px";
    box.style.borderRadius = "12px";
    box.style.width = "90%";
    box.style.maxWidth = "450px";
    box.style.position = "relative";
    box.style.textAlign = "left";

    // Title
    const title = document.createElement("h2");
    title.textContent = category + " Services";
    title.style.marginBottom = "20px";

    // Close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";

    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.fontSize = "30px";
    closeButton.style.cursor = "pointer";

    // Services list
    const list = document.createElement("ul");
    list.style.paddingLeft = "20px";

    services.forEach(service => {

      const item = document.createElement("li");

      item.textContent = service;
      item.style.marginBottom = "12px";

      list.appendChild(item);

    });

    // Close popup
    closeButton.addEventListener("click", () => {
      popup.remove();
    });

    // Close when clicking outside the box
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        popup.remove();
      }
    });

    // Put everything together
    box.appendChild(closeButton);
    box.appendChild(title);
    box.appendChild(list);

    popup.appendChild(box);

    document.body.appendChild(popup);

  });

});

const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  if (navLinks.style.display === "flex") {
    navLinks.style.display = "none";
  } else {
    navLinks.style.display = "flex";
    navLinks.style.flexDirection = "column";
  }
});
// Detailed Services - Learn More Popup

const detailLinks = document.querySelectorAll(".service-detail-card a");

const serviceDetails = {
  "Consultation": {
    title: "Consultation",
    text: "Our consultation service provides one-on-one sessions with healthcare specialists to understand your health concerns, discuss your symptoms, and create the right care plan for you.",
    points: [
      "One-on-one consultation",
      "Health assessment",
      "Specialist consultation",
      "Personalized care planning"
    ]
  },

  "Diagnosis": {
    title: "Diagnosis",
    text: "Our diagnostic services use modern medical equipment and laboratory testing to help identify health conditions accurately and at an early stage.",
    points: [
      "Laboratory testing",
      "Medical examinations",
      "Diagnostic imaging",
      "Early condition detection"
    ]
  },

  "Treatment": {
    title: "Treatment",
    text: "We provide personalized treatment plans designed around your specific condition and needs, combining modern medical practices with compassionate care.",
    points: [
      "Personalized treatment plans",
      "Medical treatment",
      "Follow-up care",
      "Patient-centered support"
    ]
  },

  "Prescription": {
    title: "Prescription",
    text: "Our prescription service helps patients understand their medications, including the correct dosage, possible interactions, and how to use them safely.",
    points: [
      "Prescription management",
      "Medication guidance",
      "Dosage instructions",
      "Follow-up support"
    ]
  },

  "Online Support": {
    title: "Online Support",
    text: "Get professional healthcare support remotely through online communication when visiting a healthcare facility in person is not convenient.",
    points: [
      "Online doctor consultation",
      "Chat support",
      "Video consultation",
      "Remote healthcare guidance"
    ]
  },

  "Insurance": {
    title: "Insurance",
    text: "We work with major insurance providers to help make healthcare services easier to access, simpler to manage, and more affordable.",
    points: [
      "Insurance verification",
      "Coverage assistance",
      "Insurance claims support",
      "Healthcare payment guidance"
    ]
  }
};


detailLinks.forEach(link => {

  link.addEventListener("click", function(event) {

    event.preventDefault();

    // Find the card that was clicked
    const card = this.closest(".service-detail-card");

    // Get the service name from the h3
    const serviceName = card.querySelector("h3").textContent.trim();

    // Get the information for that service
    const details = serviceDetails[serviceName];

    // Create popup background
    const popup = document.createElement("div");

    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.background = "rgba(0, 0, 0, 0.6)";
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.zIndex = "9999";
    popup.style.padding = "20px";
    popup.style.boxSizing = "border-box";

    // Create popup box
    const box = document.createElement("div");

    box.style.background = "#ffffff";
    box.style.width = "100%";
    box.style.maxWidth = "500px";
    box.style.padding = "30px";
    box.style.borderRadius = "15px";
    box.style.position = "relative";
    box.style.textAlign = "left";
    box.style.boxSizing = "border-box";

    // Close button
    const closeButton = document.createElement("button");

    closeButton.innerHTML = "&times;";

    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.fontSize = "30px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#333";

    // Title
    const title = document.createElement("h2");

    title.textContent = details.title;
    title.style.marginBottom = "15px";

    // Description
    const description = document.createElement("p");

    description.textContent = details.text;
    description.style.lineHeight = "1.7";
    description.style.color = "#666";
    description.style.marginBottom = "20px";

    // What we offer heading
    const heading = document.createElement("h4");

    heading.textContent = "What We Offer";
    heading.style.marginBottom = "10px";

    // Services list
    const list = document.createElement("ul");

    details.points.forEach(point => {

      const item = document.createElement("li");

      item.textContent = point;
      item.style.marginBottom = "10px";
      item.style.color = "#555";

      list.appendChild(item);

    });

    // Close button function
    closeButton.addEventListener("click", () => {
      popup.remove();
    });

    // Close when clicking outside popup
    popup.addEventListener("click", (event) => {

      if (event.target === popup) {
        popup.remove();
      }

    });

    // Build popup
    box.appendChild(closeButton);
    box.appendChild(title);
    box.appendChild(description);
    box.appendChild(heading);
    box.appendChild(list);

    popup.appendChild(box);

    document.body.appendChild(popup);

  });

});

document.querySelector(".learn-more").addEventListener("click", function (e) {
  e.preventDefault();

  const article = document.createElement("div");

  article.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      overflow-y: auto;
      padding: 50px 20px;
    ">
      <div style="
        max-width: 800px;
        margin: auto;
        background: white;
        padding: 40px;
        border-radius: 12px;
        position: relative;
      ">

        <button onclick="this.closest('[style*=fixed]').remove()" style="
          position: absolute;
          top: 15px;
          right: 20px;
          border: none;
          background: none;
          font-size: 28px;
          cursor: pointer;
        ">&times;</button>

        <h1>5 Simple Habits That Can Add Years To Your Life</h1>

        <p style="color:#777;">
          By Dr. Francis Xavier · Sept 12, 2026
        </p>

        <h2>1. Stay Physically Active</h2>
        <p>
          Regular physical activity is one of the simplest ways to support
          your long-term health. Walking, exercising, stretching and staying
          active throughout the day can make a meaningful difference.
        </p>

        <h2>2. Eat a Balanced Diet</h2>
        <p>
          A balanced diet provides your body with the nutrients it needs.
          Include vegetables, fruits, whole grains, proteins and healthy fats
          in your meals.
        </p>

        <h2>3. Get Enough Sleep</h2>
        <p>
          Getting enough quality sleep allows your body and mind to recover.
          Try to maintain a consistent sleeping schedule.
        </p>

        <h2>4. Manage Stress</h2>
        <p>
          Long-term stress can affect your overall wellbeing. Take time to
          relax, exercise, spend time with people you care about and find
          healthy ways to manage stress.
        </p>

        <h2>5. Stay Consistent</h2>
        <p>
          Healthy habits work best when practiced consistently. Small changes
          made every day can have a significant impact over the long term.
        </p>

      </div>
    </div>
  `;

  document.body.appendChild(article);
});

document.querySelector(".btn-cta").addEventListener("click", function (e) {
    e.preventDefault();

    const popup = document.createElement("div");

    popup.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        ">

            <div style="
                background: white;
                width: 100%;
                max-width: 450px;
                padding: 35px;
                border-radius: 12px;
                position: relative;
                text-align: center;
            ">

                <button id="closeSubscribe" style="
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    border: none;
                    background: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #555;
                ">&times;</button>

                <h2 style="color:#4338ca; margin-bottom:10px;">
                    Stay Updated
                </h2>

                <p style="color:#555; margin-bottom:25px;">
                    Get the latest health tips and articles from our medical team.
                </p>

                <form id="subscribeForm">

                    <input 
                        type="email"
                        placeholder="Enter your email address"
                        required
                        style="
                            width:100%;
                            padding:14px;
                            border:1px solid #ddd;
                            border-radius:6px;
                            box-sizing:border-box;
                            margin-bottom:15px;
                        "
                    >

                    <button type="submit" style="
                        width:100%;
                        padding:14px;
                        border:none;
                        border-radius:6px;
                        background:#4338ca;
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                        Subscribe
                    </button>

                </form>

            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("closeSubscribe").addEventListener("click", function () {
        popup.remove();
    });

    document.getElementById("subscribeForm").addEventListener("submit", function (e) {
        e.preventDefault();

        alert("Thank you for subscribing to our health newsletter!");

        popup.remove();
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const openBtn = document.getElementById('openBooking');
  const closeBtn = document.getElementById('closeBooking');
  const modal = document.getElementById('bookingModal');
  const form = document.getElementById('bookingForm');

  openBtn.addEventListener('click', function (e) {
    e.preventDefault();
    modal.classList.add('show');
  });

  closeBtn.addEventListener('click', function () {
    modal.classList.remove('show');
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thanks! We got your booking request and will call you to confirm.');
    form.reset();
    modal.classList.remove('show');
  });
});
