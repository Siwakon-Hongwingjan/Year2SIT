# msgboard — self-check deployment lab

A tiny full-stack app you build once, `rsync` to your `int134` VM, and bring up by hand:
static frontend, Node/Express + Prisma API, MySQL, systemd, nginx reverse proxy.

The repo ships **only `frontend/` and `backend/`**. The database grant, the systemd unit, and
the nginx site are *not* files here — you type them on the VM from this sheet. The point is
whether **you** can get it running on a real machine without a walkthrough holding your hand.

```
browser ──▶ nginx :80 ──┬─▶  /            frontend/  (static files)
                        └─▶  /api/...     127.0.0.1:3000  (systemd: msgboard-api)
                                              │
                                              ▼
                                          MySQL  (localhost, user 'msgboard', db 'msgboard')
```

---

## Rules

1. Do it from memory. Look commands up with `--help` and `man`, not the internet.
2. Every step has a **Check** line. Do not move on until the check passes.
3. When something breaks, read the error, form one guess, test that guess. See Troubleshooting.

---

## 0. Prerequisites (on the VM)

This sheet assumes your `int134` VM already has, from earlier classes:

- Node.js 20+ (`node --version`)
- MySQL 8, enabled and running, **not** on a public address (`systemctl is-enabled mysql`, `systemctl is-active mysql`, `sudo ss -tlnp | grep 3306`)
- nginx, enabled and running (`systemctl is-active nginx`)
- SSH access as your own user, and an alias in `~/.ssh/config` (this sheet calls it `int134`)

**Check:** all four commands above answer the way you expect. If not, go back to the class that installed that piece, then come back.

The app lives in **`/srv/msgboard`**, the same place `/srv/school` sat in class 4. Anything
under `/srv` needs `sudo` to create, so make the directory once and hand it to yourself —
owned by you, group `sysadmin`, mode `2775` (the setgid bit keeps that group on everything
`rsync` drops in):

```sh
ssh int134 'sudo install -d -o $USER -g sysadmin -m 2775 /srv/msgboard'
ssh int134 'ls -ld /srv/msgboard'      # drwxrwsr-x ... sysadmin ... /srv/msgboard
```

`/srv/msgboard` is the **source** — it holds `backend/.env` and the whole tree, and nginx
never points at it. What the world gets is a **published copy** of `frontend/` at
**`/var/www/msgboard`**, the same source-vs-docroot split as `/srv/school` vs
`/var/www/school` in class 5. Make that directory too:

```sh
ssh int134 'sudo install -d -o $USER -g sysadmin -m 2775 /var/www/msgboard'
```

---

## 1. Build and test locally

On your laptop, from `msgboard/`:

```sh
cd backend
npm install                 # creates package-lock.json — commit this
npx prisma migrate dev --name init
```

`prisma migrate dev` needs a database URL. Point it at a **local** MySQL just to generate the
migration file — the migration SQL is what ships. After it runs you have
`backend/prisma/migrations/<timestamp>_init/migration.sql`. That folder must be committed and
must sync to the VM.

```sh
npm test                    # validate.js unit tests, no DB needed
```

Run the API against your local DB and click around:

```sh
cp .env.example .env        # edit DATABASE_URL to your local MySQL
npx prisma generate
npm start                   # -> http://127.0.0.1:3000/api/health
```

Serve the frontend any way you like (e.g. `python3 -m http.server` in `frontend/`) and post
a message. The API sends permissive CORS headers, so a frontend on another port works in dev.

**Check:** `npm test` is green. `curl -s localhost:3000/api/health` returns `{"status":"ok"}`.
`curl -sX POST localhost:3000/api/messages -H 'content-type: application/json' -d '{"author":"me","body":"hi"}'`
returns the new row. A bad body (`-d '{}'`) returns **400**, not 500.

---

## 2. rsync to the VM

From `msgboard/` (the folder with `frontend/` and `backend/` in it):

```sh
rsync -avz --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'backend/.env' \
  ./ int134:/srv/msgboard/
```

**How `int134:` finds the VM.** rsync sees the `:` and hands the transport to `ssh int134`.
`int134` is not a real hostname — it's an alias `ssh` looks up in `~/.ssh/config`:

