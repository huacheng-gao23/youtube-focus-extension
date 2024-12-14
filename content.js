// block thumbnails that do not contain the keywords
const allowedKeywords = [
  'design',
  'development',
  'coding',
  'programming',
  'tech',
  'system design',
  'interview'
  // Add more keywords as needed
];

function shouldShowVideo(title) {
  const lowercaseTitle = title.toLowerCase();
  return allowedKeywords.some(keyword => lowercaseTitle.includes(keyword.toLowerCase()));
}

function processVideoThumbnails() {
  const videoElements = document.querySelectorAll('ytd-rich-item-renderer');

  videoElements.forEach(video => {
      const titleElement = video.querySelector('#video-title');
      if (titleElement) {
          const title = titleElement.textContent;
          const thumbnailElement = video.querySelector('ytd-thumbnail');
          
          if (thumbnailElement) {
              if (!shouldShowVideo(title)) {
                  thumbnailElement.style.filter = 'blur(20px)';
                  
                  // Disable hover effects
                  const hoverOverlay = thumbnailElement.querySelector('#hover-overlays');
                  if (hoverOverlay) {
                      hoverOverlay.style.display = 'none';
                  }
                  
                  // Prevent mouse events
                  thumbnailElement.style.pointerEvents = 'none';
                  
                  // Remove any existing mouseover events
                  thumbnailElement.onmouseover = null;
                  thumbnailElement.onmouseenter = null;
              } else {
                  thumbnailElement.style.filter = 'none';
                  thumbnailElement.style.pointerEvents = 'auto';
              }
          }
          
          // Disable preview/hover functionality
          const previewElements = video.querySelectorAll('#mouseover-overlay, #hover-overlays');
          previewElements.forEach(element => {
              if (element) {
                  element.remove();
              }
          });
      }
  });
}

function disablePreviewFunctionality() {
  // Remove or disable preview-related elements
  const previewElements = document.querySelectorAll(`
      #mouseover-overlay,
      #hover-overlays,
      ytd-video-preview,
      ytd-thumbnail-overlay-toggle-button-renderer,
      .ytd-thumbnail-overlay-toggle-button-renderer
  `);
  
  previewElements.forEach(element => {
      if (element) {
          element.remove();
      }
  });
}

function blockSection() {
  // Original section blocking code
  const sections = document.querySelectorAll('ytd-rich-section-renderer');
  
  sections.forEach(section => {
      const titleElement = section.querySelector('#title-text span#title');
      if (titleElement && (
          titleElement.textContent.includes('Shorts') || 
          titleElement.textContent.includes('YouTube Playables')
      )) {
          section.remove();
      }
  });

  // Remove chips bar
  const chipsBar = document.querySelector('ytd-feed-filter-chip-bar-renderer');
  if (chipsBar) {
      chipsBar.remove();
  }

  // Process video thumbnails and disable previews
  processVideoThumbnails();
  disablePreviewFunctionality();
}

// Run when the page loads
blockSection();

// Create a more specific observer configuration
const observerConfig = {
  childList: true,
  subtree: true,
  characterData: true
};

// Create an observer instance
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
          blockSection();
      }
  });
});

// Start observing with the configured parameters
observer.observe(document.body, observerConfig);

// Additional check for dynamic content loading
window.addEventListener('yt-navigate-finish', function() {
  blockSection();
});

// Also check periodically for the first few seconds after page load
const checkInterval = setInterval(() => {
  blockSection();
}, 1000);

// Clear interval after 5 seconds
setTimeout(() => {
  clearInterval(checkInterval);
}, 5000);

// Add scroll event listener to handle dynamically loaded videos
window.addEventListener('scroll', debounce(() => {
  processVideoThumbnails();
  disablePreviewFunctionality();
}, 250));

// Debounce function to prevent too many calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}