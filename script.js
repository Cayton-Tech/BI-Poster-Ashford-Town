document.addEventListener('DOMContentLoaded', (event) => {
    // Select tile elements (only once)
const tiles = document.querySelectorAll('.tile');

// Add click event listeners to tiles 
tiles.forEach(tile => {
    tile.addEventListener('click', () => {
        const targetPage = tile.getAttribute('data-target');
        window.location.href = `${targetPage}.html`; 
    });
});

// Select the treemap container
const treemapContainer = document.querySelector('.treemap-container'); 

// Treemap dimensions
const margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Create SVG for treemap
const svg = d3.select(".treemap-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Function to create a treemap
function createTreemap(data) {

    // Convert data values to numbers 
    data.forEach(d => {
        d.value = +d.value; // The "+" converts the string to a number
    });

  // Create the hierarchical data structure
  const root = d3.hierarchy(data)
    .sum(d => d.value) // Use 'value' column for size
    .sort((a, b) => b.value - a.value); // Sort descending by value

  // Use treemap layout
  d3.treemap()
    .size([width, height])
    .padding(2)
    (root); 

  // Create color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Use a categorical color scheme

  // Add rectangles for each node
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style("stroke", "black")
      .style("fill", d => colorScale(d.parent.data.category)) // Color by parent category
      .on("mouseover", function(event,d) {  // Add tooltip on mouseover
        tooltip
          .style("opacity", 1)
          .html(`Category: ${d.parent.data.category}
Subcategory: ${d.data.subcategory}
Value: £${d.data.value}`)
          .style("left", (event.pageX + 10) + "px") 
          .style("top", (event.pageY - 28) + "px"); 
      })
      .on("mouseout", function(d) { // Hide tooltip on mouseout
        tooltip
          .style("opacity", 0);
      });

  // Add text labels for each node
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", d => d.x0+5)    // +5 to adjust position (margin)
      .attr("y", d => d.y0+20)    // +20 to adjust position (margin)
      .text(d => d.data.subcategory)
      .attr("font-size", "12px") 
      .attr("fill", "white");

  // Create tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  // Clear previous treemap before creating a new one
  svg.selectAll("rect").remove();
  svg.selectAll("text").remove();
}

// Load initial data (Income)
d3.csv("income_data.csv").then(data => {
    createTreemap(data);
});

// Handle side navigation clicks
const sideNavLinks = document.querySelectorAll('.side-nav a');

sideNavLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const category = link.getAttribute('data-category');

        // Load data based on selected category (Corrected path to CSV)
        d3.csv(`./${category}_data.csv`).then(data => {  // Add "./" before the file name
            createTreemap(data); 
        });
    });
});

// Navigation from other pages (Add this to script.js)
if (window.location.pathname.includes('finance.html')) { // Check if on finance.html
    const homeLink = document.querySelector('a[href="index.html"]'); // Select the Home link
    homeLink.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirect to index.html
    });
}
}); 

