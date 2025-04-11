
 // Function to handle search input and trigger search on Enter key
    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            searchFunction();
        }
    }

    // Function to perform search and display results
    function searchFunction() {
        const query = document.getElementById('searchInput').value;
        
        if (query.trim() === '') {
            document.getElementById('searchResults').innerHTML = '';  // Clear results if query is empty
            return;
        }

        // Perform an AJAX request to the Django search view
        fetch(`/search_files/?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data.files);
        })
        .catch(error => console.error('Error fetching search results:', error));
    }
// Function to display search results dynamically with file actions (Download, Share, Remove)
function displayResults(files) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Iterate over the files and create HTML elements for each
    files.forEach(file => {
        const fileResult = document.createElement('div');
        fileResult.classList.add('file-result');
        
        // Create file name link
        const fileLink = document.createElement('a');
        fileLink.href = file.url;
        fileLink.textContent = file.name;
        fileResult.appendChild(fileLink);

        // File actions container
        const fileActions = document.createElement('div');
        fileActions.classList.add('file-actions'); // Optional: Add a class for styling file actions

        // Download icon and link
        const downloadLink = document.createElement('a');
        const downloadIcon = document.createElement('i');
        downloadIcon.classList.add('fas', 'fa-download');
        downloadLink.href = file.url;
        downloadLink.download = file.name;  // Ensure it downloads with the correct file name
        downloadLink.title = 'Download';
        downloadLink.appendChild(downloadIcon);
        fileActions.appendChild(downloadLink);

        // Share icon and link
        const shareLink = document.createElement('a');
        const shareIcon = document.createElement('i');
        shareIcon.classList.add('fas', 'fa-share-alt');
        shareLink.href = '#';
        shareLink.title = 'Share';
        shareLink.onclick = () => {
            // Display share options when clicked
            showShareOptions(file.url);
        };
        shareLink.appendChild(shareIcon);
        fileActions.appendChild(shareLink);

        // Remove icon and link
        const removeLink = document.createElement('a');
        const removeIcon = document.createElement('i');
        removeIcon.classList.add('fas', 'fa-trash-alt');
        removeLink.href = '#';
        removeLink.title = 'Remove';
        removeLink.onclick = () => removeFile(file.url, fileResult);  // Pass the file URL to remove it from both backend and UI
        removeLink.appendChild(removeIcon);
        fileActions.appendChild(removeLink);

        // Append file actions to the file result
        fileResult.appendChild(fileActions);

        // Append the file result to the results container
        resultsContainer.appendChild(fileResult);
    });
}
// Function to display share options below the share icon like a popup
function showShareOptions(url, shareLink) {
    // Create the container for share options (if not already created)
    let options = document.querySelector('.share-options');
    
    if (!options) {
        options = document.createElement('div');
        options.classList.add('share-options');
        document.body.appendChild(options); // Append it to the body or a parent container

        // Create share option links with FontAwesome icons
        const shareLinks = [
            {
                platform: 'email',
                label: ' Email',
                url: `mailto:?subject=Check this out&body=${encodeURIComponent(url)}`,
                icon: '<i class="fas fa-envelope"></i>', // FontAwesome icon for email
            },
            {
        platform: 'whatsapp',
        label: 'WhatsApp',
        url: `https://wa.me/?text=${encodeURIComponent(url)}`,
        icon: '<i class="fab fa-whatsapp"></i>', // FontAwesome icon for WhatsApp
    },
    {
        platform: 'facebook',
        label: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        icon: '<i class="fab fa-facebook-f"></i>', // FontAwesome icon for Facebook
    },
    {
        platform: 'twitter',
        label: 'Twitter',
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
        icon: '<i class="fab fa-twitter"></i>', // FontAwesome icon for Twitter
    },
            {
                platform: 'copy',
                label: 'Copy Link',
                url: '#',
                icon: '<i class="fas fa-copy"></i>', // FontAwesome icon for Copy
                onClick: () => copyLink(url),
            },
        ];
