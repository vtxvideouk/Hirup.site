// ===============================
// Supabase Authentication (Login Only)
// ===============================

// Configuration placeholders (set these in HTML before loading this file, or edit here)
const SUPABASE_URL = window.SUPABASE_URL || "https://ftcljqdbtfxpkdkpvcra.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2xqcWRidGZ4cGtka3B2Y3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjEyODUsImV4cCI6MjA3MTMzNzI4NX0.3NdwfhDKU2KgFbOhgUadaSb-bE3MuR2u6DfOC4l2QjU";
const START_PAGE = "index.html"; // Redirect here after login
const LOGIN_PAGE = "login.html"; // Redirect here if not authenticated

// Ensure Supabase SDK is available (loaded via CDN). If not present, inject it.
(function ensureSupabaseCdn() {
    if (window.supabase) return;
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@supabase/supabase-js@2";
    script.defer = true;
    document.head.appendChild(script);
})();

// Create (or reuse) a single Supabase client instance
function getSupabaseClient() {
    if (!window.supabase) {
        throw new Error("Supabase SDK not loaded. Ensure CDN script is included before using auth");
    }
    if (!window.__supabaseClient) {
        window.__supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.__supabaseClient;
}

// Auth helpers
async function getSession() {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();
    return data.session || null;
}

async function loginWithEmailPassword(email, password) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    if (data.session) {
        window.location.href = START_PAGE;
    }
    return { success: true };
}

async function logout() {
    const client = getSupabaseClient();
    await client.auth.signOut();
    window.location.href = LOGIN_PAGE;
}

async function requireAuth() {
    try {
        const session = await getSession();
        if (!session) {
            if (!window.location.pathname.endsWith(`/${LOGIN_PAGE}`) && !window.location.pathname.endsWith(LOGIN_PAGE)) {
                window.location.replace(LOGIN_PAGE);
            }
            return false;
        }
        return true;
    } catch (e) {
        window.location.replace(LOGIN_PAGE);
        return false;
    }
}

async function redirectIfAuthenticated() {
    try {
        const session = await getSession();
        if (session) {
            window.location.replace(START_PAGE);
            return true;
        }
        return false;
    } catch (_e) {
        return false;
    }
}

// UI wiring
document.addEventListener("DOMContentLoaded", function () {
    // Login form handling
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = (document.getElementById("email") || {}).value;
            const password = (document.getElementById("password") || {}).value;
            const errorMessage = document.getElementById("errorMessage");

            if (!email || !password) {
                if (errorMessage) errorMessage.textContent = "Please enter both email and password";
                return;
            }

            try {
                const result = await loginWithEmailPassword(email, password);
                if (!result.success) {
                    if (errorMessage) errorMessage.textContent = result.message || "Login failed";
                } else {
                    if (errorMessage) errorMessage.textContent = "";
                }
            } catch (err) {
                if (errorMessage) errorMessage.textContent = "Unexpected error during login";
            }
        });
    }

    // Update navigation active state
    updateActiveNav();

    // Handle mobile nav link clicks
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            closeMobileMenu();
        });
    });
});

// Highlight active nav
function updateActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        const link = item.querySelector(".nav-link");
        if (link) {
            const href = link.getAttribute("href");
            if (href === currentPage || (currentPage === "" && href === "index.html")) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        }
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.querySelector(".nav-menu");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");

    if (mobileMenu && mobileToggle) {
        mobileMenu.classList.toggle("active");
        mobileToggle.classList.toggle("active");

        if (mobileMenu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const mobileMenu = document.querySelector(".nav-menu");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");

    if (mobileMenu && mobileToggle) {
        mobileMenu.classList.remove("active");
        mobileToggle.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Close menu on outside click
document.addEventListener("click", function (event) {
    const mobileMenu = document.querySelector(".nav-menu");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");

    if (mobileMenu && mobileToggle &&
        !mobileMenu.contains(event.target) &&
        !mobileToggle.contains(event.target)) {
        mobileMenu.classList.remove("active");
        mobileToggle.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Reset menu on resize
window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Expose auth API
window.auth = {
    loginWithEmailPassword,
    logout,
    getSession,
    requireAuth,
    redirectIfAuthenticated
};

// Keep a global logout() for existing onclick handlers
window.logout = logout;

// WhatsApp Chat Widget (unchanged)
document.addEventListener("DOMContentLoaded", function () {
    const whatsappBtn = document.getElementById("whatsapp-btn");
    if (!whatsappBtn) return;

    // Replace with your own published CSV link
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkASn4kTmnDmO_3Qjt_pzaxilNpBt9eAvBM2D10HHxOY4a3bXuO33OdHyRuk5_hV1C0rLbvZkyTtLS/pub?output=csv";

    whatsappBtn.addEventListener("click", function () {
        fetch(SHEET_URL)
            .then(res => res.text())
            .then(data => {
                let firstRow = data.split("\n")[1];
                let number = firstRow && firstRow.split(",")[1] ? firstRow.split(",")[1].trim() : "";

                if (number) {
                    window.open(`https://wa.me/${number}`, "_blank");
                } else {
                    alert("WhatsApp number not found in sheet!");
                }
            })
            .catch(err => {
                console.error("Error fetching WhatsApp number:", err);
                alert("Unable to load WhatsApp number.");
            });
    });
});