```
Host int134
  HostName lvm68068.sit.kmutt.ac.th
  User sysadmin
```

So the target expands to `sysadmin@lvm68068.sit.kmutt.ac.th:/srv/msgboard/`. Resolution
order `ssh` uses for the name: `~/.ssh/config` → `/etc/ssh/ssh_config` → `/etc/hosts` → DNS.
You can skip the alias and write the full `user@host:path` directly — `known_hosts` (the host
key store, a separate file) still applies either way.

What the excludes are for, and why you should be able to explain each:

| Excluded | Why |
|---|---|
| `node_modules/` | Platform-specific binaries (Prisma engine). You rebuild it on the VM with `npm ci`. |
| `backend/.env` | Secret. It has the DB password. It never leaves your machines in a sync. |
| `.git/` | The VM doesn't need history. |

`--delete` makes the VM copy a **mirror** of your local tree: files you deleted locally get
deleted there too. That is what you want for a redeploy; know that it does this.

**Check:** `ssh int134 ls /srv/msgboard` shows `frontend backend`.
`ssh int134 ls /srv/msgboard/backend/prisma/migrations` shows your `init` migration.
No `.env` on the VM yet.

---

## 3. Database (on the VM)

```sh
ssh int134
```

Pick a password for the app's DB user. Create the database, the user, and the grant — paste
this into the MySQL admin shell (replace `YOUR_DB_PASSWORD`):

```sh
sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS msgboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'msgboard'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';
GRANT ALL PRIVILEGES ON msgboard.* TO 'msgboard'@'localhost';
FLUSH PRIVILEGES;
SQL
```

`GRANT ALL` on the one schema is fine for a lab; production narrows it to
`SELECT, INSERT, UPDATE, DELETE`.

**Check:**

```sh
sudo mysql -e "SHOW DATABASES LIKE 'msgboard';"
sudo mysql -e "SHOW GRANTS FOR 'msgboard'@'localhost';"
MYSQL_PWD='YOUR_DB_PASSWORD' mysql -u msgboard msgboard -e "SELECT 1;"
```

The last one proves the app's user can actually log in. The table does not exist yet —
Prisma makes it in the next step.

---

## 4. Backend (on the VM)

```sh
cd /srv/msgboard/backend
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — same password you just put in MySQL. Host stays `localhost`.
- `PORT=3000`, `HOST=127.0.0.1` — leave them.

Lock down the secret, then install and migrate:

```sh
chmod 600 .env
npm ci
npx prisma generate
npx prisma migrate deploy       # applies migrations/ to the msgboard database
```

`migrate deploy` (not `migrate dev`) is the production form: it applies committed migrations
and never prompts.

Smoke-test it by hand before systemd owns it:

```sh
set -a; . ./.env; set +a
node server.js &
curl -s localhost:3000/api/health
curl -s localhost:3000/api/messages          # -> []
kill %1
```

**Check:** health returns `{"status":"ok"}`, messages returns `[]`. If it throws a Prisma
connection error, your `.env` password and the MySQL password disagree — fix that first.

---

## 5. systemd service (on the VM)

Create `/etc/systemd/system/msgboard-api.service`. Open it with `sudoedit` and paste this,
replacing `YOUR_USER` on the `User=` line:

```sh
sudoedit /etc/systemd/system/msgboard-api.service
```

```ini
[Unit]
Description=msgboard API
After=network.target mysql.service
Wants=mysql.service

[Service]
User=YOUR_USER
WorkingDirectory=/srv/msgboard/backend
EnvironmentFile=/srv/msgboard/backend/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target
```

Then:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now msgboard-api
```

**Check:**

```sh
systemctl status msgboard-api          # active (running), no restart loop
journalctl -u msgboard-api -n 20       # your "listening on http://127.0.0.1:3000" line
curl -s localhost:3000/api/health
sudo ss -tlnp | grep 3000              # bound to 127.0.0.1, NOT 0.0.0.0
```

Why `127.0.0.1` and not `0.0.0.0`: the API has no auth. If it listened on the public
interface, anyone could hit `:3000` directly and skip nginx. Binding localhost means the
only way in is through the proxy.

