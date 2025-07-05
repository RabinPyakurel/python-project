document.addEventListener("DOMContentLoaded", function () {
  // Safe element initialization
  var base64ImageData;
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const classifyBtn = document.getElementById("classifyBtn");
  const imagePreview = document.getElementById("imagePreview");
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const results = document.getElementById("results");

  // Verify elements exist
  if (!uploadArea || !fileInput || !classifyBtn || !imagePreview) {
    console.error("Missing required elements");
    return;
  }

  // Initialize drop zone
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    uploadArea.classList.add("highlight");
  }

  function unhighlight() {
    uploadArea.classList.remove("highlight");
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    if (dt.files.length) {
      fileInput.files = dt.files; // Sync with file input
      handleFiles(dt.files);
    }
  }

  function handleFileSelect() {
    if (this.files && this.files.length) {
      handleFiles(this.files);
    }
  }

  function handleFiles(files) {
    const file = files[0];
    if (!file.type.match("image.*")) {
      showError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      base64ImageData = e.target.result;
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      classifyBtn.disabled = false;
      error.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  // Event listeners
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, unhighlight, false);
  });

  uploadArea.addEventListener("drop", handleDrop);
  fileInput.addEventListener("change", handleFileSelect);
  classifyBtn.addEventListener("click", classifyImage);

  async function classifyImage() {
    if (!base64ImageData) {
      showError("Please select an image first");
      return;
    }

    showLoading(true);
    clearError();

    try {
      const response = await fetch("http://127.0.0.1:5000/classify_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64ImageData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Server returned an error");
      }

      displayResults(data);
    } catch (err) {
      showError(err.message);
      console.error("Error:", err);
    } finally {
      showLoading(false);
    }
  }

  function displayResults(data) {
    results.innerHTML = `
    <div class="result-card">
      <h2>${data.primary_class}</h2>
      <p class="confidence">Confidence: ${data.confidence}</p>
      <p class="description">${data.description}</p>
    </div>
  `;
    results.style.display = "block";
  }

  function showLoading(show) {
    loading.style.display = show ? "flex" : "none";
    classifyBtn.disabled = show;
  }

  function showError(message) {
    error.textContent = message;
    error.style.display = "block";
  }

  function clearError() {
    error.style.display = "none";
  }
});
