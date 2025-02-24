# Vite Plugin Typed CSS Modules

This Vite plugin generates strong TypeScript definitions for CSS modules. It ensures that you have type safety when working with CSS modules in your TypeScript projects.

## Installation

Install the plugin using npm or yarn:

```sh
npm install @handnet/vite-plugin-typed-css-modules --save-dev
# or
pnpm add @handnet/vite-plugin-typed-css-modules --save-dev
# or
yarn add @handnet/vite-plugin-typed-css-modules --dev
```

## Usage

Add the plugin to your Vite configuration:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import typedCssModules from "@handnet/vite-plugin-typed-css-modules";

export default defineConfig({
    plugins: [typedCssModules()],
});
```

## How It Works

The plugin processes your CSS and SCSS files, extracts the class names, and generates corresponding TypeScript definition files (`.d.ts`). This allows you to import your CSS modules with type safety.

It uses [lightningcss](https://lightningcss.dev) under the hood to maximize performance.

## Example

Given a CSS module file `styles.module.css`:

```css
.button {
    background-color: blue;
}
```

The plugin will generate a TypeScript definition file `styles.module.css.d.ts`:

```typescript
declare const styles: {
    readonly button: string;
};
export default styles;
```

You can then import and use the styles in your TypeScript files with type safety:

```typescript
import styles from "./styles.module.css";

const buttonClass = styles.button; // type-safe
```

## Configuration

Currently, the plugin does not require any configuration. It automatically processes files with `.css` and `.scss` extensions.

## License

Apache License 2.0