// Example of how to render these share links in HTML
shareLinks.forEach(link => {
    const button = document.createElement('button');
    button.innerHTML = `${link.icon} Share on ${link.label}`;
    button.onclick = () => window.open(link.url, '_blank');
    document.body.appendChild(button);
});
        // Create and append each link
        shareLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank'; // Open in new tab for share links
            if (link.onClick) {
                a.addEventListener('click', link.onClick);
            }

            const icon = document.createElement('span');
            icon.classList.add('icon');
            icon.innerHTML = link.icon; // Add the FontAwesome icon here

            const text = document.createElement('span');
            text.innerHTML = link.label;

            a.appendChild(icon);
            a.appendChild(text);

            options.appendChild(a);
        });
    }

    // Get the position of the share link (icon)
    const rect = shareLink.getBoundingClientRect();
    const shareIconHeight = rect.height;
    const shareIconTop = rect.top + window.scrollY; // Get the position relative to the page

    // Position the options below the share icon
    options.style.top = (shareIconTop + shareIconHeight + 5) + 'px'; // 5px gap below the icon
    options.style.left = rect.left + 'px'; // Align left with the share icon

    // Show the options with a smooth popup effect
    options.style.display = 'block';
    setTimeout(() => {
        options.style.opacity = 1; // Fade in effect
        options.style.transform = 'translateY(0)'; // Animate into position
    }, 10); // Delay for animation to take effect

    // Hide the options when clicking elsewhere on the page
    document.addEventListener('click', function hideOptions(event) {
        if (!shareLink.contains(event.target) && !options.contains(event.target)) {
            options.style.opacity = 0; // Fade out effect
            options.style.transform = 'translateY(-10px)'; // Slightly offset
            setTimeout(() => {
                options.style.display = 'none'; // Hide after animation
            }, 300); // Delay to match the transition duration
            document.removeEventListener('click', hideOptions); // Remove the event listener
        }
    });
}

// Function to copy the link to clipboard
function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch((error) => {
        console.error('Error copying link: ', error);
    });
}

