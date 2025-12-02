# Kraken Web Client: Application Architecture Overview

This application is structured using a **Layered Architecture** (often referred to as a variation of **Clean Architecture**), which is designed to separate business logic from technical implementation details. This approach guarantees that the core rules of the application are **independent**, making the system highly testable, maintainable, and adaptable to changes in external services (like switching from Kraken to Binance).

The dependency rule is simple: **Layers only depend on the layers beneath them.** The **Domain Layer** is at the core, having no dependencies on any other layer.

---

## 1. The Core: Domain Layer (Models)

The **Domain Layer** is the innermost layer and defines the universal language and core business entities of the application.

- **Purpose:** Holds the **canonical data structures** that the entire application operates on.
- **Key Components:** Entities like **`Ticker`** (our internal representation of a price update) and **`TradingPair`** (our internal representation of an asset pair).
- **Dependencies:** **Zero** external dependencies. It is the pure definition of "what we trade and what data looks like."

---

## 2. The Logic: Business Layer (Services)

The **Business Layer** contains the core application logic and orchestrates data flow.

- **Purpose:** To manage and process data streams, handle complex business rules, and prepare data for the Presentation Layer.
- **Key Components:**
  - **`RealtimeDataService`:** The central coordinator. It exposes methods like `getTradingPairs()` and `subscribeToTickerStream()`.
  - **Mappers (`TradingPairMapper`, `TickerMapper`):** Translates raw data shapes (DTOs) from the Data Layer into clean Domain Models.
- **Dependencies:** Depends only on the **Data Layer** (via an interface, which in our case is the `KrakenRepository` class) and the **Domain Layer**. It knows _what_ data to get, but not _how_ to get it.

---

## 3. The External Interface: Data Layer (Repository)

The **Data Layer** acts as an **adapter** or **gateway** to external systems (Kraken API).

- **Purpose:** To handle all low-level communication, networking, authentication, and error translation.
- **Key Components:**
  - **`KrakenRepository`:** This is the concrete implementation that knows and uses the **`ts-kraken`** library. It isolates the rest of the application from the third-party library's specific details.
  - **DTOs (Data Transfer Objects):** Temporary structures used to hold the raw, messy JSON response directly from the API before it is mapped (e.g., `KrakenAssetPairsDTO`). Important: use DTOs from `ts-kraken` if possible.
- **Dependencies:** Depends on external libraries (`ts-kraken`, RxJS) and the **Domain Layer** (as its methods return Domain Models).

---

## 4. The View: Presentation Layer (Conceptual)

This layer deals with the user interface and is the **highest-level layer**.

- **Purpose:** To manage state, handle user input, and display data fetched from the Business Layer.
- **Key Components:** A conceptual **`TradingViewController`** or **`Presenter`**.
- **Dependencies:** Depends only on the **Business Layer** (`RealtimeDataService`). It never directly interacts with the Kraken API.
