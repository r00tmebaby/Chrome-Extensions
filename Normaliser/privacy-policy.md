# Privacy Policy for Audio Normalizer & EQ (Chrome Extension)

Effective date: November 7, 2025

Audio Normalizer & EQ respects your privacy. This extension does not collect, store, or share any personal information beyond the preferences you explicitly set.

## Data Usage

- The extension operates entirely within your browser using the Web Audio API.
- Audio is processed locally on your device and is never transmitted to any server.
- The extension uses Chrome storage only to save user preferences such as:
  - Equalizer presets
  - Loudness/normalization options
  - Site allowlist preferences
- Preferences are stored using `chrome.storage.local` and/or `chrome.storage.sync` for convenience across devices. This data remains under your browser profile and is not shared with third parties by the extension.

## Permissions

- **`activeTab`**: Allows the extension to access only the current tab when you click the extension icon. This is a privacy-friendly permission that doesn't require broad access.
- **`scripting`**: Used to inject audio processing code into the active tab after you open the popup. The extension does not read or modify webpage content; it only attaches audio processing to media elements.
- **`storage`**: Saves your settings locally (EQ presets, volume preferences, site allowlist, and options).

**Important**: This extension does **not** use `host_permissions` or `<all_urls>`. It only accesses tabs when you explicitly click the extension icon, ensuring maximum privacy and faster Chrome Web Store review.

## Third Parties

- This extension does not use third‑party analytics, tracking, or advertising services.
- The extension does not communicate with external servers.

## Your Consent

By using the extension, you consent to this privacy policy.

## Changes to This Policy

We may update this policy from time to time. If changes are made, the effective date above will be updated accordingly.

## Contact

If you have questions about this policy, please open an issue on the GitHub repository:

- https://github.com/r00tmebaby/Browser-Extensions/tree/master/Normaliser
