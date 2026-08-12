// Function to format the timestamp
function updateTimestamp() {
    const now = new Date();

    // Get the last full hour
    const lastHour = new Date(now);
    lastHour.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to zero
    lastHour.setHours(lastHour.getHours() - 1); // Subtract one hour

    // Format the date and time with am/pm
    let hours = lastHour.getHours();
    const amPm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight

    const day = lastHour.getDate(); // No need to pad single-digit days
    const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(lastHour); // Get month name
    const year = lastHour.getFullYear();

    // Create the formatted string
    const formattedTime = `${hours}:00${amPm}`; // Always display ":00"
    const formattedDate = `${day} ${month} ${year}`; // Day without leading zero
    const formattedTimestamp = `Latest at ${formattedTime} on ${formattedDate}`;

    // Update the element with the id "status"
    const timestampElement = document.getElementById('status');
    if (timestampElement) {
        timestampElement.textContent = formattedTimestamp;
    }
}

// Call the function when the page loads
window.addEventListener('load', updateTimestamp);
