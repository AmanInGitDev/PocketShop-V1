# Troubleshooting Documentation

This directory contains troubleshooting guides organized by topic.

## 📁 Structure

### `/oauth/` - OAuth Authentication Troubleshooting

All OAuth-related troubleshooting guides are located here.

#### Quick Start
**If OAuth is not working, start here:**
1. [STEP_BY_STEP_FIX.md](oauth/STEP_BY_STEP_FIX.md) - Follow these steps **in order** (don't skip any step)

#### Detailed Guides
- **OAUTH_TROUBLESHOOTING.md** - Comprehensive troubleshooting checklist covering:
  - Google Cloud Console configuration
  - Supabase Dashboard configuration
  - Environment variables
  - Code verification
  - Browser testing
  - Common issues and fixes

- **OAUTH_FIX.md** - Specific fix for "Unable to exchange external code" error:
  - Step-by-step solution
  - Common issues and fixes
  - Quick checklist

- **OAUTH_DEEP_TROUBLESHOOTING.md** - Advanced debugging when basic fixes don't work:
  - OAuth Consent Screen configuration
  - Regenerating Client Secret
  - Supabase project status checks
  - Network tab debugging
  - Creating new OAuth client

- **VERIFY_REDIRECT_URIS.md** - Guide to verify Google Cloud Console redirect URIs:
  - Critical redirect URI check
  - Step-by-step verification
  - Why it matters

## 🔍 Troubleshooting Workflow

### For OAuth Issues:

1. **Start with:** [STEP_BY_STEP_FIX.md](oauth/STEP_BY_STEP_FIX.md)
   - Follow all 12 steps in order
   - Don't skip any step

2. **If still not working:** [OAUTH_TROUBLESHOOTING.md](oauth/OAUTH_TROUBLESHOOTING.md)
   - Comprehensive checklist
   - Detailed verification steps

3. **For specific error "Unable to exchange external code":** [OAUTH_FIX.md](oauth/OAUTH_FIX.md)
   - Focused solution for this specific error

4. **If basic fixes don't work:** [OAUTH_DEEP_TROUBLESHOOTING.md](oauth/OAUTH_DEEP_TROUBLESHOOTING.md)
   - Advanced debugging techniques
   - Deep configuration checks

5. **To verify redirect URIs:** [VERIFY_REDIRECT_URIS.md](oauth/VERIFY_REDIRECT_URIS.md)
   - Critical configuration check

## 📋 Common Issues Quick Reference

| Issue | Quick Fix Guide |
|-------|----------------|
| OAuth not working | [STEP_BY_STEP_FIX.md](oauth/STEP_BY_STEP_FIX.md) |
| "Unable to exchange external code" | [OAUTH_FIX.md](oauth/OAUTH_FIX.md) |
| "redirect_uri_mismatch" | [VERIFY_REDIRECT_URIS.md](oauth/VERIFY_REDIRECT_URIS.md) |
| OAuth button does nothing | [OAUTH_TROUBLESHOOTING.md](oauth/OAUTH_TROUBLESHOOTING.md) |
| Sign-in timed out | [OAUTH_TROUBLESHOOTING.md](oauth/OAUTH_TROUBLESHOOTING.md) |
| Advanced debugging needed | [OAUTH_DEEP_TROUBLESHOOTING.md](oauth/OAUTH_DEEP_TROUBLESHOOTING.md) |

## 🔗 Related Documentation

- **Setup Guides**: [../setup/](../setup/) - Initial setup instructions
- **Configuration**: [../setup/PROJECT_CONFIG_SUMMARY.md](../setup/PROJECT_CONFIG_SUMMARY.md) - Complete config reference
- **Application Flow**: [../guides/END_TO_END_FLOW.md](../guides/END_TO_END_FLOW.md) - Understanding app flow

---

**Note:** Always start with the step-by-step guide before diving into detailed troubleshooting.
