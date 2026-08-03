// ======================================
// StudentHub Portal - JavaScript
// ======================================

console.log("======================================");
console.log("      Welcome to StudentHub Portal    ");
console.log("======================================");
console.log("JavaScript Loaded Successfully!");
console.log("StudentHub Version: 1.0");

// Function with Parameters
function welcomeUser(name, course) {
    const message = `Welcome ${name} to StudentHub! You are enrolled in ${course}.`;

    // Print welcome message in console
    console.log(message);

    // Display welcome message on webpage
    const welcomeText = document.getElementById("welcomeMessage");
    if (welcomeText) {
        welcomeText.innerHTML = message;
    }

    return message;
}

// Call the function
welcomeUser("Tirth", "B.Tech IT");

// Page Load Event
window.addEventListener("DOMContentLoaded", function () {
    console.log("StudentHub homepage loaded successfully.");
});

// Explore Courses Button
const exploreBtn = document.querySelector(".btn");

if (exploreBtn) {
    exploreBtn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Explore Courses button clicked.");
        alert("Welcome to StudentHub Courses!");
    });
}

// Navigation Click Event
const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {
    link.addEventListener("click", function () {
        console.log(`Navigation: ${this.textContent}`);
    });
});

// Hero Image Hover Effect
const heroImage = document.querySelector(".hero-image img");

if (heroImage) {
    heroImage.addEventListener("mouseenter", function () {
        heroImage.style.transform = "scale(1.05)";
        heroImage.style.transition = "0.4s";
        console.log("Hero image zoomed.");
    });

    heroImage.addEventListener("mouseleave", function () {
        heroImage.style.transform = "scale(1)";
        console.log("Hero image restored.");
    });
}

// StudentHub Information
const portalInfo = {
    portal: "StudentHub",
    university: "CHARUSAT",
    department: "Information Technology",
    resources: ["Notes", "Previous Papers", "Coding Practice", "Projects"]
};

console.log("Portal Information:");
console.table(portalInfo.resources.map(item => ({ Resource: item })));

// Greeting Based on Time
const hour = new Date().getHours();

if (hour < 12) {
    console.log("Good Morning, Student!");
} else if (hour < 18) {
    console.log("Good Afternoon, Student!");
} else {
    console.log("Good Evening, Student!");
}

// Footer Message
console.log("Thank you for visiting StudentHub Portal!");