Restart it once on purpose and watch it come back (`sudo systemctl restart msgboard-api`).
Know the difference: **`daemon-reload`** = re-read the unit *file* after you edit it;
**`restart`** = stop and start the *process*. Editing the file and only doing `restart`
runs the old definition.

---

## 6. nginx reverse proxy (on the VM)

This distro's nginx reads `/etc/nginx/conf.d/*.conf` and nothing else — no
`sites-available` / `sites-enabled` symlink dance. You do this **twice**: first as one plain
server-block file, then refactored into an `include` fragment the way class 5's Part 5 did,
so the site becomes a single line you can comment out.

### 6a. Publish the frontend, then one server-block file

First copy `frontend/` out of the source tree into the document root, flattening modes to
world-readable on the way:

```sh
rsync -a --chmod=D755,F644 --delete /srv/msgboard/frontend/ /var/www/msgboard/
```

`--chmod=D755,F644` forces published dirs to `755` and files to `644` no matter what they
were under `/srv` — no group-write bit travels across. `--delete` keeps `/var/www/msgboard`
an exact mirror of `frontend/`.

Then the server block:

```sh
sudoedit /etc/nginx/conf.d/msgboard.conf
```

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /var/www/msgboard;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Check the syntax, then load it:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

If the packaged default server answers on 80 and clashes — `nginx -t` warns about a duplicate
`default_server`, or `curl localhost/` shows the wrong page — it's in
`/etc/nginx/conf.d/default.conf` (or `/etc/nginx/sites-enabled/default`). Move it out of the
way, don't delete it: `sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.off`,
then reload. nginx only reads `*.conf`, so the renamed file is simply ignored.

Why `root` points at `/var/www/msgboard` and never at `/srv/msgboard/frontend`: the source
tree has `backend/.env` one level up and no guarantee of tidy modes. Point a document root
into `/srv` and one `try_files` miss or a stray `..` can serve your DB password. The
published copy holds only what the browser may see, at `755`/`644`, with nothing above it
worth stealing. `/var/www` is world-traversable by default, so `www-data` reads it with no
extra `chmod` — the **403** you'd hit serving out of `~/` (home dirs are `750`) never comes up.

**Check:**

```sh
curl -s localhost/api/health                 # through nginx now, port 80
curl -s localhost/                            # the HTML
curl -sX POST localhost/api/messages -H 'content-type: application/json' -d '{"author":"vm","body":"hello from nginx"}'
```

### 6b. Split the locations into an include

Same result, different shape: the `location` blocks move into their own file and the server
block pulls them in with one line. A `location` is only legal inside `server {}`, so a lone
fragment named `*.conf` would fail `nginx -t` — name it `.location` and nginx ignores it until
an `include` drops it into place.

