// Check if this is the user's first visit
if (!localStorage.getItem('hasVisited')) {
    // Set the flag to indicate the user has visited
    localStorage.setItem('hasVisited', 'true');
 
    // Redirect to the loading page
    window.location.href = 'loading.html';
} 