// File Upload Function for Multiple Files
function uploadFile() {
    const input = document.getElementById('fileInput');
    const files = input.files;
    const formData = new FormData();

    if (files.length > 0) {
        // Display loading indicator
        const uploadStatus = document.getElementById('uploadStatus');
        uploadStatus.textContent = 'Uploading files...';  // Displaying message
        uploadStatus.style.display = 'block';  // Make sure the status is visible

        // Append each file to the FormData object
        Array.from(files).forEach(file => {
            formData.append('file', file);  // 'file' is the key that Django expects
        });

        // Send the files to the Django server using Fetch API
        fetch('/upload/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Files uploaded successfully') {
                // After upload, fetch the latest list of files from the backend
                getUploadedFiles();
            } else {
                alert('File upload failed');
            }
            uploadStatus.style.display = 'none';  // Hide the status message after upload
        })
        .catch(error => {
            console.error('Error uploading files:', error);
            uploadStatus.style.display = 'none';  // Hide status in case of error
        });

        input.value = '';  // Clear the file input after upload
    }
}  
function getUploadedFiles() {
    fetch('/get_files/')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('uploadedFiles');
            container.innerHTML = '';  // Clear current files
            const files = data.files;

            files.forEach((file) => {
                // Create a clickable link for the entire file box
                const fileLink = document.createElement('a');
                fileLink.href = file.file_url;  // Use the file URL for redirection
                fileLink.target = '_blank';  // Open in a new tab (optional)

                const fileView = document.createElement('div');
                fileView.classList.add('file-view');

                const fileNameElement = document.createElement('div');
                const fileNameLink = document.createElement('span');
                fileNameLink.textContent = file.file_name;

                const fileIcon = document.createElement('i');
                fileIcon.classList.add('fas');

                // Add icons based on the file type
                switch(file.file_type) {
                    case 'image':
                        fileIcon.classList.add('fa-image');
                        break;
                    case 'video':
                        fileIcon.classList.add('fa-video');
                        break;
                    case 'audio':
                        fileIcon.classList.add('fa-headphones');
                        break;
                    case 'pdf':
                        fileIcon.classList.add('fa-file-pdf');
                        break;                    
                    case 'docx':
                        fileIcon.classList.add('fa-file-word');
                        break;
                    case 'excel':
                        fileIcon.classList.add('fa-file-excel');
                        break;
                    case 'zip':
                        fileIcon.classList.add('fa-file-archive');
                        break;
                    case 'exe':
                        fileIcon.classList.add('fa-cogs');
                        break;
                    case 'html':
                        fileIcon.classList.add('fa-html5');
                        break;

                    case 'txt':
                        fileIcon.classList.add('fa-file-alt');
                        break;
                    default:
                        fileIcon.classList.add('fa-file');
                        break;
                }

                fileNameElement.classList.add('file-name');
                fileNameElement.appendChild(fileIcon);
                fileNameElement.appendChild(fileNameLink);

                // Create the preview container for the file
                const previewContainer = document.createElement('div');
                previewContainer.classList.add('file-preview');

                const staticPath = "/static/"; // Replace this with a dynamic way if needed


                // Add file preview depending on the file type
                switch (file.file_type) {
                    case 'image':
                        const imagePreview = document.createElement('img');
                        imagePreview.src = file.file_url;
                        imagePreview.alt = file.file_name;
                        imagePreview.classList.add('file-preview-img');
                        previewContainer.appendChild(imagePreview);
                        break;

                    case 'video':
                        const videoPreview = document.createElement('video');
                        videoPreview.controls = false;
                        videoPreview.src = file.file_url;
                        videoPreview.classList.add('file-preview-video');
                        previewContainer.appendChild(videoPreview);
                        break;

                    case 'audio':
                         // Create an image preview
    const audioImgPreview = document.createElement('img');
    audioImgPreview.src = 'static/music.png';  // Path to the preview image
    audioImgPreview.alt = 'Audio Preview';
    audioImgPreview.style.width = '1500px';  // Adjust size as needed
    audioImgPreview.style.cursor = 'pointer';
    
    // Create an audio player (initially hidden)
    const audioPreview = document.createElement('audio');
    audioPreview.controls = true;
    audioPreview.src = file.file_url;
    audioPreview.style.display = 'none'; // Hide audio initially
    
    // Show audio player when image is clicked
    audioImgPreview.addEventListener('click', function() {
        audioImgPreview.style.display = 'none'; // Hide image after clicking
        audioPreview.style.display = 'block'; // Show audio player
        audioPreview.play(); // Start playing automatically
    });
    
    previewContainer.appendChild(audioImgPreview);
    previewContainer.appendChild(audioPreview);
    break;


                    case 'pdf':
    // Create an image preview
    const pdfImgPreview = document.createElement('img');
    pdfImgPreview.src = 'static/PDF_file.png';  // Path to the preview image
    pdfImgPreview.alt = 'PDF Preview';
    pdfImgPreview.style.width = '180px';  // Adjust size as needed
    pdfImgPreview.style.cursor = 'pointer';
    
    // Embed PDF in an iframe for inline preview
    const iframePreview = document.createElement('iframe');
    iframePreview.src = file.file_url;
    iframePreview.width = "100%";  // Ensure iframe is responsive
    iframePreview.height = "500px";  // You can adjust this based on your needs
    iframePreview.classList.add('file-preview-pdf');
    iframePreview.style.display = 'none'; // Hide PDF initially

    // Show PDF when image is clicked
    pdfImgPreview.addEventListener('click', function() {
        pdfImgPreview.style.display = 'none'; // Hide image after clicking
        iframePreview.style.display = 'block'; // Show PDF
    });

    previewContainer.appendChild(pdfImgPreview);
    previewContainer.appendChild(iframePreview);
    break;

    

    case 'html':
        // Create an image preview for HTML
        const htmlImgPreview = document.createElement('img');
        htmlImgPreview.src = staticPath + "HTML.png";  // Correct static path
        htmlImgPreview.alt = 'HTML Preview';
        htmlImgPreview.style.width = '180px';  
        htmlImgPreview.style.cursor = 'pointer';

        // Create an iframe to preview HTML content
        const htmlIframePreview = document.createElement('iframe');
        htmlIframePreview.src = file.file_url;
        htmlIframePreview.width = "100%";  
        htmlIframePreview.height = "500px";  
        htmlIframePreview.classList.add('file-preview-html');
        htmlIframePreview.style.display = 'none';

        // Show HTML preview when image is clicked
        htmlImgPreview.addEventListener('click', function () {
            htmlImgPreview.style.display = 'none'; 
            htmlIframePreview.style.display = 'block';  
        });

        previewContainer.appendChild(htmlImgPreview);
        previewContainer.appendChild(htmlIframePreview);
        break;


                        case 'docx':
    // Create an image preview for DOCX
    const docxImgPreview = document.createElement('img');
    docxImgPreview.src = '/static/DOCX.png';  // Ensure correct path
    docxImgPreview.alt = 'DOCX Preview';
    docxImgPreview.style.width = '180px';  // Adjust size
    docxImgPreview.style.cursor = 'pointer';

    // Create an iframe to preview DOCX (Google Docs Viewer)
    const docxIframePreview = document.createElement('iframe');
    docxIframePreview.src = `https://docs.google.com/gview?url=${encodeURIComponent(file.file_url)}&embedded=true`;
    docxIframePreview.width = "100%";  
    docxIframePreview.height = "500px";  
    docxIframePreview.classList.add('file-preview-docx');
    docxIframePreview.style.display = 'none'; // Hide iframe initially

    // Show DOCX preview when image is clicked
    docxImgPreview.addEventListener('click', function () {
        docxImgPreview.style.display = 'none'; // Hide image
        iframePreview.style.display = 'block'; // Show iframe
    });

    previewContainer.appendChild(docxImgPreview);
    previewContainer.appendChild(iframePreview);
    break;

                        case 'zip':
    // Create an img element
    const img = document.createElement('img');
    img.src = 'static/ZIP.png';  // Use a relative path instead of an absolute local path
    img.alt = 'ZIP file image';
    img.style.width = '100px';  // Adjust size as needed
    img.style.cursor = 'pointer';

    // Clear any previous content in the preview container and append the image
    previewContainer.innerHTML = '';  // Optional, to clear existing content
    previewContainer.appendChild(img);
                        break;


                    case 'exe':
                        previewContainer.textContent = 'No preview available for executable files';
                        break;
                        case 'txt':
    // Create an image preview
    const txtImgPreview = document.createElement('img');
    txtImgPreview.src = 'static/txt.jpg';  // Ensure correct path
    txtImgPreview.alt = 'TXT Preview';
    txtImgPreview.style.width = '180px';  // Adjust as needed
    txtImgPreview.style.cursor = 'pointer';
    txtImgPreview.style.display = 'block';  // Ensure visibility

    // Create a container for the text preview (hidden initially)
    const textPreview = document.createElement('pre');
    textPreview.style.display = 'none';
    textPreview.style.whiteSpace = 'pre-wrap';  // Ensure text wraps properly
    textPreview.style.maxHeight = '300px'; // Limit height to avoid large previews
    textPreview.style.overflowY = 'auto';  // Enable scrolling for large files

    // Fetch and display the contents of the .txt file on image click
    txtImgPreview.addEventListener('click', function() {
        fetch(file.file_url)
            .then(response => response.text())
            .then(text => {
                textPreview.textContent = text;
                txtImgPreview.style.display = 'none'; // Hide image after clicking
                textPreview.style.display = 'block';  // Show text content
            })
            .catch(err => {
                textPreview.textContent = 'Error loading text file.';
                console.error(err);
            });
    });

    previewContainer.appendChild(txtImgPreview);
    previewContainer.appendChild(textPreview);
    break;

                    default:
                        previewContainer.textContent = 'No preview available';
                        break;
                }

                // File actions (Download, Share, Remove)
                const fileActions = document.createElement('div');
                fileActions.classList.add('file-actions');

                // Download icon and link
                const downloadLink = document.createElement('a');
                const downloadIcon = document.createElement('i');
                downloadIcon.classList.add('fas', 'fa-download');
                downloadLink.href = file.file_url;
                downloadLink.download = file.file_name;
                downloadLink.title = 'Download';
                downloadLink.appendChild(downloadIcon);

                // Share icon and link
                const shareLink = document.createElement('a');
                const shareIcon = document.createElement('i');
                shareIcon.classList.add('fas', 'fa-share-alt');
                shareLink.href = '#';
                shareLink.title = 'Share';
                shareLink.onclick = () => {
                    showShareOptions(file.file_url);
                };
                shareLink.appendChild(shareIcon);

                // Remove icon and link
                const removeLink = document.createElement('a');
                const removeIcon = document.createElement('i');
                removeIcon.classList.add('fas', 'fa-trash-alt');
                removeLink.href = '#';
                removeLink.title = 'Remove';
                removeLink.onclick = () => removeFile(file.file_url, fileView);
                removeLink.appendChild(removeIcon);

                // Append actions to the fileActions div
                fileActions.appendChild(downloadLink);
                fileActions.appendChild(shareLink);
                fileActions.appendChild(removeLink);

                // Append elements to the fileView
                fileView.appendChild(fileNameElement);
                fileView.appendChild(previewContainer);
                fileView.appendChild(fileActions);

                // Append the fileView to the link element
                fileLink.appendChild(fileView);

                // Append the link to the container
                container.appendChild(fileLink);
            });
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
}