Rename the direct file (it's now just *the server that answers on port 80*) and pull the
app's locations out into a fragment:

```sh
sudo mv /etc/nginx/conf.d/msgboard.conf /etc/nginx/conf.d/http-default.conf
sudoedit /etc/nginx/conf.d/msgboard.location
```

`/etc/nginx/conf.d/msgboard.location` — locations only:

```nginx
location / {
    try_files $uri $uri/ =404;
}

location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then edit `http-default.conf`: delete the two `location` blocks from the server block and
replace them with the `include`. `root` and `index` stay — the fragment inherits them:

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /var/www/msgboard;
    index index.html;

    include conf.d/msgboard.location;
}
```

```sh
sudo nginx -t
sudo systemctl reload nginx
```

The `include` path is relative to `/etc/nginx`, so it's `conf.d/msgboard.location`, not the
full path. To take the site offline now: comment out that one `include` line and reload — the
fragment stays on disk for reference. The non-`.conf` suffix is the whole trick: nginx
auto-loads `conf.d/*.conf`, and a stray `location` sitting there directly is a syntax error.

**Check:** the same three `curl`s from 6a still pass.

---

## 7. End-to-end

First confirm the page nginx hands out is the **published** copy, not the source — the file
under `/var/www/msgboard` and the response body should be byte-identical:

```sh
ssh int134 'curl -s localhost/ | diff - /var/www/msgboard/index.html && echo "served copy == /var/www/msgboard"'
```

If that `diff` is non-empty you skipped the `/var/www` republish (section 6a) after a
frontend change — rerun it, then continue.

From your **laptop**:

```sh
curl -s http://int134/api/messages           # use the VM's real host/IP
```

Open `http://<vm-host>/` in a browser. Post a message. Reload — it persists.

Then prove it actually reached the database:

```sh
ssh int134 "MYSQL_PWD='<pw>' mysql -u msgboard msgboard -e 'SELECT id,author,body,createdAt FROM messages ORDER BY id DESC LIMIT 5;'"
```

**Check:** the `diff` is empty, the browser row is in that table. Frontend → `/var/www` →
nginx → Express → Prisma → MySQL all work, and you did it yourself.

---

## 8. The redeploy loop

You changed code locally. To ship it again:

```sh
# laptop
rsync -avz --delete --exclude '.git/' --exclude 'node_modules/' --exclude 'backend/.env' \
  ./ int134:/srv/msgboard/

# VM, only if backend/package.json changed:
cd /srv/msgboard/backend && npm ci && npx prisma generate
# VM, only if you added a migration:
npx prisma migrate deploy
# VM, if frontend/ changed — republish into the document root:
rsync -a --chmod=D755,F644 --delete /srv/msgboard/frontend/ /var/www/msgboard/
# always:
sudo systemctl restart msgboard-api
```

Frontend-only change? The laptop `rsync` plus the `/var/www` republish are enough — nginx
serves the new files immediately, no reload needed. Forget the republish and you'll keep
seeing the old page: the laptop sync only touches `/srv`.

---

## Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| `systemctl status` shows a restart loop | server crashes on boot — bad `.env`, DB unreachable, missing `node_modules` | `journalctl -u msgboard-api -n 50` |
| `curl localhost:3000` → `connection refused` | service not running, or bound to the wrong host | `systemctl status`, `ss -tlnp \| grep 3000` |
| nginx **502 Bad Gateway** | proxy target down — the API isn't on `127.0.0.1:3000` | `curl localhost:3000/api/health` directly |
| nginx **403 Forbidden** on `/` | a directory on the path lacks `o+x`, or `root` points into `/srv` instead of `/var/www` | `namei -l /var/www/msgboard/index.html` |
| `/` shows an old version | forgot to republish `frontend/` into `/var/www/msgboard` after the laptop sync | `ls -l /var/www/msgboard`, compare with `/srv/msgboard/frontend` |
| nginx **404** on `/api/...` | `location /api/` block missing or `proxy_pass` wrong | `sudo nginx -T \| grep -A3 'location /api'` |
| Prisma `P1001 can't reach database` | `.env` password ≠ MySQL password, or MySQL down | `mysql -u msgboard -p`, `systemctl status mysql` |
| `EADDRINUSE :3000` | an old `node server.js` still running | `ss -tlnp \| grep 3000`, `kill` it |
| POST returns 500 not 400 for bad input | validation bypassed — `express.json()` missing or route order wrong | `backend/server.js` |
| `prisma migrate deploy` → "no migration found" | `migrations/` folder didn't sync | `ls backend/prisma/migrations` on the VM |

---

## Self-check questions (answer without looking)

1. Why does the API bind `127.0.0.1` instead of `0.0.0.0`? What would break if it were public?
2. Why is `node_modules/` excluded from `rsync` but `prisma/migrations/` is not?
3. `daemon-reload` vs `restart` — which one after editing the `.service` file? After editing `server.js`?
4. What does `--delete` in the `rsync` line do, and when would it bite you?
5. Where does the DB password live? List every file. Which of them are on the VM?
6. A teammate runs `curl localhost/api/health` on the VM and gets 502. Give three things to check, in order.
7. `migrate dev` vs `migrate deploy` — why does the VM use `deploy`?
8. nginx `root` is `/var/www/msgboard`, a published copy — not `/srv/msgboard/frontend`, the
   source. Name two things that go wrong if you point `root` straight at `/srv/msgboard/frontend`.
9. What does `--chmod=D755,F644` on the publish `rsync` do, and why flatten modes at all?
10. You changed `frontend/index.html`, synced from the laptop, and the browser still shows the
    old page. Which command did you skip?
