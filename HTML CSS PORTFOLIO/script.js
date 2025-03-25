// Hobby Data as an Array of Objects
const hobbies = [
    { name: "Graphics Designing", image: "images/hobby1.jpg" },
    { name: "Web Designing", image: "images/hobby2.jpg" }
];

// Select the Hobby Container
const hobbyContainer = document.getElementById("hobby-container");

// Loop through hobbies and insert into the HTML
hobbies.forEach(hobby => {
    let hobbyDiv = document.createElement("div");
    hobbyDiv.classList.add("gallery-item");

    hobbyDiv.innerHTML = `
        <img src="${hobby.image}" alt="${hobby.name}">
        <p>${hobby.name}</p>
    `;

    hobbyContainer.appendChild(hobbyDiv);
});
