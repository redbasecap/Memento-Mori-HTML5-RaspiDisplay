/**
 * Memento Mori Calendar Generator
 * 
 * This script generates a visual calendar representing weeks in a human life,
 * with each square representing one week. Filled squares represent weeks already lived.
 * 
 * The calendar is divided into decades, with each decade containing two rectangular grids.
 * This creates a visual representation of mortality and time progression.
 */

// Get CSS variables for grid configuration
const rows_per_rect = get_css_variable("--rows-per-rect");
const cols_per_rect = get_css_variable("--cols-per-rect");

// DOM reference to calendar container
let calendar = document.getElementById("calendar");

// Set life expectancy constant and calculate decades
const life_expectancy = 81; // Average life expectancy in years
let numDecades = Math.floor(life_expectancy / 10);

// Initialize calendar structure
populate_calendar(numDecades);

// Fill calendar with a birthdate (default for demonstration)
/* fill_calendar("01/01/1999"); */

/**
 * Fills each week cell based on birthdate until current date
 * 
 * @param {string} bday - Birthday in format dd/mm/yyyy
 * 
 * Algorithm:
 * 1. Convert date string to Date object
 * 2. Calculate difference between birthdate and current date
 * 3. Convert difference to completed weeks
 * 4. Paint each completed week
 * 5. Apply special styling to most recent week
 */
function fill_calendar(bday) {
    // Convert from dd/mm/yyyy to mm/dd/yyyy for Date constructor
    let [day, month, year] = bday.split("/");
    bday = new Date(`${month}/${day}/${year}`);

    // Calculate days between birthdate and now
    let now = new Date();
    let day_diff = (now - bday) / (1000 * 3600 * 24);

    // 52*7 = 364: each year misses 1 day.
    // Adjusting this error for weeks calculation
    let years = Math.floor(day_diff / 365);
    let remaining_weeks = Math.floor((day_diff % 365) / 7);

    // Calculate total weeks lived
    let num_weeks = years * 26 * 2 + remaining_weeks;

    // Paint each week that has passed
    for (let week = 0; week < num_weeks; week++) {
        paint_week(week);
    }
    
    // Add blinking effect to the last filled week (current week)
    const lastWeek = document.getElementById(`week-${num_weeks - 1}`);
    if (lastWeek) {
        lastWeek.classList.add('last-filled');
    }
}

/**
 * Fills a single week cell with the dark color
 * 
 * @param {number} num - The week number (ID)
 */
function paint_week(num) {
    const week = document.getElementById(`week-${num}`);
    if (week != null) {
        week.style.backgroundColor = get_css_variable("--color-dark-gray");
    }
}

/**
 * Sets unique IDs for each week cell in the calendar
 * 
 * @param {number} numDecades - Number of decades to process
 * 
 * The ID assignment follows this logic:
 * - Each decade has 520 weeks (52 weeks × 10 years)
 * - Each rectangle has columns defined by cols_per_rect
 * - IDs are sequential across decades and rectangles
 */
function set_ids(numDecades) {
    const weeks_per_year = cols_per_rect * 2;
    const weeks_per_decade = weeks_per_year * 10;

    for (let decade = 0; decade < numDecades; decade++) {
        const decade_weeks = decade * weeks_per_decade;
        for (let rect = 0; rect < 2; rect++) {
            const r = document.getElementById(`rect-${decade}-${rect}`);
            const rect_weeks = rect * cols_per_rect;
            r.childNodes.forEach((cell, index) => {
                // Calculate row and column position
                let rect_rows = Math.floor(index / 26);
                let offset = index % cols_per_rect;
                // Generate unique sequential ID
                let id =
                    decade_weeks + rect_rows * weeks_per_year + rect_weeks + offset;
                cell.id = `week-${id}`;
            });
        }
    }
}

/**
 * Creates the entire calendar structure based on decades
 * 
 * @param {number} numDecades - Number of decades to create
 */
function populate_calendar(numDecades) {
    // Create decade containers
    for (let i = 0; i < numDecades; i++) {
        spawn_decade(i);
    }

    // Assign IDs to all week cells
    set_ids(numDecades);
}

/**
 * Creates a pair of rectangles for a decade
 * 
 * @param {number} decade - The decade number (used for ID)
 */
function spawn_decade(decade) {
    for (let i = 0; i < 2; i++) {
        const rect = spawn_rectangle(rows_per_rect, cols_per_rect);
        rect.id = `rect-${decade}-${i}`;
        calendar.appendChild(rect);
    }
}

/**
 * Creates a grid of cells forming a rectangle
 * 
 * @param {number} rows - Number of rows in the rectangle
 * @param {number} cols - Number of columns in the rectangle
 * @returns {HTMLElement} - The created rectangle container with week cells
 */
function spawn_rectangle(rows, cols) {
    const rect = document.createElement("div");
    rect.classList.add("rect-container");

    // Create a grid of week cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            rect.appendChild(spawn_cell());
        }
    }
    return rect;
}

/**
 * Creates a single week cell
 * 
 * @returns {HTMLElement} - A div element representing a week
 */
function spawn_cell() {
    const div = document.createElement("div");
    div.classList.add("week-cell");
    return div;
}

/**
 * Utility function to get CSS variables from the document root
 * 
 * @param {string} name - CSS variable name (without the -- prefix)
 * @returns {string} - The computed value of the CSS variable
 */
function get_css_variable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(
        name
    );
}

/**
 * Calendar download functionality
 * Uses html2canvas to convert the calendar to a downloadable image
 */
document.getElementById("downloadBtn").addEventListener("click", () => {
    html2canvas(document.querySelector(".content")).then((canvas) => {
        // Create download link
        let anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = "mementoMori.png";
        anchorTag.href = canvas.toDataURL();
        anchorTag.target = '_blank';
        anchorTag.click(); 
    });
});