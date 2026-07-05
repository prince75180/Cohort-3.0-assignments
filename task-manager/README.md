# Task Manager Application - Core Web Concepts

This interactive Task Manager was built using HTML, CSS, and Vanilla JavaScript to demonstrate an understanding of core browser rendering mechanisms and DOM interactions.

## Browser Rendering Pipeline

When you load this application, the browser goes through a series of steps to display it on screen:

### 1. Parsing & Tokenization
- **Parsing**: The browser receives the raw HTML bytes over the network and converts them into characters based on the specified encoding (UTF-8).
- **Tokenization**: These characters are then converted into distinct meaningful tokens (e.g., `<html >`, `<body>`, `<div class="app-container">`) as defined by the W3C HTML5 standard.

### 2. DOM Tree (Document Object Model)
The browser uses the generated tokens to build a tree-like object structure representing the HTML document. Each token becomes a node in the DOM tree. In our application, `index.html` defines nodes like the `form`, input fields, and the `ul` list that will hold our tasks.

### 3. CSSOM Tree (CSS Object Model)
Similarly, when the browser encounters `<link rel="stylesheet" href="styles.css">`, it fetches the CSS, parses it, and builds the CSSOM tree. This tree contains all styling information (colors, layouts, custom properties like `--primary`) and maps them to the corresponding nodes in the DOM.

### 4. Render Tree
The browser combines the DOM and CSSOM trees to create the **Render Tree**. The Render Tree only includes nodes that are visible on the screen (e.g., `<head>` or elements with `display: none` are intentionally excluded). The browser then calculates the exact layout (geometry) of each node and paints the pixels to the screen.

---

## JavaScript & DOM Interaction

### Attributes vs Properties
- **Attributes** are defined directly in the HTML markup (e.g., `<input type="text" id="task-title" required>`). They generally represent the initial state of the element.
- **Properties** exist on the JavaScript DOM objects that represent those elements in memory. When a user types into an input field, the `value` *property* on the object updates dynamically in JS, even if the `value` *attribute* in the HTML source remains unchanged. Our `app.js` reads `titleInput.value` (the property) to get the current user input state.

### DOM Manipulation
In `app.js`, we dynamically manipulate the DOM. When a new task is added:
- We use `document.createElement('li')` to create new list item nodes.
- We use `li.innerHTML` to safely set the HTML content inside those nodes.
- We use `taskList.appendChild(li)` to insert the new task node into the existing DOM tree. This triggers a layout recalculation and a repaint in the Render Tree.

---

## Event Handling

### Event Propagation (Bubbling & Capturing)
When an event (like a click) occurs on an element, it propagates through the DOM tree in three distinct phases:
1. **Capturing Phase**: The event travels down from the root (`window` -> `document` -> `body`) to the target element.
2. **Target Phase**: The event reaches the actual element that was clicked.
3. **Bubbling Phase**: The event bubbles up from the target element back up to the root.

Most standard event listeners trigger during the bubbling phase by default (when the third argument of `addEventListener` is false or omitted).

### Event Delegation
If we had 100 tasks in our list, attaching a unique `click` listener to every single "Delete" button or "Complete" checkbox would use excessive memory and would require constantly attaching/detaching listeners as tasks are added or removed.

Instead, we use **Event Delegation**:
- We attach *just one* listener to the parent container (`<ul id="task-list">`).
- Because of **Event Bubbling**, any click on a child element (a button or checkbox) bubbles up to the parent `ul`.
- We use `e.target` to determine exactly which child was clicked and execute the appropriate action (toggle completion or delete).

```javascript
// Example of Event Delegation in app.js
taskList.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('.delete-btn')) {
        // Handle deletion...
    }
});
```
