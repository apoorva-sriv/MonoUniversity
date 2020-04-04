// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Examples
const input = document.querySelector("input");
const preview = document.querySelector("#inline-container");

// This will be called when the user has chosen a file, NOT when input is 'click'ed (otherwise
// input.files will be empty when run immediately after just clicking and before the user has chosen anything)!
input.addEventListener("input", function changeInput() {
    const curFiles = input.files;
    if (curFiles.length === 1) {
        const file = curFiles[0];

        if (validFileType(file)) {
            const imgURL = URL.createObjectURL(file);
            document.querySelector("#profile-image").src = imgURL;
            document.querySelector("#pfp img").src = imgURL;
        }
    }
});

preview.addEventListener("click", function clickPreview() {
    input.click();
});

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const fileTypes = [
    'image/apng',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    `image/x-icon`
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

const userName = document.querySelector("#username");
const first = userName.textContent;
userName.addEventListener("input", function editUsername() {
    console.log(userName.textContent);
    if (!userName.textContent) {
        userName.textContent = first;
    }
});

// Current tokens
document.querySelector("#tokens").innerHTML =
    "  <div class=\"column\">\n" +
    "    <img src='img/pieces/default-black.png'>\n" +
    "  </div>\n" +
    "  <div class=\"column\">\n" +
    "    <img src='img/pieces/cop-black.png'>\n" +
    "  </div>\n" +
    "  <div class=\"column\">\n" +
    "    <img src='img/pieces/lawyer-black.png'>\n" +
    "  </div>\n";

const isAdmin = true;
if (isAdmin) {
    document.querySelector(".fa-ul").innerHTML += '<br><li><span class="fa-li"><i class="fas fa-user-shield" aria-hidden="true"></i></span><strong>Admin</strong></li>';
    document.querySelector(".fa-ul li:last-child").style.color = "red";
}