function showShareOptions(url) {
    // Create the share options modal
    const modal = document.createElement('div');
    modal.classList.add('share-modal');
    
    // Close the modal when clicked outside of it
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeShareOptions();
        }
    });

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.classList.add('share-modal-content');
    
    // Title of the popup
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Share this file';
    modalContent.appendChild(modalTitle);

    // Social media options with icons
    const shareLinks = [
        {
            platform: 'Email',
            iconClass: 'fa-envelope',
            link: `mailto:?subject=Check%20this%20file&body=${url}`
        },
        {
            platform: 'WhatsApp',
            iconClass: 'fa-whatsapp',
            link: `https://wa.me/?text=${url}`
        },
        {
            platform: 'Facebook',
            iconClass: 'fa-facebook',
            link: `https://www.facebook.com/sharer/sharer.php?u=${url}`
        },
        {
            platform: 'Twitter',
            iconClass: 'fa-twitter',
            link: `https://twitter.com/intent/tweet?url=${url}`
        },
        {
            platform: 'Copy Link',
            iconClass: 'fa-link',
            action: () => copyLink(url)  // This function is defined below
        }
    ];

    // Create a button for each share option
    shareLinks.forEach((shareOption) => {
        const button = document.createElement('button');
        button.classList.add('share-button');

        const icon = document.createElement('i');
        icon.classList.add('fas', shareOption.iconClass);
        button.appendChild(icon);

        const text = document.createElement('span');
        text.textContent = `.${shareOption.platform}`;
        button.appendChild(text);

        // Add event listener for each button
        if (shareOption.link) {
            button.onclick = () => window.open(shareOption.link, '_blank');
        } else if (shareOption.action) {
            button.onclick = shareOption.action;
        }

        modalContent.appendChild(button);
    });

    // Append modal content to the modal
    modal.appendChild(modalContent);
    
    // Add modal to the body
    document.body.appendChild(modal);
}

