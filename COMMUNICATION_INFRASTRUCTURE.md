# FleetConnect Communication Infrastructure - Architectural Blueprint

## 1. Directory Structure
All communication logic will reside in a centralized module to ensure SaaS scalability and maintainability.

```
src/modules/communication/
├── core/
│   ├── engine.js           # Main CommunicationService (Orchestrator)
│   ├── config.js           # Theme (Teal/Black), Branding & Provider Settings
│   ├── normalizer.js       # Rehydrates & standardizes Supabase objects
│   └── routes.js           # Centralized CTA/URL Builder
├── providers/
│   ├── base.provider.js    # Abstract class for email providers
│   ├── resend.provider.js  # Resend.com implementation
│   └── mock.provider.js    # Console logger for local verification
├── templates/
│   ├── renderer.js         # Assembles components into responsive HTML
│   ├── components/         # Reusable HTML snippets (Header, CTA, Footer)
│   └── registry.js         # Maps triggers to template files/logic
├── l10n/
│   ├── translations.js     # Email-specific strings (NL, FR, EN)
│   └── engine.js           # Handles single-language vs Trilingual Fallback
└── index.js                # Unified entry point
```

## 2. Lifecycle Triggers
The system will react to the following operational events:

| Trigger | Origin | Key Data |
| :--- | :--- | :--- |
| `BOOKING_CONFIRMATION` | Website | Booking ID, Customer Email |
| `BOOKING_ACCEPTED` | Admin Panel | Operator ID, Booking Details |
| `DRIVER_ASSIGNED` | Admin Panel | Driver UUID (Name, Vehicle, Plate) |
| `BOOKING_CANCELLED` | Admin Panel | Cancellation Reason |
| `BOOKING_COMPLETED` | System/Admin | Ride Summary, Review CTA |
| `ACCOUNT_WELCOME` | Future Auth | Password Setup Link |

## 3. Data Flow (SaaS Ready)
1. **Trigger:** Operational code calls `CommunicationService.dispatch(TRIGGER, payload)`.
2. **Normalization:** `normalizer.js` ensures we have a fresh, relational-mapped object (e.g., lookup Driver by `assigned_driver_id`).
3. **L10n:** `LanguageEngine` determines the output mode (Single vs. Trilingual NL→FR→EN).
4. **Rendering:** `TemplateRenderer` injects data into responsive components using the FleetConnect luxury theme.
5. **Dispatch:** `CommunicationService` passes the final HTML and Metadata to the configured `EmailProvider`.

## 4. Provider Abstraction
- **BaseEmailProvider:** Defines `send(to, subject, html, options)`.
- **ResendProvider:** Implements the API call to Resend.
- **MockProvider:** (Default for dev) Intercepts the call and logs the full trilingual payload to the console with a "SUCCESS" simulation.

## 5. Implementation Strategy
- **Surgical Integration:** Triggers will be injected into existing `async` functions (e.g., `confirmBooking`, `assignDriverToBooking`) as non-blocking promises.
- **Backward Compatibility:** Normalizer will handle both UUIDs and legacy object structures during the transition phase.
- **Responsive Design:** Templates will use a single-column layout optimized for Gmail, Outlook, and mobile devices.

## 6. Future-Proofing
- **Onboarding:** Architecture supports `ACCOUNT_CREATED` triggers for future client portals.
- **Extensibility:** Easily add WhatsApp or SMS providers by implementing a new `BaseProvider` subclass.
- **Multi-Brand:** `config.js` allows swapping the theme and logo for different partners or sub-brands.
