📄 [한국어 README 보기](README_KO.md)

# shared-application-modules

This repository contains shared JavaScript and Java modules extracted from real-world internal enterprise systems,
designed to improve code reuse, consistency, and maintainability.



## JavaScript Common Utilities

This repository currently includes a shared JavaScript utility module extracted from real-world internal enterprise systems.
The module is designed to standardize common UI behaviors, reduce duplicated code, and improve maintainability across multiple applications.

### commonUtils.module.js

A collection of reusable JavaScript utilities organized by responsibility.

#### 1. Component Utilities
Provides helper methods for common UI component handling.

- Initialize `<select>` elements using static option lists or API responses
- Rebind events safely by removing existing handlers before attaching new ones
- Dropdown filter UI handling with toggle and active state management

Example use cases:
- Category select box initialization
- Reusable filter dropdown components
- Safe event rebinding in dynamic DOM environments

---

#### 2. String Utilities
Utility functions for processing HTML-based content.

- Extract plain text from HTML strings
- Normalize and rewrite `<img>` tag paths to match application context

Commonly used for:
- Content sanitization
- HTML rendering consistency across environments

---

#### 3. Date Utilities
Lightweight date helper functions for frequently used date ranges.

- Get today’s date in `YYYY-MM-DD` format
- Retrieve the first and last day of the current month

Designed for:
- Search filters
- Report date range initialization

---

#### 4. Pagination Utilities
A reusable pagination component with customizable rendering.

Features:
- Configurable page size and group size
- Customizable page buttons and navigation arrows
- Event-safe re-rendering with internal state management

Intended for:
- List pages
- Data-driven reports
- Dashboard-style views with dynamic pagination