// Function to copy the link to clipboard
function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch((error) => {
        console.error('Error copying link:', error);
    });
}

// Close the share options modal
function closeShareOptions() {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        modal.remove();
    }
}

// Call this function on page load to get initial files
window.onload = getUploadedFiles;





// the delete request to Django
function removeFile(fileUrl, fileViewElement) {
    // Send AJAX request to remove the file from the backend
    fetch('/remove-file/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // Make sure you send CSRF token in the request header
        },
        body: JSON.stringify({ file_url: fileUrl })  // Sending the file URL to the backend for deletion
    })
    .then(response => response.json())  // Parse the response as JSON
.then(data => {
    console.log(data);  // Add this for debugging purposes
    if (data.success) {
        // If the response indicates success, remove the file from the UI
        fileViewElement.remove();
        alert('File removed successfully');
    } else {
        alert('Failed to remove the file: ' + (data.error || 'Unknown error'));
    }
})

    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while deleting the file');
    });
}



//  cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


 //   about script
         // Get references to the elements
         const aboutLink = document.getElementById('about-link');
        const popup = document.getElementById('popup');
        const popupOverl = document.getElementById('popup-overlay');
        const closeBtn = document.getElementById('close-btn');

        // Show the popup when the "About" link is clicked
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default link behavior
            popup.style.display = 'block';
            popupOverl.style.display = 'block';
        });

        // Close the popup when the close button is clicked
        closeBtn.addEventListener('click', function() {
            popup.style.display = 'none';
            popupOverl.style.display = 'none';
        });

        // Close the popup when the overlay is clicked
        popupOverl.addEventListener('click', function() {
            popup.style.display = 'none';
            popupOverl.style.display = 'none';
        });
    


