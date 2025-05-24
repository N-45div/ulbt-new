## Installation

To get started with this project, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/LawyaltechGame/LawyaltechGame.git
   cd my-react-app
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Components

### MatchLine

A component that renders lines connecting matched items.

**Props:**
- `matches`: Array of match objects containing `jargonId`, `definitionId`, and `isCorrect`.
- `positions`: Object containing positions of items.

### MatchItem

A component representing an item that can be matched.

**Props:**
- `id`: Unique identifier for the item.
- `text`: Text to display.
- `onSelect`: Function to call when the item is selected.
- `isSelected`: Boolean indicating if the item is selected.
- `isDefinition`: Boolean indicating if the item is a definition.
- `setPosition`: Function to set the position of the item.

## Pages

### Level2

A page where users can match jargons with their definitions.

**State:**
- `selectedJargon`: Currently selected jargon.
- `matches`: Array of matched items.
- `score`: Current score.
- `positions`: Object containing positions of items.

**Functions:**
- `handleSelection`: Handles the selection of jargons and definitions.
- `updatePosition`: Updates the position of items.
