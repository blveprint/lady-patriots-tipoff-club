# Deploying to SiteGround

Every push to `main` (including merging a pull request) copies the site to
SiteGround automatically, via `.github/workflows/deploy-siteground.yml`.
Until the secrets below are set, the workflow skips itself with a notice.

The deploy only adds and updates files. It never deletes anything on the
server, so files that exist only on SiteGround are left alone.

## One-time setup

### 1. Create an SSH key in SiteGround

1. **Site Tools → Devs → SSH Keys Manager**.
2. Under **Create New Key**, name it `github-deploy`, set a password, and
   click **Create**.
3. In the key's actions menu (⋮):
   - **SSH Credentials** shows the **Hostname**, **Username** and **Port**
     (usually `18765`).
   - **Private Key** shows the key text. Copy all of it, including the
     `-----BEGIN` and `-----END` lines.

### 2. Find the site folder

In **Site Tools → Site → File Manager**, the site lives in
`www/ladypatriotstipoffclub.org/public_html`. Use that path, relative to
your home folder, unless File Manager shows a different one.

### 3. Add the secrets to GitHub

In the repo, go to **Settings → Secrets and variables → Actions → New
repository secret** and add:

| Secret | Value |
| --- | --- |
| `SITEGROUND_HOST` | Hostname from SSH Credentials |
| `SITEGROUND_USER` | Username from SSH Credentials |
| `SITEGROUND_PORT` | Port from SSH Credentials (defaults to `18765` if omitted) |
| `SITEGROUND_SSH_KEY` | The private key text |
| `SITEGROUND_SSH_PASSPHRASE` | The password you set on the key |
| `SITEGROUND_PATH` | e.g. `www/ladypatriotstipoffclub.org/public_html` |
| `SITEGROUND_KNOWN_HOSTS` | *Optional.* Output of `ssh-keyscan -p 18765 <hostname>` run on your own computer. Pins the server's identity; without it the first connection trusts whatever answers. |

### 4. Test it

1. **Actions → Deploy to SiteGround → Run workflow**. Leave **Dry run**
   checked and click **Run workflow**.
2. Open the run. The **Deploy files** step lists what would change, and
   nothing is copied.
3. If the list looks right, run it again with **Dry run** unchecked.

After that, merges to `main` deploy on their own. If an old page still
shows, purge **Site Tools → Speed → Caching**.