function searchFiles() {
    const query = document.getElementById('searchInput').value;

    // Send the search query to the server via AJAX
    fetch(`/search_files/?query=${query}`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = ''; // Clear previous results

            // Check if there are files in the response
            if (data.files.length > 0) {
                data.files.forEach(file => {
                    const fileView = document.createElement('div');
                    fileView.classList.add('file-view');  // Apply the same class as in getUploadedFiles

                    const fileNameElement = document.createElement('div');
                    const fileNameLink = document.createElement('a');
                    fileNameLink.href = `/media/${file.name}`;  // Construct the URL for the file
                    fileNameLink.target = '_blank';  // Open in a new tab
                    fileNameLink.textContent = file.name;  // Display the file name as the link text

                    // Apply style to decrease font size and adjust layout
                    fileNameElement.classList.add('file-name');
                    fileNameElement.appendChild(fileNameLink);

                    const fileActions = document.createElement('div');
                    fileActions.classList.add('file-actions');

                    // Download link for the file with custom color
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `/media/${file.name}`;
                    downloadLink.download = file.name;
                    downloadLink.textContent = 'Download';
                    downloadLink.style.color = '#FF9900';  // Set the color for the download link

                    // Remove link for the file with custom color
                    const removeLink = document.createElement('a');
                    removeLink.href = '#';
                    removeLink.textContent = 'Remove';
                    removeLink.style.color = '#FF9900';  // Set the color for the remove link
                    removeLink.onclick = () => removeFile(file.name, fileView); // Pass the file name to remove it

                    fileActions.appendChild(downloadLink);
                    fileActions.appendChild(removeLink);

                    fileView.appendChild(fileNameElement);
                    fileView.appendChild(fileActions);

                    resultsDiv.appendChild(fileView);
                });
            } else {
                resultsDiv.textContent = 'No files found';
            }
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
}









// Get the file input and the container for displaying the files
const fileInput = document.getElementById('fileInput');
  const uploadedFilesDiv = document.getElementById('uploadedFiles');

  // Event listener for file input changes
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    uploadedFilesDiv.innerHTML = ''; // Clear any existing content

    // Loop through all selected files
    for (const file of files) {
      const fileItem = document.createElement('div');
      fileItem.classList.add('file-item');
      fileItem.textContent = file.name;

      // Add click event to open file content
      fileItem.addEventListener('click', () => {
        openFileContent(file);
      });

      uploadedFilesDiv.appendChild(fileItem);
    }
  });

  // Function to open and display the file content based on its type
  function openFileContent(file) {
    const fileReader = new FileReader();

    // For text-based files (txt, html, json, etc.)
    fileReader.onload = (event) => {
      const content = event.target.result;

      if (isTextFile(file)) {
        // Display content in a new window for text files
        const newWindow = window.open();
        newWindow.document.write('<pre>' + content + '</pre>');
        newWindow.document.close();
      } else if (file.type.startsWith('image')) {
        // Display image files
        const newWindow = window.open();
        const img = document.createElement('img');
        img.src = content;
        img.style.maxWidth = '100%';
        newWindow.document.body.appendChild(img);
      } else if (file.type.startsWith('audio') || file.type.startsWith('video')) {
        // For media files (audio, video), display in new window or element
        const newWindow = window.open();
        const mediaElement = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');
        mediaElement.controls = true;
        mediaElement.src = content;
        newWindow.document.body.appendChild(mediaElement);
      } else {
        alert('File type not supported for viewing in browser');
      }
    };

    // Read the file as data URL for images, audio, video
    if (file.type.startsWith('image') || file.type.startsWith('audio') || file.type.startsWith('video')) {
      fileReader.readAsDataURL(file);
    } else {
      // For text-based files, read as text
      fileReader.readAsText(file);
    }
  }

  // Function to determine if a file is a text-based file (for simple text display)
  function isTextFile(file) {
    return file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/html';
  }



  //home event 
  document.getElementById("home-link").addEventListener("click", function(event) {
        event.preventDefault();  // Prevent default anchor link behavior
        window.location.href = "{% url 'index' %}";  // Redirect to homepage using Django URL tag
    });

//Include your static JavaScript file or script block 
<script src="{% static 'js/search.js' %}"></script>
