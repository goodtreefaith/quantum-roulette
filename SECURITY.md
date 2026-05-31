# Security Policy

## Supported Versions

Quantum Roulette is currently an early-stage open-source project. Security fixes will generally be applied to the latest version on the main branch.

| Version | Supported |
| --- | --- |
| Latest main | Yes |
| Older commits | No |

## Reporting a Vulnerability

Please do not open a public issue for sensitive security reports.

To report a vulnerability, please contact the maintainer privately through GitHub or by email if a contact address is listed on the maintainer profile.

When reporting, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected files or features
- Browser and environment details, if relevant
- Any suggested fix, if available

## Security Scope

This project is a browser-based game/simulation. Current security concerns include:

- Dependency vulnerabilities
- Unsafe client-side input handling
- Build or bundler configuration issues
- Cross-site scripting risks from participant names or user-provided text
- Insecure use of browser APIs
- Future risks from community contributions

## Maintainer Response

The maintainer will review valid reports and prioritize fixes based on severity and impact.

Possible actions may include:

- Patching the vulnerable code
- Updating dependencies
- Adding validation or escaping
- Improving documentation
- Publishing a release note or security notice when appropriate

## Dependency Security

Contributors should avoid adding new dependencies unless they are necessary. New dependencies should be reviewed for maintenance status, package reputation, license compatibility, and known vulnerabilities.
