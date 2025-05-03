const hobbies = [
    { name: "Graphics Designing", image: "images/hobby1.jpg" },
    { name: "Web Designing", image: "images/hobby2.jpg" }
];

const hobbyContainer = document.getElementById("hobby-container");

hobbies.forEach(hobby => {
    let hobbyDiv = document.createElement("div");
    hobbyDiv.classList.add("gallery-item");

    hobbyDiv.innerHTML = `
        <img src="${hobby.image}" alt="${hobby.name}">
        <p>${hobby.name}</p>
    `;

    hobbyContainer.appendChild(hobbyDiv);
});
